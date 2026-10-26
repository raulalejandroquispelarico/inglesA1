@echo off
cd /d "%~dp0"
title Inglés A1 - Subir cambios a GitHub

echo ============================================
echo   Ingles A1 - Subir cambios a GitHub
echo ============================================
echo.

echo [1/3] Verificando instalacion de git...
where git >nul 2>nul
if errorlevel 1 (
    echo ERROR: Git no esta instalado.
    echo Descargalo de: https://git-scm.com/
    pause
    exit /b 1
)
echo OK - Git encontrado

echo.
echo [2/3] Preparando cambios...
git add -A
echo OK - Archivos preparados

echo.
echo ============================================
echo   Escribe el comentario del commit:
echo   (o presiona Enter para usar el mensaje por defecto)
echo ============================================
echo.
set /p COMMIT_MSG=Comentario: 

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update %date% %time%
)

echo.
echo [3/3] Subiendo a GitHub...
echo.
git commit -m "%COMMIT_MSG%"
git push origin main

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Si pide usuario y password/token:
    echo   Usuario: tu usuario de GitHub
    echo   Password: tu token de GitHub (no tu password)
    echo ============================================
    echo.
    git push origin main
)

echo.
echo ============================================
echo   Listo! Cambios subidos a GitHub.
echo ============================================
echo.
echo Ve a: https://github.com/raulalejandroquispelarico/inglesA1
echo.
pause
