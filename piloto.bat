@echo off
REM ============================================================
REM  piloto.bat - Arranca el servidor y abre /piloto
REM  Uso: doble click. Cierra la ventana del servidor para parar.
REM ============================================================

cd /d "%~dp0"

echo.
echo === Ingles A1 - Piloto ===
echo.

REM 1. Verificar Bun
where bun >nul 2>nul
IF ERRORLEVEL 1 (
    echo [ERROR] Bun no esta instalado o no esta en el PATH.
    echo Instalalo desde https://bun.sh/
    pause
    exit /b 1
)

REM 2. Verificar node_modules
IF NOT EXIST "node_modules" (
    echo Instalando dependencias...
    call bun install
    IF ERRORLEVEL 1 (
        echo [ERROR] Fallo la instalacion.
        pause
        exit /b 1
    )
)

REM 3. Compilar
echo.
echo Compilando...
call bun run build
IF ERRORLEVEL 1 (
    echo [ERROR] Fallo la compilacion.
    pause
    exit /b 1
)

REM 4. Arrancar servidor en ventana aparte
echo.
echo Arrancando servidor en http://localhost:3000 ...
start "Servidor Ingles A1 - Piloto" cmd /k "bun run start"

REM 5. Esperar 5 segundos
echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

REM 6. Abrir navegador en /piloto
echo Abriendo http://localhost:3000/piloto ...
start http://localhost:3000/piloto

echo.
echo Listo. La ventana del servidor queda abierta.
echo Para detener el servidor, cierra esa ventana.
echo.
pause