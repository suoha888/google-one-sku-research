@echo off
chcp 65001 >nul
title Ultra 30TB - 3 months 1 zhe (US$19.99) BEST
cd /d "%~dp0"
set "PATH=C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9;C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9\Scripts;D:\Codex\tools\platform-tools;%PATH%"
set PYTHONIOENCODING=utf-8

echo ============================================================
echo   Google AI Ultra (30 TB / 20x)   *** BEST DEAL ***
echo   SKU: g1.ai.ultra.3months_ip_90p.acq
echo   First 3 MONTHS: US$19.99/month  (1 zhe)
echo   From month 4:   US$199.99/month
echo   3-MONTH TOTAL:  US$59.97   (normal US$599.97, save US$540)
echo ============================================================
echo.

python ultra0.py --account "current@device" --no-add --force --allow-paid --sku g1.ai.ultra.3months_ip_90p.acq

echo.
pause
