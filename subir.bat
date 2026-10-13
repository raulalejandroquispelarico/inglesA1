@echo off
REM Script para subir proyecto a GitHub

REM Cambiar al directorio del proyecto
cd /d D:\IA\inglesA1

REM Pedir mensaje de commit
set /p msg=Escribe el mensaje de commit: 

REM Agregar todos los archivos
git add .

REM Crear commit con el mensaje ingresado
git commit -m "%msg%"

REM Subir al repositorio remoto (forzando si es necesario)
git push origin main --force

echo.
echo Proyecto subido correctamente a GitHub con el mensaje: "%msg%"
pause
