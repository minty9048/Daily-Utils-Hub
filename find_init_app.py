with open("script.js", "r", encoding="utf-8", errors="replace") as f:
    for idx, line in enumerate(f, 1):
        if "function initializeApp" in line:
            print(f"{idx}: {line.strip()}")
