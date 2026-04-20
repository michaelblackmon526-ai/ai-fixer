@echo off
echo !!! TENZA RETAIL: NUCLEAR CLEANUP STARTING !!!
echo Closing all Node processes...
taskkill /F /IM node.exe /T >nul 2>&1

cd /d "C:\Users\micha\Documents\ai-fixer-desktop"

echo Removing Sabotaged Components...
del /q "voice engine*" >nul 2>&1
del /q "marketplace *" >nul 2>&1
del /q "daemon *" >nul 2>&1
del /q "ui components *" >nul 2>&1
del /q "ui animations*" >nul 2>&1
del /q "ui layout.css" >nul 2>&1
del /q "ui shortcuts.js" >nul 2>&1
del /q "utils logger.js" >nul 2>&1
del /q "utils checksum.js" >nul 2>&1
del /q "utils debounce.js" >nul 2>&1
del /q "utils throttle.js" >nul 2>&1
del /q "utils envLoader.js" >nul 2>&1
del /q "utils pathTools.js" >nul 2>&1
del /q "utils taskQueue.js" >nul 2>&1
del /q "utils fileBackup.js" >nul 2>&1
del /q "utils fileWriter.js" >nul 2>&1
del /q "utils streamParser.js" >nul 2>&1
del /q "utils diffGenerator.js" >nul 2>&1
del /q "utils modelSelector.js" >nul 2>&1
del /q "utils validatePatch.js" >nul 2>&1
del /q "utils errorFormatter.js" >nul 2>&1
del /q "WIRING_DIAGRAM.html" >nul 2>&1
del /q "debug.log" >nul 2>&1
del /q "errors.log" >nul 2>&1
del /q "HELP.txt" >nul 2>&1

echo Removing Sabotaged Directories...
rd /s /q "AI_DROP" >nul 2>&1
rd /s /q "Fixed_Fixer_Core" >nul 2>&1
rd /s /q "local-file-bridge" >nul 2>&1
rd /s /q "test-project" >nul 2>&1
rd /s /q "renderer_index.html" >nul 2>&1

echo !!! CLEANUP COMPLETE: ONLY PURE ENGINE REMAINS !!!
pause
