with open('node_modules/next/dist/compiled/@next/font/dist/google/loader.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = 'const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];'
replacement = 'const m = /\\.(woff|woff2|eot|ttf|otf)/i.exec(googleFontFileUrl); const ext = m ? m[1] : "woff2";'

if target in c:
    c = c.replace(target, replacement)
    with open('node_modules/next/dist/compiled/@next/font/dist/google/loader.js', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Patched successfully')
else:
    print('Already patched or not found')
