@echo off
cd /d "%~dp0"
title Inglés A1 - Modo desarrollo

echo ============================================
echo   Ingles A1 - Modo desarrollo (solo PC)
echo ============================================
echo.
echo ATENCION: Este modo es SOLO para desarrollo en la PC.
echo   NO funciona para acceder desde el celular.
echo   Para el celular usa: start.bat
echo.
echo Presiona Ctrl+C para detener
echo.

call bun run dev
pause
