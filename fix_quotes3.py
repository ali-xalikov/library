with open('src/components/layout/Navbar.tsx', 'r', encoding='utf-16') as fh:
    c = fh.read()
fixed = c.replace(chr(39)+chr(39), chr(39))
with open('src/components/layout/Navbar.tsx', 'w', encoding='utf-8') as fh:
    fh.write(fixed)
print('Navbar done')
