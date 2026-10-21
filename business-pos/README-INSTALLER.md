# Creating an Installer for Grameen POS

You have two options to create an installer:

## Option 1: Inno Setup (Recommended - Easier)

1. **Download and Install Inno Setup** (Free):
   - Visit: https://jrsoftware.org/isinfo.php
   - Download and install Inno Setup Compiler

2. **Create the Installer**:
   - Open `Installer.iss` in Inno Setup Compiler
   - Click "Build" → "Compile" (or press F9)
   - The installer will be created at: `bin\Release\GrameenPOS-Setup.exe`

3. **The installer will**:
   - Install the application to `C:\Program Files\GrameenPOS`
   - Create Start Menu shortcuts
   - Optionally create Desktop shortcut
   - Include all files including the Fonts folder
   - Create an uninstaller

## Option 2: WiX Toolset (Advanced)

1. **Download and Install WiX Toolset**:
   - Visit: https://wixtoolset.org/
   - Download and install WiX Toolset v4 (or v3)

2. **Create the Installer**:
   - First, publish the application:
     ```
     dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=false
     ```
   - Run the PowerShell script:
     ```
     .\create-installer.ps1
     ```
   - The MSI installer will be created at: `bin\Release\GrameenPOS.msi`

## Quick Start (Inno Setup)

1. Install Inno Setup
2. Open `Installer.iss` in Inno Setup Compiler
3. Press F9 to compile
4. Find `GrameenPOS-Setup.exe` in `bin\Release\`

The installer is a single EXE file that can be distributed and installed on any Windows computer.

