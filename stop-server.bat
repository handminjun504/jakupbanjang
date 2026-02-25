@echo off
chcp 65001 >nul
echo ========================================
echo   작업반장 서버 종료
echo ========================================

echo Node.js 서버 종료 중...
taskkill /f /im node.exe 2>nul
echo Cloudflare Tunnel 종료 중...
taskkill /f /im cloudflared.exe 2>nul

echo.
echo 서버가 종료되었습니다.
pause
