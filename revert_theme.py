import os

replacements = {
    '#FFFFFF': '#121212',
    '#0A0A0A': '#FAF9F6',
    '#171717': '#F5F2ED',
    '#A78BFA': '#C5A880',
    '#E5E5E5': '#2d2d2d',
    '#8B5CF6': '#b59870',
    '#262626': '#E8E4DD',
    '#FAFAFA': '#18181A',
    '#F4F4F5': '#1C1C1E',
}

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        new_content = new_content.replace(old.lower(), new)
        
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
