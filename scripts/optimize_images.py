"""Build responsive WebP assets without changing the Figma source images.
Requires Pillow. Run from the project root: python3 scripts/optimize_images.py
"""
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1] / 'images' / 'brand-core'
for source in root.glob('*.png'):
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original)
        for width in (480, 960):
            image = original.copy()
            image.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
            image.save(source.with_name(f'{source.stem}-{width}.webp'), 'WEBP', quality=82, method=6)
print('Source PNGs:', sum(p.stat().st_size for p in root.glob('*.png')))
print('480px WebP set:', sum(p.stat().st_size for p in root.glob('*-480.webp')))
print('960px WebP set:', sum(p.stat().st_size for p in root.glob('*-960.webp')))
