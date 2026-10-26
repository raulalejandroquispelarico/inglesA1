@echo off
cd /d "%~dp0"
title Inglés A1 - Actualizar desde GitHub

echo ============================================
echo   Ingles A1 - Actualizar desde GitHub
echo ============================================
echo.

echo [1/2] Descargando cambios...
git pull origin main

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo descargar. Verifica:
    echo   1. Tienes conexion a internet
    echo   2. Git esta instalado
    echo   3. Estas en la carpeta correcta
    pause
    exit /b 1
)
echo OK - Cambios descargados

echo.
echo [2/2] Instalando dependencias si cambiaron...
if exist "package.json" (
    call bun install
    echo OK - Dependencias actualizadas
)

echo.
echo ============================================
echo   Actualizacion completada!
echo ============================================
echo.
echo Para ejecutar la app, usa: iniciar.bat
echo.
pause
