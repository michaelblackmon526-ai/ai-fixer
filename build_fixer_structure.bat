@echo off
rem Create directories
mkdir engine
mkdir backend
mkdir ui
mkdir config
mkdir scripts
mkdir data

rem Create placeholder files
echo Placeholder for engine > engine\placeholder.txt
type nul > backend\placeholder.txt
echo Placeholder for ui > ui\placeholder.txt
type nul > config\placeholder.txt
echo Placeholder for scripts > scripts\placeholder.txt
type nul > data\placeholder.txt
