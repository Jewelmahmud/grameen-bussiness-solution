; Inno Setup Script for Grameen POS
; Requires Inno Setup to be installed: https://jrsoftware.org/isinfo.php
#define BuildStamp GetDateTimeString('yyyyMMdd-HHmmss', '', '')

[Setup]
AppName=Grameen POS
AppVersion=1.0.0
AppPublisher=Grameen Bazaar
AppPublisherURL=https://grameenbazaar.com
UninstallDisplayIcon={app}\GrameenPOS.exe
DefaultDirName={autopf}\GrameenPOS
DefaultGroupName=Grameen POS
AllowNoIcons=yes
LicenseFile=
OutputDir=bin\Release
OutputBaseFilename=GrameenPOS-Setup-{#BuildStamp}
SetupIconFile=assets\logo.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1

[Files]
Source: "bin\Release\net8.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Exclude logs folder
Source: "bin\Release\net8.0-windows\win-x64\publish\*"; DestDir: "{app}"; Excludes: "logs\*"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Grameen POS"; Filename: "{app}\GrameenPOS.exe"; IconFilename: "{app}\GrameenPOS.exe"
Name: "{group}\{cm:UninstallProgram,Grameen POS}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Grameen POS"; Filename: "{app}\GrameenPOS.exe"; Tasks: desktopicon; IconFilename: "{app}\GrameenPOS.exe"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Grameen POS"; Filename: "{app}\GrameenPOS.exe"; Tasks: quicklaunchicon; IconFilename: "{app}\GrameenPOS.exe"

[Run]
Filename: "{app}\GrameenPOS.exe"; Description: "{cm:LaunchProgram,Grameen POS}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

