@echo off
REM Build script for dashboard-example (Windows)
REM This script minifies CSS and JavaScript files for production

echo Starting build process...

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js and npm.
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Create dist directory
echo Creating dist directory...
if not exist "dist" mkdir dist
if not exist "dist\styles" mkdir dist\styles
if not exist "dist\scripts" mkdir dist\scripts

REM Minify CSS
echo Minifying CSS...
call npx clean-css-cli styles\style.css -o dist\styles\style.min.css
call npx clean-css-cli styles\glass-card.css -o dist\styles\glass-card.min.css

REM Minify JavaScript files
echo Minifying JavaScript files...
for %%f in (scripts\*.js) do (
    call npx terser "%%f" -o "dist\scripts\%%~nf.min.js" --compress --mangle
)

REM Create bundled version
echo Creating JavaScript bundle...
call npx terser scripts\*.js -o dist\scripts\bundle.min.js --compress --mangle

echo.
echo Build complete!
echo Output directory: dist\
echo.
echo To use minified files, update your HTML:
echo   ^<link rel="stylesheet" href="dist/styles/style.min.css"^>
echo   ^<script src="dist/scripts/bundle.min.js"^>^</script^>

pause
