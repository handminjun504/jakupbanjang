@echo off
chcp 65001 >nul
title jakupbanjang Server + Cloudflare Tunnel

echo ========================================
echo  jakupbanjang 서버 시작
echo ========================================
echo.

set CLOUDFLARED="%LOCALAPPDATA%\Microsoft\WinGet\Links\cloudflared.exe"

:: 서버 디렉토리로 이동
cd /d "%~dp0server"

:: node_modules 확인
if not exist "node_modules" (
    echo [1/3] npm install 실행중...
    npm install
    echo.
)

:: 서버를 백그라운드로 시작
echo [2/3] 서버 시작 (포트 3001)...
start "jakupbanjang-server" cmd /c "node index.js"

:: 서버가 뜰 때까지 잠시 대기
timeout /t 3 /nobreak >nul

:: cloudflared 터널 실행
echo [3/3] Cloudflare Tunnel 시작...
echo.
echo  터널이 시작되면 아래에 URL이 표시됩니다.
echo  그 URL을 Vercel 환경변수 REACT_APP_API_URL에 설정하세요.
echo ========================================
echo.

%CLOUDFLARED% tunnel --url http://localhost:3001

pause
