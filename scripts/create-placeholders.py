#!/usr/bin/env python3
"""Generate placeholder images for the project."""

from PIL import Image, ImageDraw, ImageFont
import os

def create_solid_image(width, height, color, text=None, output_path=None):
    """Create a solid color image with optional text."""
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    if text:
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', max(20, min(width, height) // 10))
        except:
            font = ImageFont.load_default()
        
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, fill='white', font=font)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, quality=90)
        print(f"Created: {output_path}")
    
    return img

def main():
    # Directory setup
    base_dir = "/home/alex/work/sss/static/images"
    
    # Hero image - Brand gradient simulation (brand-600 is a rose/pink color)
    create_solid_image(
        1200, 800,
        (225, 29, 72),  # Rose/pink brand color
        "Hero - Sewing Course",
        f"{base_dir}/hero-sewing.jpg"
    )
    
    # Instructor photo - Portrait
    create_solid_image(
        800, 800,
        (120, 100, 80),  # Warm skin tone
        "Instructor - Skyler",
        f"{base_dir}/skyler.jpg"
    )
    
    # Author avatar - Small square
    create_solid_image(
        200, 200,
        (120, 100, 80),
        "S",
        f"{base_dir}/skyler-avatar.jpg"
    )
    
    # Velvet fabric placeholder
    create_solid_image(
        800, 600,
        (75, 0, 50),  # Dark purple/red velvet color
        "Velvet Fabric",
        f"{base_dir}/velvet.jpg"
    )
    
    # Favicon - Small square icon
    create_solid_image(
        32, 32,
        (225, 29, 72),
        None,
        "/home/alex/work/sss/static/favicon.png"
    )
    
    print("\n✅ All placeholder images created successfully!")

if __name__ == "__main__":
    main()
