# PowerShell script to create an installer using WiX Toolset
# Requires WiX Toolset to be installed: https://wixtoolset.org/docs/wix3/

param(
    [string]$OutputPath = "bin\Release\net8.0-windows\win-x64\publish"
)

Write-Host "Creating MSI Installer for Grameen POS..." -ForegroundColor Green

# Check if WiX is installed
$wixPath = Get-Command heat.exe -ErrorAction SilentlyContinue
if (-not $wixPath) {
    Write-Host "WiX Toolset not found. Please install WiX Toolset from https://wixtoolset.org/" -ForegroundColor Red
    Write-Host "Or use Inno Setup (free) from https://jrsoftware.org/isinfo.php" -ForegroundColor Yellow
    exit 1
}

$publishPath = Resolve-Path $OutputPath
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$wxsFile = Join-Path $projectDir "Installer.wxs"
$msiOutput = Join-Path $projectDir "bin\Release\GrameenPOS.msi"

Write-Host "Publish path: $publishPath" -ForegroundColor Cyan
Write-Host "WXS file: $wxsFile" -ForegroundColor Cyan
Write-Host "MSI output: $msiOutput" -ForegroundColor Cyan

# Create WXS file
$wxsContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://wixtoolset.org/schemas/v4/wxs">
  <Package Name="Grameen POS"
           Manufacturer="Grameen Bazaar"
           Version="1.0.0"
           UpgradeCode="B8B8B8B8-B8B8-B8B8-B8B8-B8B8B8B8B8B8"
           Description="Grameen Point of Sale System"
           Compressed="yes">
    
    <MajorUpgrade DowngradeErrorMessage="A newer version of [ProductName] is already installed." />
    <MediaTemplate EmbedCab="yes" />
    
    <StandardDirectory Id="ProgramFiles6432Folder">
      <Directory Id="INSTALLFOLDER" Name="GrameenPOS" />
    </StandardDirectory>
    
    <StandardDirectory Id="ApplicationProgramsFolder" />
    <StandardDirectory Id="DesktopFolder" />
    
    <Icon Id="ApplicationIcon.ico" SourceFile="$projectDir\assets\logo.ico" />
    <Property Id="ARPPRODUCTICON" Value="ApplicationIcon.ico" />
    
    <Feature Id="ProductFeature" Title="Grameen POS" Level="1">
      <ComponentGroupRef Id="ApplicationFiles" />
    </Feature>
    
    <UI>
      <UIRef Id="WixUI_Minimal" />
    </UI>
  </Package>
  
  <Fragment>
    <ComponentGroup Id="ApplicationFiles" Directory="INSTALLFOLDER">
      <Component>
        <File Source="$publishPath\GrameenPOS.exe" KeyPath="yes">
          <Shortcut Id="ApplicationStartMenuShortcut"
                    Directory="ApplicationProgramsFolder"
                    Name="Grameen POS"
                    WorkingDirectory="INSTALLFOLDER"
                    Icon="ApplicationIcon.ico" />
          <Shortcut Id="ApplicationDesktopShortcut"
                    Directory="DesktopFolder"
                    Name="Grameen POS"
                    WorkingDirectory="INSTALLFOLDER"
                    Icon="ApplicationIcon.ico" />
        </File>
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
"@

Set-Content -Path $wxsFile -Value $wxsContent

# Generate component files using heat
$heatOutput = Join-Path $projectDir "Installer.Generated.wxs"
& heat.exe dir "$publishPath" -cg ApplicationFiles -gg -sfrag -srd -dr INSTALLFOLDER -out "$heatOutput" -var var.PublishPath

# Compile and link
$wixObj = Join-Path $projectDir "Installer.wixobj"
& candle.exe "$wxsFile" -out "$wixObj" -dPublishPath="$publishPath"
& light.exe "$wixObj" "$heatOutput" -out "$msiOutput" -ext WixUIExtension

Write-Host "`nInstaller created successfully: $msiOutput" -ForegroundColor Green

