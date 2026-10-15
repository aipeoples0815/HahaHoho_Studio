@echo off
cd /d "%~dp0"
echo =========================================================
echo   Hahahoho Studio GitHub Force-Deploy
echo =========================================================
echo.

if exist "patch_files\.gitignore" (
    copy /Y "patch_files\.gitignore" ".gitignore" > nul
)

git status > nul 2>&1
if %errorlevel% neq 0 (
    git init
    git branch -M main
)

git add .
git commit -m "feat: apply v5.3 face editing rules patch"

git remote remove origin > nul 2>&1
git remote add origin https://github.com/aipeoples0815/HahaHoho_Studio.git
git push -u origin main --force
pause