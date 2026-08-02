with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

in_grid = False
grid_start = 384
for idx in range(grid_start, len(lines)):
    line = lines[idx].strip()
    if 'class="dashboard-grid"' in line:
        in_grid = True
    # Count opening and closing divs to find the matching closing div
    # Wait, a simpler way is to search for where the next section or container starts
    if '<!--' in line and 'Card' not in line and 'dashboard' not in line.lower():
        print(f"Grid end might be around line {idx + 1}: {line}")
        break
