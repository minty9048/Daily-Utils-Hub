with open("styles.css", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if any(k in line for k in [".header-nav", ".nav-list", ".nav-item", ".header", "header-container"]):
        print(f"{idx}: {line.strip()}")
