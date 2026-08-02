with open(r"C:\Users\Pratik\.gemini\antigravity\scratch\daily-utils-hub\script.js", "r", encoding="utf-8") as f:
    in_func = False
    brace_count = 0
    func_lines = []
    for i, line in enumerate(f, 1):
        if "function switchSection" in line:
            in_func = True
        if in_func:
            func_lines.append(f"{i}: {line.strip()}")
            brace_count += line.count("{") - line.count("}")
            if brace_count == 0 and len(func_lines) > 1:
                break
    for line in func_lines:
        print(line)
