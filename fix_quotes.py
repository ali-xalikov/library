with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
fixed = c.replace(chr(39)+chr(39), chr(39))
with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed)
print('Done')
