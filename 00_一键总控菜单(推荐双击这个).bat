@echo off

chcp 65001 >nul

title Google AI Ultra / Pro 一键下单总控台 (已预装 Frida 16.5.9 & 离线模块)

cd /d "%~dp0"

set "PATH=C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9;C:\Users\KALOS\AppData\Local\easyclaw\ai\tool_cache\resources\tools\win\python-3.11.9\Scripts;D:\Codex\tools\platform-tools;%PATH%"

set PYTHONIOENCODING=utf-8



:MENU

cls

echo ====================================================================

echo   Google AI Ultra / Pro 一键下单总控台 (环境已就绪: Python 3.11 + Frida 16.5.9)

echo ====================================================================

echo   [0] 环境自检 (连 MuMu + 推送离线 frida-server + 推送计费模块)

echo   [1] 零风险查资格 (一次性扫 4 个 Ultra 促销档 + Pro 5TB 免费档，不拉收银台)

echo   [2] 全量扫描 70 个隐藏 SKU (调用上游 google-one-tools\scan_all.py，零风险)

echo   --------------------------------------------------------------------

echo   [3] ★推文同款：Ultra 30TB (20x) 前3个月 1折 ($19.99/月)  [g1.ai.ultra.3months_ip_90p.acq]

echo   [4] Ultra 20TB (5x)  前3个月 1折 ($9.99/月)             [g1.20tb.3months_ip_90p]

echo   [5] Ultra 20TB (5x)  前3个月 2折 ($19.99/月)            [g1.20tb.3months_ip_80p]

echo   [6] Ultra 30TB (20x) 前3个月 2.5折 ($49.99/月)          [g1.ai.ultra.3months_ip_75p.acq]

echo   --------------------------------------------------------------------

echo   [7] ★免费白嫖：AI Pro 5TB 免费 12 个月 ($0，第1步)       [12months-eft]

echo   [8] ★免费叠加：AI Pro 5TB 叠加 +6 个月 ($0，第2步→18个月) [6months-eft]

echo   [9] ★免费叠加：AI Pro 5TB 叠加 +6 个月 ($0，第3步→24个月) [6months-eft-2]

echo   [A] 免费备用：AI Pro 5TB 叠加 +6 个月 ($0，备用包)       [6months-eft-ss-2026]

echo   [B] 免费单开：AI Pro 5TB 免费 3 个月 ($0，单开不叠加)    [eft-3mo]

echo   --------------------------------------------------------------------

echo   [M] 启动 MuMu模拟器12 官方安装器 (00_点我安装MuMu模拟器12.bat)

echo   [Q] 退出

echo ====================================================================

set /p choice=请输入选项编号并按回车: 



if /I "%choice%"=="0" (

    python ultra0.py --check

    pause

    goto MENU

)

if /I "%choice%"=="1" (

    python query_sku.py g1.ai.ultra.3months_ip_90p.acq g1.20tb.3months_ip_90p g1.20tb.3months_ip_80p g1.ai.ultra.3months_ip_75p.acq g1.2tb.ai.subs_variant g1.play.2tb.ai

    pause

    goto MENU

)

if /I "%choice%"=="2" (

    python "D:\Codex\google-ultra-script\google-one-tools\scan_all.py"

    pause

    goto MENU

)

if /I "%choice%"=="3" (

    python ultra0.py --account "current@device" --no-add --force --allow-paid --sku g1.ai.ultra.3months_ip_90p.acq

    pause

    goto MENU

)

if /I "%choice%"=="4" (

    python ultra0.py --account "current@device" --no-add --force --allow-paid --sku g1.20tb.3months_ip_90p

    pause

    goto MENU

)

if /I "%choice%"=="5" (

    python ultra0.py --account "current@device" --no-add --force --allow-paid --sku g1.20tb.3months_ip_80p

    pause

    goto MENU

)

if /I "%choice%"=="6" (

    python ultra0.py --account "current@device" --no-add --force --allow-paid --sku g1.ai.ultra.3months_ip_75p.acq

    pause

    goto MENU

)

if /I "%choice%"=="7" (

    python ultra0.py --account "current@device" --no-add --force --plan pro12

    pause

    goto MENU

)

if /I "%choice%"=="8" (

    python ultra0.py --account "current@device" --no-add --force --stack --plan pro6

    pause

    goto MENU

)

if /I "%choice%"=="9" (

    python ultra0.py --account "current@device" --no-add --force --stack --plan pro6b

    pause

    goto MENU

)

if /I "%choice%"=="A" (

    python ultra0.py --account "current@device" --no-add --force --stack --plan pro6c

    pause

    goto MENU

)

if /I "%choice%"=="B" (

    python ultra0.py --account "current@device" --no-add --force --plan pro3

    pause

    goto MENU

)

if /I "%choice%"=="M" (

    pushd "C:\_Vault_D\Codex\google-ultra-script" && start "" "C:\_Vault_D\Codex\google-ultra-script\MuMu12_Setup.exe" && popd

    goto MENU

)

if /I "%choice%"=="Q" exit /b 0

goto MENU

