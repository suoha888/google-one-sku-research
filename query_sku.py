"""query_sku.py —— 查指定商品 ID 的所有 offer（零风险，只查不拉收银台）

用法: python query_sku.py g1.2tb.ai.subs_variant [其它SKU...]
"""
import json
import sys
import threading
import time

from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import frida
import ultra0


def main():
    skus = sys.argv[1:] or [
        "g1.ai.ultra.3months_ip_90p.acq",
        "g1.20tb.3months_ip_90p",
        "g1.20tb.3months_ip_80p",
        "g1.ai.ultra.3months_ip_75p.acq",
        "g1.2tb.ai.subs_variant",
    ]
    ultra0.ADB = ultra0.find_adb()
    ultra0.pick_device()
    ultra0.ensure_root()
    ultra0.ensure_module_apk()
    ultra0.ensure_vending()

    pid = ultra0.launch_app()
    if not pid:
        raise SystemExit("❌ 没找到或无法启动 Google One 进程")

    try:
        dev = frida.get_device(ultra0.SERIAL, timeout=10) if ultra0.SERIAL else frida.get_usb_device(timeout=10)
    except Exception:
        dev = frida.get_usb_device(timeout=10)

    js = ultra0.build_js("5x", list_only=True, allow_paid=True)
    js = js.replace('var PRODUCTS=["g1.play.20tb"];', 'var PRODUCTS=' + json.dumps(skus) + ';', 1)

    sess = dev.attach(pid)
    done = threading.Event()
    offers = []

    def on_msg(m, d):
        p = m.get("payload") or {}
        if p.get("ev") == "offer":
            offers.append(p)
        elif p.get("ev") in ("list_only", "no_trial", "query_err", "no_offers", "boot_err", "boot_fail"):
            done.set()

    sc = sess.create_script(js)
    sc.on("message", on_msg)
    sc.load()
    done.wait(timeout=25)
    time.sleep(1)

    print(f"\n=== 查询 SKU: {', '.join(skus)} ===")
    if not offers:
        print("  （没有任何 offer 返回：可能该账号已有订阅、地区不支持或该 SKU 已被 Google 下架）")
    for o in offers:
        micros = str(o.get("micros"))
        price = "免费 $0" if micros == "0" else (f"${int(micros)/1_000_000:.2f}" if micros.isdigit() else micros)
        print(f"  product={str(o.get('product')):32s} offerId={str(o.get('id')):20s} {price:>9s}  {o.get('period')}  [{o.get('title') or o.get('name') or ''}]")
        print(f"      token={o.get('token')}")
    try:
        sess.detach()
    except Exception:
        pass


if __name__ == "__main__":
    main()
