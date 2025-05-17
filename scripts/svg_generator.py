import os


def svg_line(x1, y1, x2, y2):
    return f'    <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#000" stroke-width="60" stroke-linecap="square"/>'


def corpus_gate_svg(
    closed=True,
    gate_roots=[False, False, False, False],
    rotate180=False,
    filename="corpus_gate.svg",
):
    # gate_roots: [gate, root1, root2, root3] -- each is True/False
    svg = []
    svg.append('<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">')
    if rotate180:
        svg.append('  <g transform="rotate(180 500 500)">')

    # Frame (always same: top, left, right vertical bars)
    svg.append('    <rect width="1000" height="1000" fill="#fff"/>')
    svg.append(svg_line(200, 200, 800, 200))  # Top
    svg.append(svg_line(200, 200, 200, 800))  # Left
    svg.append(svg_line(800, 200, 800, 800))  # Right

    # Roots/feet (positions: bottom to top)
    y_positions = [800, 700, 600, 500]  # Example: gate + up to 3 "roots" above it

    # Left feet/roots (closed = into frame, open = out of frame)
    for i, present in enumerate(gate_roots):
        if present:
            y = y_positions[i]
            if closed:
                # Closed (inward): feet/roots go INTO frame
                svg.append(svg_line(200, y, 400, y))  # left to right
            else:
                # Open (outward): feet/roots go OUT OF frame (left)
                svg.append(svg_line(200, y, 0, y))
    # Right feet/roots (closed = into frame, open = out of frame)
    for i, present in enumerate(gate_roots):
        if present:
            y = y_positions[i]
            if closed:
                svg.append(svg_line(800, y, 600, y))  # right to left
            else:
                svg.append(svg_line(800, y, 1000, y))

    if rotate180:
        svg.append("  </g>")
    svg.append("</svg>")
    return "\n".join(svg)


# --- Generate all 16 Corpus Gates (8 closed, 8 open) ---

# Each entry is a list of True/False indicating which roots are present (from gate up to root3)
# Example: [True, False, False, False] is gate only; [True, True, False, False] is gate + root1, etc.
all_gates = [
    [True, False, False, False],  # Gate 1 / 9 (only gate)
    [True, True, False, False],  # Gate 2 / 10 (gate + root1)
    [True, False, True, False],  # Gate 3 / 11 (gate + root2)
    [True, False, False, True],  # Gate 4 / 12 (gate + root3)
    [True, True, True, False],  # Gate 5 / 13 (gate + root1 + root2)
    [True, True, False, True],  # Gate 6 / 14 (gate + root1 + root3)
    [True, False, True, True],  # Gate 7 / 15 (gate + root2 + root3)
    [True, True, True, True],  # Gate 8 / 16 (gate + root1 + root2 + root3)
]

# Create glyphs directory if it doesn't exist
os.makedirs("glyphs", exist_ok=True)

for idx, roots in enumerate(all_gates):
    # Closed (inward) version
    svg_closed = corpus_gate_svg(closed=True, gate_roots=roots, rotate180=False)
    with open(f"glyphs/corpus_gate_{idx+1}.svg", "w") as f:
        f.write(svg_closed)
    # Open (outward) version
    svg_open = corpus_gate_svg(closed=False, gate_roots=roots, rotate180=True)
    with open(f"glyphs/corpus_gate_{idx+9}.svg", "w") as f:
        f.write(svg_open)

print("All 16 Corpus Gates generated in the glyphs directory!")
