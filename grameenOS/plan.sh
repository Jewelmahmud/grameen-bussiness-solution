#!/usr/bin/env bash
# build-grameenos.sh
# Usage: sudo bash build-grameenos.sh
# Make sure you run on a clean Ubuntu/Zorin machine (20.04/22.04/23.10 family).
# Requires: apt packages: git live-build debootstrap squashfs-tools genisoimage syslinux-utils xorriso
# This script automates a full extract->customize->repack pipeline.
set -euo pipefail
IFS=$'\n\t'

### CONFIGURATION - EDIT THESE BEFORE RUNNING ###
OS_NAME="GrameenOS"
OS_VERSION="1.0"
ISO_LABEL="GrameenOS"
# Path to downloaded Zorin ISO on your build machine
ZORIN_ISO_PATH="/path/to/zorin.iso"   # <<< --- CHANGE to your downloaded Zorin ISO
OUTPUT_DIR="$PWD/grameen-build"
WORK_DIR="$OUTPUT_DIR/work"
EXTRACT_DIR="$WORK_DIR/extract-cd"
CHROOT_DIR="$WORK_DIR/edit"
OUTPUT_ISO="$PWD/${OS_NAME,,}-${OS_VERSION}.iso"  # e.g., grameenos-1.0.iso
DEFAULT_USER="grameen"
DEFAULT_USER_FULLNAME="Grameen Employee"
DEFAULT_USER_PASS="ChangeMe123!"   # You should change/rotate this after install
APT_MIRROR="http://archive.ubuntu.com/ubuntu"    # change if you want local mirror
# Packages to install in the chroot (apt)
APT_PACKAGES=(
  "libreoffice"
  "gimp"
  "kdenlive"
  "shotcut"            # may require snap/flatpak depending on distro; we'll try apt
  "curl"
  "wget"
  "ca-certificates"
  "ufw"
  "fail2ban"
  "apparmor"
  "apparmor-utils"
  "unattended-upgrades"
  "vim"
  "net-tools"
  "policykit-1"
  "gnome-software"     # app center (optional)
)
# Optional: flatpak apps (if you prefer)
FLATPAK_APPS=(
  "org.libreoffice.LibreOffice"
  "org.gimp.GIMP"
  "org.kde.kdenlive"
  "org.shotcut.Shotcut"
)
# Brave needs special repo (we'll configure in chroot). You can remove if unwanted.

### END CONFIGURATION ###

echo "Starting GrameenOS build in $OUTPUT_DIR"
sudo apt update
sudo apt install -y git live-build debootstrap squashfs-tools genisoimage xorriso syslinux-utils isolinux

# Create directories
rm -rf "$OUTPUT_DIR"
mkdir -p "$WORK_DIR" "$EXTRACT_DIR" "$CHROOT_DIR"

# 1) Mount and extract ISO
if [ ! -f "$ZORIN_ISO_PATH" ]; then
  echo "ERROR: Zorin ISO not found at $ZORIN_ISO_PATH. Download an appropriate Zorin ISO and set ZORIN_ISO_PATH."
  exit 1
fi

echo "Extracting ISO..."
mkdir -p "$WORK_DIR/iso-mount"
sudo mount -o loop "$ZORIN_ISO_PATH" "$WORK_DIR/iso-mount"
rsync -a --exclude=/casper/filesystem.squashfs "$WORK_DIR/iso-mount/" "$EXTRACT_DIR/"
sudo unsquashfs -f -d "$CHROOT_DIR" "$WORK_DIR/iso-mount/casper/filesystem.squashfs"
sudo umount "$WORK_DIR/iso-mount"
rm -rf "$WORK_DIR/iso-mount"

# 2) Prepare chroot environment (copy resolv, mount proc/dev if needed inside chroot run)
sudo cp /etc/resolv.conf "$CHROOT_DIR/etc/"

# 3) Create chroot setup script (this runs INSIDE chroot)
cat > "$WORK_DIR/chroot-setup.sh" <<'CHROOT_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# 0. Basic apt setup
apt update -y
apt install -y --no-install-recommends apt-transport-https ca-certificates gnupg lsb-release

# Add Brave browser repo
BRAVE_KEYRING="/usr/share/keyrings/brave-browser-archive-keyring.gpg"
if [ ! -f "$BRAVE_KEYRING" ]; then
  curl -fsSL https://brave-browser-apt-release.s3.brave.com/brave-core.asc | gpg --dearmor -o "$BRAVE_KEYRING"
  echo "deb [signed-by=$BRAVE_KEYRING arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" \
    > /etc/apt/sources.list.d/brave-browser-release.list
fi

# Update and install APT packages (list injected by outer script)
apt update -y

# Install core packages (placeholder list will be replaced by outer script)
apt install -y --no-install-recommends {{APT_PACKAGES_PLACEHOLDER}}

# Install Brave
apt install -y --no-install-recommends brave-browser || true

# OPTIONAL: install flatpak & add flathub
apt install -y flatpak || true
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo || true

# Add default user
useradd -m -s /bin/bash -G sudo "{{DEFAULT_USER}}" || true
echo "{{DEFAULT_USER}}:{{DEFAULT_USER_PASS}}" | chpasswd

# Set sensible hostname
echo "{{OS_NAME_LOWER}}" > /etc/hostname

# Change release info
cat > /etc/os-release <<EOF
NAME="{{OS_NAME}}"
VERSION="{{OS_VERSION}}"
ID=grameen
PRETTY_NAME="{{OS_NAME}} {{OS_VERSION}}"
VERSION_ID="{{OS_VERSION}}"
HOME_URL="https://example.com"
SUPPORT_URL="https://example.com"
EOF

# Add branding placeholders (replace files later)
mkdir -p /usr/share/backgrounds/grameen
# NOTE: actual wallpaper images must be copied into the edit fs before repacking.
# Create a basic default wallpaper file as placeholder
echo "GrameenOS Default Wallpaper" > /usr/share/backgrounds/grameen/README.txt

# Security hardening (baseline)
#  - enable UFW with basic rules
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh || true
ufw --force enable || true

#  - fail2ban default
systemctl enable fail2ban || true

#  - enable AppArmor
systemctl enable apparmor || true

#  - unattended-upgrades for automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades || true

# Remove snap if you prefer (optional - commented)
# snap remove --purge snapd || true

# Clean apt caches
apt autoremove -y
apt clean
rm -rf /var/lib/apt/lists/*

# Set /etc/skel customizations (new-user defaults)
mkdir -p /etc/skel/Desktop
cat > /etc/skel/Desktop/Welcome.desktop <<'DESK'
[Desktop Entry]
Name=Welcome to {{OS_NAME}}
Type=Application
Exec=gnome-software
Icon=help-about
Comment=Open software center
DESK

echo "Chroot setup finished."
CHROOT_SCRIPT

# Replace placeholders in chroot script and prepare to copy into chroot
APT_PACKAGES_CSV="$(printf "%s " "${APT_PACKAGES[@]}")"
# Escape slashes just in case
CHROOT_SCRIPT_PATH="$WORK_DIR/chroot-setup.sh"
sed -i "s|{{APT_PACKAGES_PLACEHOLDER}}|$APT_PACKAGES_CSV|" "$CHROOT_SCRIPT_PATH"
sed -i "s|{{DEFAULT_USER}}|$DEFAULT_USER|" "$CHROOT_SCRIPT_PATH"
sed -i "s|{{DEFAULT_USER_PASS}}|$DEFAULT_USER_PASS|" "$CHROOT_SCRIPT_PATH"
sed -i "s|{{OS_NAME_LOWER}}|$(echo $OS_NAME | tr '[:upper:]' '[:lower:]')|" "$CHROOT_SCRIPT_PATH"
sed -i "s|{{OS_NAME}}|$OS_NAME|" "$CHROOT_SCRIPT_PATH"
sed -i "s|{{OS_VERSION}}|$OS_VERSION|" "$CHROOT_SCRIPT_PATH"

# Copy the chroot script inside edit and run it
sudo cp "$CHROOT_SCRIPT_PATH" "$CHROOT_DIR/root/chroot-setup.sh"
sudo chmod +x "$CHROOT_DIR/root/chroot-setup.sh"

# Mount necessary pseudo-filesystems and chroot-run
for fs in proc sys dev; do
  sudo mount --bind /$fs "$CHROOT_DIR/$fs"
done

echo "Entering chroot to run setup (this runs the chroot-setup script inside the edit filesystem)."
sudo chroot "$CHROOT_DIR" /root/chroot-setup.sh

# Unmount pseudo-filesystems
for fs in proc sys dev; do
  sudo umount "$CHROOT_DIR/$fs"
done

# Clean up resolv copy
sudo rm -f "$CHROOT_DIR/etc/resolv.conf" || true

# 4) Recompute manifest and recreate squashfs
echo "Updating manifests and rebuilding squashfs..."
sudo chmod +w "$EXTRACT_DIR/casper/filesystem.manifest"
sudo chroot "$CHROOT_DIR" dpkg-query -W --showformat='${Package} ${Version}\n' \
  > "$EXTRACT_DIR/casper/filesystem.manifest"

sudo cp "$EXTRACT_DIR/casper/filesystem.manifest" "$EXTRACT_DIR/casper/filesystem.manifest-desktop" || true

# Remove apt lists to reduce size, then rebuild
sudo rm -f "$CHROOT_DIR/var/lib/apt/lists/*"
sudo mksquashfs "$CHROOT_DIR" "$EXTRACT_DIR/casper/filesystem.squashfs" -comp xz -e boot || true

# Update filesystem.size
sudo du -sx --block-size=1 "$CHROOT_DIR" | cut -f1 > "$EXTRACT_DIR/casper/filesystem.size"

# Generate new ISO
echo "Generating final ISO..."
cd "$EXTRACT_DIR"
sudo xorriso -as mkisofs \
  -r -V "$ISO_LABEL" \
  -J -l -b isolinux/isolinux.bin -c isolinux/boot.cat \
  -no-emul-boot -boot-load-size 4 -boot-info-table \
  -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot -isohybrid-gpt-basdat \
  -o "$OUTPUT_ISO" .

echo "ISO created at: $OUTPUT_ISO"
echo "Done. Recommended next steps: test ISO in VM, copy real wallpaper/logo files into CHROOT_DIR before final rebuild if you want branded visuals."

# end of script
