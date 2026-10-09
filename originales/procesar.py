# Recorta, endereza y mejora las fotos de las obras sin alterar la pintura:
#  1. Corrección de perspectiva a partir de las 4 esquinas de la obra.
#  2. Niveles automáticos que conservan el tono (no cambian los colores de la obra).
#  3. Ampliación moderada (Lanczos) y enfoque suave para fotos de WhatsApp.
#  4. Exporta dos tamaños: grande (visor) y mini (museo 3D y miniaturas).
import sys, json
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter

GRANDE, MINI = 1600, 800

def esquinas(spec):
    c = spec.get('quad')
    if c: return c
    x0, y0, x1, y1 = spec.get('crop', (0, 0, 1, 1))
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

def procesar(origen, destino_grande, destino_mini, spec):
    im = ImageOps.exif_transpose(Image.open(origen)).convert('RGB')
    W, H = im.size
    q = [(x * W, y * H) for x, y in esquinas(spec)]
    dist = lambda a, b: ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** .5
    ancho = round((dist(q[0], q[1]) + dist(q[3], q[2])) / 2)
    alto = round((dist(q[0], q[3]) + dist(q[1], q[2])) / 2)
    # Ampliación moderada: como máximo 1,35x y nunca más de GRANDE en el lado largo
    escala = min(1.35, GRANDE / max(ancho, alto))
    ow, oh = round(ancho * escala), round(alto * escala)
    # QUAD: esquinas en orden superior-izq, inferior-izq, inferior-der, superior-der
    datos = (*q[0], *q[3], *q[2], *q[1])
    im = im.transform((ow, oh), Image.Transform.QUAD, datos, resample=Image.Resampling.BICUBIC)
    if not spec.get('sin_niveles'):
        im = ImageOps.autocontrast(im, cutoff=(0.4, 0.4), preserve_tone=True)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
    opciones = dict(quality=80, optimize=True, progressive=True)
    destino_grande.parent.mkdir(parents=True, exist_ok=True); destino_mini.parent.mkdir(parents=True, exist_ok=True)
    im.save(destino_grande, **opciones)
    mini = im.copy(); mini.thumbnail((MINI, MINI), Image.Resampling.LANCZOS)
    mini.save(destino_mini, **dict(opciones, quality=78))
    return ow, oh

if __name__ == '__main__':
    lista = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    raiz = Path(sys.argv[2])
    for e in lista:
        g = raiz / e['salida']; m = g.parent / 'mini' / g.name
        w, h = procesar(Path(e['origen']), g, m, e)
        print(f"{e['salida']}: {w}x{h}")
