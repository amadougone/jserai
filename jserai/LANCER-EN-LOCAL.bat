@echo off
chcp 65001 >nul
title J'serai - test en local
cd /d "%~dp0"
echo.
echo  Demarrage du site J'serai en local...
echo  Adresse : http://localhost:8000
echo  (laissez cette fenetre ouverte ; fermez-la pour arreter)
echo.
where python >nul 2>nul && goto :python
where py >nul 2>nul && goto :py
for /d %%D in ("C:\wamp64\bin\php\php*" "C:\wamp\bin\php\php*") do if exist "%%~D\php.exe" set "PHPEXE=%%~D\php.exe"
if defined PHPEXE goto :php
echo.
echo  Ni Python ni PHP trouves. Solution simple : copiez ce dossier dans
echo  le dossier "www" de WAMP, puis ouvrez http://localhost/jserai/
echo.
pause
goto :eof
:python
start "" http://localhost:8000
python -m http.server 8000
goto :eof
:py
start "" http://localhost:8000
py -m http.server 8000
goto :eof
:php
start "" http://localhost:8000
"%PHPEXE%" -S localhost:8000
goto :eof
