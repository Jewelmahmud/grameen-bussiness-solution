# How to Run Grameen POS Application

## Prerequisites

1. **Install .NET 8 SDK**
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0
   - Choose the SDK (not just Runtime) for Windows x64
   - After installation, restart your terminal/IDE

2. **Verify Installation**
   ```powershell
   dotnet --version
   ```
   Should show version 8.x.x or higher

## Running the Application

### Option 1: Using Command Line (Terminal/PowerShell)

1. **Open PowerShell or Command Prompt**

2. **Navigate to project directory**
   ```powershell
   cd E:\Projects\grameen-pos
   ```

3. **Restore NuGet packages** (first time only)
   ```powershell
   dotnet restore
   ```

4. **Build the project**
   ```powershell
   dotnet build
   ```

5. **Run the application**
   ```powershell
   dotnet run
   ```

### Option 2: Using Visual Studio 2022

1. **Open Visual Studio 2022**
   - Make sure you have ".NET desktop development" workload installed

2. **Open the project**
   - File → Open → Project/Solution
   - Navigate to `E:\Projects\grameen-pos\GrameenPOS.csproj`

3. **Restore packages** (if prompted)
   - Right-click on solution → Restore NuGet Packages

4. **Build the project**
   - Press `Ctrl+Shift+B` or Build → Build Solution

5. **Run the application**
   - Press `F5` or click the green "Start" button

### Option 3: Using Visual Studio Code

1. **Open VS Code**

2. **Install C# Extension**
   - Open Extensions (Ctrl+Shift+X)
   - Search for "C#" by Microsoft
   - Install it

3. **Open the project folder**
   - File → Open Folder
   - Select `E:\Projects\grameen-pos`

4. **Restore and build**
   - Open Terminal (Ctrl+`)
   - Run: `dotnet restore`
   - Run: `dotnet build`

5. **Run the application**
   - Press `F5` or run: `dotnet run`

## What You Should See

When the application runs, you should see:

1. **Login Screen** with Bangla text:
   - Title: "গ্রামীণ পিওএস"
   - Username field: "ব্যবহারকারীর নাম"
   - Password field: "পাসওয়ার্ড"
   - Remember Me checkbox: "আমাকে মনে রাখুন"
   - Login button: "লগইন"

2. **After login** (you'll need to implement actual authentication), you'll see the **POS Screen** with:
   - Product search bar
   - Product grid
   - Shopping cart panel
   - Payment buttons

## Troubleshooting

### Issue: "No .NET SDKs were found"
**Solution:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0

### Issue: "Package restore failed"
**Solution:** 
```powershell
dotnet nuget locals all --clear
dotnet restore
```

### Issue: Build errors
**Solution:**
1. Make sure all files are saved
2. Clean and rebuild:
   ```powershell
   dotnet clean
   dotnet build
   ```

### Issue: Font not displaying correctly
**Solution:**
1. Verify `kalpurush.ttf` is in the `Fonts` folder
2. Check the log file in `logs` folder for font loading messages
3. Rebuild the project to ensure font is copied to output directory

### Issue: Application crashes on startup
**Solution:**
1. Check the log file: `logs/grameen-pos-[date].log`
2. Make sure SQLite database can be created (check permissions)
3. Verify `appsettings.json` exists in the project root

## Development Tips

- **Hot Reload:** While running, you can edit XAML files and see changes with hot reload
- **Debugging:** Set breakpoints in C# code and press F5 in Visual Studio
- **Logs:** Check `logs` folder for application logs
- **Database:** SQLite database is created automatically in: `%LocalAppData%\GrameenPOS\pos.db`

## Next Steps

After running successfully:
1. Test the login screen UI
2. Implement actual API authentication
3. Add test products to see the POS screen
4. Configure printer settings
5. Test barcode scanner integration

