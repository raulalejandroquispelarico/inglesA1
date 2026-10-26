@echo off
cd /d "%~dp0"
title Inglés A1 - Iniciar aplicacion

echo ============================================
echo   Ingles A1 - Iniciar aplicacion
echo ============================================
echo.

echo Verificando instalacion...
if not exist "node_modules" (
    echo.
    echo Instalando dependencias por primera vez...
    call bun install
    call bun run db:generate
)

if not exist ".next" (
    echo.
    echo Compilando aplicacion...
    call bun run build
    if errorlevel 1 (
        echo ERROR: Error en la compilacion
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo   Iniciando servidor...
echo.
echo   PC:       http://localhost:3000
echo   Celular:  http://TU_IP:3000
echo   Piloto:   http://localhost:3000/piloto
echo.
echo   Presiona Ctrl+C para detener
echo ============================================
echo.

call bun run start
pause
