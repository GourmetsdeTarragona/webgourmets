@echo off
echo.
echo ================================================
echo  Gourmets de Tarragona - Pujar a GitHub
echo ================================================
echo.

:: Comprova que Git esta instal·lat
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no esta instal·lat.
    echo Baixa'l de: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Ves a la carpeta on esta aquest fitxer
cd /d "%~dp0"

echo Inicialitzant repositori Git...
git init

echo.
echo Configurant repositori remot...
git remote remove origin 2>nul
git remote add origin https://github.com/GourmetsdeTarragona/webgourmets.git

echo.
echo Afegint tots els fitxers...
git add .

echo.
echo Fent commit...
git commit -m "Versio inicial - index + assets + imatges"

echo.
echo Canviant a branca main...
git branch -M main

echo.
echo ================================================
echo  Pujant a GitHub...
echo  Et demanarà usuari i contrasenya (o token)
echo ================================================
echo.
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ================================================
    echo  PUJAT CORRECTAMENT!
    echo.
    echo  El teu lloc web estara disponible a:
    echo  https://GourmetsdeTarragona.github.io/webgourmets/
    echo.
    echo  Recorda activar GitHub Pages a:
    echo  github.com/GourmetsdeTarragona/gourmets-tarragona
    echo  Settings - Pages - Branch: main / root - Save
    echo ================================================
) else (
    echo ERROR en pujar. Comprova:
    echo  1. El repositori existeix a GitHub
    echo  2. Tens permisos d'escriptura
    echo  3. El token/contrasenya es correcte
)
echo.
pause
