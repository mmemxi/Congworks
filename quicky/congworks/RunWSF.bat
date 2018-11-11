echo off
cd /d %~dp0
set token=c:\temp\quicky\%1.txt
cscript %~2 //Nologo >%token%
