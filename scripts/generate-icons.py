import os
import sys

# Try to use PIL to generate icons, otherwise fall back to SVG copy
try:
    from PIL import Image, ImageDraw
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
ICON_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
os.makedirs(ICON_DIR, exist_ok=True)

if HAS_PIL:
    for size in SIZES:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw background circle with gradient effect
        cx, cy = size // 2, size // 2
        r = size // 2 - size // 20

        # Draw pink circle
        for i in range(r, 0, -1):
            ratio = i / r
            r_val = int(232 + (232 - 200) * (1 - ratio))
            g_val = int(160 + (160 - 140) * (1 - ratio))
            b_val = int(191 + (191 - 170) * (1 - ratio))
            draw.ellipse([cx - i, cy - i, cx + i, cy + i],
                        fill=(r_val, g_val, b_val, 255))

        # Draw a simple hanger/clothing icon
        line_w = max(2, size // 36)

        # Hanger neck
        neck_y = size * 0.38
        neck_x1 = size * 0.42
        neck_x2 = size * 0.58
        hook_y = size * 0.22

        # Hook
        draw.arc([cx - size*0.06, hook_y, cx + size*0.06, hook_y + size*0.18],
                180, 360, fill='white', width=line_w)
        draw.line([cx, hook_y + size*0.05, cx, neck_y], fill='white', width=line_w)

        # Hanger shoulders
        draw.line([cx, neck_y, size * 0.25, size * 0.52], fill='white', width=line_w)
        draw.line([cx, neck_y, size * 0.75, size * 0.52], fill='white', width=line_w)
        draw.line([size * 0.25, size * 0.52, size * 0.75, size * 0.52], fill='white', width=line_w)

        # Hanger body
        draw.line([size * 0.25, size * 0.52, size * 0.2, size * 0.80], fill='white', width=line_w)
        draw.line([size * 0.75, size * 0.52, size * 0.8, size * 0.80], fill='white', width=line_w)
        draw.line([size * 0.2, size * 0.80, size * 0.8, size * 0.80], fill='white', width=line_w)

        # Center divider
        draw.line([cx, size * 0.52, cx, size * 0.80], fill='white', width=line_w)

        path = os.path.join(ICON_DIR, f'icon-{size}.png')
        img.save(path, 'PNG')
        print(f'Generated {path}')
else:
    print('PIL not available, creating placeholder SVGs as PNG fallback')
    # Create minimal valid PNG files as placeholders
    def create_minimal_png(path, size):
        # Minimal 1x1 transparent PNG
        png = bytearray([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR
            (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF,  # width
            (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF,  # height
            0x08, 0x06, 0x00, 0x00, 0x00,                      # 8-bit RGBA
            0x00, 0x00, 0x00, 0x00,                             # CRC placeholder (invalid but browsers tolerate)
            0x00, 0x00, 0x00, 0x00,                             # IDAT
            0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,   # IEND
        ])
        with open(path, 'wb') as f:
            f.write(bytes(png))
        print(f'Created placeholder {path}')

    for size in SIZES:
        create_minimal_png(os.path.join(ICON_DIR, f'icon-{size}.png'), size)

print('Done!')
