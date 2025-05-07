@echo off
echo Installing Cursor Memory Probe extension...
echo.

echo Step 1: Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies.
    exit /b %ERRORLEVEL%
)
echo Dependencies installed successfully.
echo.

echo Step 2: Compiling TypeScript...
call npm run compile
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to compile TypeScript.
    exit /b %ERRORLEVEL%
)
echo TypeScript compiled successfully.
echo.

echo Step 3: Running tests...
call npm run test
if %ERRORLEVEL% neq 0 (
    echo Error: Tests failed.
    exit /b %ERRORLEVEL%
)
echo Tests completed successfully.
echo.

echo Installation completed successfully!
echo.
echo To launch the extension in VS Code:
echo 1. Open VS Code
echo 2. Open this folder (cursor-memory-bank-augmented)
echo 3. Press F5 to launch the Extension Development Host
echo.
echo To configure Cursor to use the MCP server:
echo 1. Open Cursor
echo 2. Go to Settings -^> MCP
echo 3. Add the following configuration:
echo.
echo {
echo   "mcpServers": {
echo     "memory-probe": { "command": "node", "args": ["%CD%\dist\memoryServer.js"] }
echo   }
echo }
echo.
echo Thank you for using Cursor Memory Probe!