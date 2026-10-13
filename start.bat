@echo off
cd /d "%~dp0"
title Inglés A1 - Servidor

echo ============================================
echo   Ingles A1 - Iniciando servidor
echo ============================================
echo.

echo [1/2] Verificando instalacion...
if not exist "node_modules" (
    echo.
    echo ERROR: node_modules no encontrado.
    echo Ejecuta primero: install.bat
    echo.
    pause
    exit /b 1
)

if not exist ".next" (
    echo.
    echo [2/2] Compilando aplicacion (primera vez)...
    call bun run build
    if errorlevel 1 (
        echo.
        echo ERROR: Error en el build
        pause
        exit /b 1
    )
    echo OK - Compilacion exitosa
) else (
    echo OK - Build anterior encontrado
    echo.
    echo Si modificaste codigo, ejecuta: rebuild.bat
)

echo.
echo ============================================
echo   Acceso desde la PC:
echo       http://localhost:3000
echo.
echo   Acceso desde el celular (mismo WiFi):
echo       http://TU_IP:3000
echo.
echo   Para ver tu IP: ejecuta ipconfig
echo ============================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call bun run start
pause
