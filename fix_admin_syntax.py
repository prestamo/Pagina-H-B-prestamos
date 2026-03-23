with open('src/js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('window.printSolicitud = async (id) => {')

if start_idx != -1:
    prefix = content[:start_idx]
    suffix = content[start_idx:]
    suffix = suffix.replace('\\`', '`').replace('\\$', '$')
    
    with open('src/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(prefix + suffix)
    print("Fixed syntax errors")
else:
    print("Function not found")
