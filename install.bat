@echo off
cd /d "%~dp0"
title Inglés A1 - Instalación

echo ============================================
echo   Inglés A1 - Instalacion del proyecto
echo ============================================
echo.

echo [1/3] Verificando Bun...
where bun >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Bun no esta instalado.
    echo.
    echo Para instalar Bun:
    echo   1. Abre PowerShell como administrador
    echo   2. Ejecuta: irm bun.sh/install.ps1 ^| iex
    echo   3. Reinicia CMD y vuelve a ejecutar este .bat
    echo.
    pause
    exit /b 1
)
echo OK - Bun encontrado

echo.
echo [2/3] Instalando dependencias...
call bun install
if errorlevel 1 (
    echo.
    echo ERROR: Error instalando dependencias
    pause
    exit /b 1
)
echo OK - Dependencias instaladas

echo.
echo [3/3] Generando cliente de base de datos...
call bun run db:generate
if errorlevel 1 (
    echo.
    echo ERROR: Error generando Prisma
    pause
    exit /b 1
)
echo OK - Base de datos configurada

echo.
echo ============================================
echo   Instalacion completada
echo ============================================
echo.
echo Ahora puedes ejecutar: start.bat
echo.
pause
