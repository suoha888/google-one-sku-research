@echo off
chcp 65001 >nul
title Query Ultra Promo SKUs (NO purchase)
cd /d "%~dp0"
set "PATH=C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9;C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9\Scripts;D:\Codex\tools\platform-tools;%PATH%"
set PYTHONIOENCODING=utf-8
echo ============================================================
echo   Query all 4 Ultra Promo SKUs + Pro 5TB (NO purchase)
echo ============================================================
python query_sku.py g1.ai.ultra.3months_ip_90p.acq g1.20tb.3months_ip_90p g1.20tb.3months_ip_80p g1.ai.ultra.3months_ip_75p.acq g1.2tb.ai.subs_variant
echo.
pause
