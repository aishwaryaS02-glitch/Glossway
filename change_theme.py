import os
import re

replacements = {
    '#121212': '#FFFFFF',
    '#FAF9F6': '#0A0A0A',
    '#F5F2ED': '#171717',
    '#C5A880': '#A78BFA',
    '#2d2d2d': '#E5E5E5', # For the hover state of #121212
    '#b59870': '#8B5CF6', # For the hover state of #C5A880
    '#E8E4DD': '#262626',
    '#18181A': '#FAFAFA',
    '#1C1C1E': '#F4F4F5',
}

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    # For #121212, it could be followed by opacity like #12121250
    # The string replacement will just replace #121212 with #FFFFFF, and the 50 will remain, making it #FFFFFF50, which is perfectly valid!
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        # Also handle lowercase variants just in case
        new_content = new_content.replace(old.lower(), new)
        
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
