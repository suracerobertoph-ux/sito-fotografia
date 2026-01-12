#!/bin/bash

# Directory setup
IMG_DIR="assets/images"
THUMB_DIR="assets/thumbnails"

mkdir -p "$THUMB_DIR"

echo "Generating thumbnails..."

# Loop through all jpg files in images directory
for img in "$IMG_DIR"/*.jpg; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        thumb_path="$THUMB_DIR/$filename"
        
        # Check if thumbnail already exists
        if [ ! -f "$thumb_path" ]; then
            echo "Processing $filename..."
            # Resize to max width 600px, maintain aspect ratio
            sips -Z 600 "$img" --out "$thumb_path" > /dev/null
        else
            echo "Thumbnail for $filename already exists."
        fi
    fi
done

echo "Done! Thumbnails generated in $THUMB_DIR"
