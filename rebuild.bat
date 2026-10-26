@echo off
cd /d "%~dp0"
title Inglés A1 - Recompilar

echo ============================================
echo   Ingles A1 - Recompilar aplicacion
echo ============================================
echo.
echo Recompilando despues de cambios en el codigo...
echo.

echo [1/1] Compilando...
call bun run build
if errorlevel 1 (
    echo.
    echo ERROR: Error en el build
    pause
    exit /b 1
)
echo OK - Compilacion exitosa

echo.
echo Listo. Ahora ejecuta: start.bat
echo.
pause
