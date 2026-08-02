with open("script.js", "r", encoding="utf-8", errors="replace") as f:
    for idx, line in enumerate(f, 1):
        if "search" in line.lower() and ("click" in line.lower() or "event" in line.lower() or "switch" in line.lower()):
            print(f"{idx}: {line.strip()}")
