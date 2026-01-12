import sys
print("Starting script...")
try:
    from PIL import Image
    print("PIL imported")
    img = Image.open("/Users/robertosurace/.gemini/antigravity/brain/410af4ba-9a03-4814-97f8-90b0f15de2a4/uploaded_image_1765646513367.png")
    color = img.getpixel((0, 0))
    hex_color = '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
    print(f"COLOR:{hex_color}")
    with open('color.txt', 'w') as f:
        f.write(hex_color)
except ImportError:
    print("PIL not found")
except Exception as e:
    print(f"Error: {e}")
