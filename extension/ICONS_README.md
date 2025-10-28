# Extension Icons

The extension requires three icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Creation Options:

### Option 1: Use an online icon generator
Visit https://www.favicon-generator.org/ and upload any image to generate all sizes.

### Option 2: Create simple colored squares (for testing)
Run this command to create basic placeholder icons:

```bash
# For macOS (requires Python with PIL):
pip install pillow
python3 -c "
from PIL import Image
for size in [16, 48, 128]:
    img = Image.new('RGB', (size, size), color='#0969da')
    img.save(f'icon{size}.png')
"
```

### Option 3: Use emoji/text as icon
You can also temporarily modify the manifest.json to remove the icon references for development purposes.

For now, the extension will work in development mode even without icons - Chrome will use a default icon.
