@echo off
title Fixer Bridge + Ollama
echo Starting Ollama...
start "" ollama serve
echo Starting Fixer Local Bridge...
cd "C:\Users\micha\Desktop\ai-fixer-desktop"
node localFileBridge.js
pause
