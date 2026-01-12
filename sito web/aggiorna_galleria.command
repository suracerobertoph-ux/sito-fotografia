#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

OUTPUT_FILE="gallery_data.js"

echo "Aggiornamento galleria in corso..."

# Start writing the JS file
echo "/**" > $OUTPUT_FILE
echo " * CONFIGURAZIONE GENERATA AUTOMATICAMENTE" >> $OUTPUT_FILE
echo " * Non modificare questo file manualmente." >> $OUTPUT_FILE
echo " * Usa lo script 'aggiorna_galleria.command' dopo aver aggiunto le foto." >> $OUTPUT_FILE
echo " */" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "var GALLERY_DATA = {" >> $OUTPUT_FILE

# Function to add images from a folder
add_images() {
    folder_name=$1
    echo "    $folder_name: [" >> $OUTPUT_FILE
    
    # Check if folder exists
    if [ -d "assets/images/$folder_name" ]; then
        # Loop through jpg, jpeg, png, webp (case insensitive handled by ls if possible, simple approach here)
        for img in assets/images/$folder_name/*; do
            # Check if it is a file and has image extension
            if [[ -f "$img" && "$img" =~ \.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$ ]]; then
                # Clean path? No, keep relative
                echo "        { src: '$img' }," >> $OUTPUT_FILE
            fi
        done
    fi
    
    echo "    ]," >> $OUTPUT_FILE
}

# Add Ritratti
add_images "ritratti"

# Add Paesaggio
add_images "paesaggio"

# Function to get single image
get_single_image() {
    key=$1
    folder=$2
    found="false"
    
    if [ -d "assets/images/$folder" ]; then
        for img in "assets/images/$folder"/*; do
            if [[ -f "$img" && "$img" =~ \.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$ ]]; then
                echo "    $key: '$img'," >> $OUTPUT_FILE
                found="true"
                break
            fi
        done
    fi
    
    if [ "$found" == "false" ]; then
        echo "    $key: ''," >> $OUTPUT_FILE
    fi
}

# Add Homepage
get_single_image "homepage" "homepage"

# Add About
get_single_image "about" "about"

echo "};" >> $OUTPUT_FILE

echo "Galleria aggiornata con successo! Ora puoi aprire index.html"
