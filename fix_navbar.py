for enc in ['utf-8','utf-8-sig','cp1252','latin-1']:
    try:
        with open('src/components/layout/Navbar.tsx','r',encoding=enc) as f:
            c=f.read()
        print('OK',enc)
        fixed=c.replace(chr(39)+chr(39),chr(39))
        with open('src/components/layout/Navbar.tsx','w',encoding='utf-8') as f:
            f.write(fixed)
        print('Saved')
        break
    except Exception as e:
        print(enc,e)
