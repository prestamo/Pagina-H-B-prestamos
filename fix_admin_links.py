import os

admin_dir = r'c:\Users\Yer Perez\Desktop\Pagina-H-B-prestamos-1\admin'
html_files = [f for f in os.listdir(admin_dir) if f.endswith('.html')]

links = [
    'index.html', 'banners.html', 'carousel.html', 'promotions.html',
    'cuotas.html', 'footer.html', 'solicitudes_list.html', 
    'solicitudes.html', 'clientes.html'
]

for fn in html_files:
    file_path = os.path.join(admin_dir, fn)
    print(f"Processing {fn}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for link in links:
        # Replace relative link with absolute path from root
        old_href = f'href="{link}"'
        new_href = f'href="/admin/{link}"'
        content = content.replace(old_href, new_href)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done!")
