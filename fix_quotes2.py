import os
files = [
    'src/components/layout/Layout.tsx',
    'src/components/layout/Navbar.tsx',
]
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        c = fh.read()
    fixed = c.replace(chr(39)+chr(39), chr(39))
    with open(f, 'w', encoding='utf-8') as fh:
        fh.write(fixed)
    print(f, 'done')
