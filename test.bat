@echo off
:: Run npm tests from the project root regardless of the current working directory.
:: Usage: test.bat [vitest options]
cd /d "%~dp0"
npm run test -- %*
