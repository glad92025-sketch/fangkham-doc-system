@echo off
chcp 65001 > nul
title ระบบจัดเก็บเอกสาร อบต.ฝางคำ

:: โหลด Environment Variables ล่าสุด
set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"

echo ========================================================
echo       ระบบจัดเก็บเอกสารและผลการปฏิบัติงาน อบต.ฝางคำ
echo ========================================================
echo.
echo  กำลังเปิดเว็บเซิร์ฟเวอร์...
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo  [OK] เปิดเว็บที่: http://localhost:8000
    echo.
    echo  (สามารถเข้าใช้งานด้วยเบอร์โทรศัพท์ของเจ้าหน้าที่ทั้ง 54 ท่าน รหัสผ่าน Fk@123456)
    echo.
    node preview-server.js
) else (
    where php >nul 2>nul
    if %errorlevel% equ 0 (
        php artisan serve
    ) else (
        echo [!] กรุณาติดตั้ง PHP หรือ Node.js ก่อนเริ่มใช้งาน
        pause
    )
)
