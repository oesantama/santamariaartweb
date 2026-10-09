# Tabla de obras: índice de la foto, archivo de salida y esquinas de la obra en la foto (fracciones)
import json, sys, os
import subprocess
ls = lambda d: subprocess.run(['ls', d], capture_output=True, text=True).stdout.split('\n')[:-1]
E = ls('originales/exposicion'); V = ls('originales/vendidas')
e = lambda i: 'originales/exposicion/' + E[i]
v = lambda i: 'originales/vendidas/' + V[i]
A = 'originales/anteriores/'
L = [
 # Exposición de noviembre
 (e(0),  'img/obras/los-abuelos.jpg',            {'crop': (.004, .05, .993, .958)}),
 (e(1),  'img/obras/mujer-con-orquideas.jpg',    {'crop': (.014, .058, .982, .943)}),
 (e(2),  'img/obras/flatiron.jpg',               {'crop': (.012, .006, .985, .962)}),
 (e(3),  'img/obras/manhattan-desde-el-rio.jpg', {'crop': (.006, .006, .983, .968)}),
 (e(4),  'img/obras/tarde-en-el-muelle.jpg',     {'quad': [(.087, .016), (.928, .014), (.938, .952), (.083, .958)]}),
 (e(5),  'img/obras/mirada-en-grafito.jpg',      {'crop': (.006, .022, .965, .955)}),
 (e(6),  'img/obras/soy-yo-y-que.jpg',           {'quad': [(.012, .087), (.973, .082), (.982, .907), (.012, .917)]}),
 (e(7),  'img/obras/rostro-entre-colores.jpg',   {'crop': (.032, .036, .993, .994)}),
 (e(8),  'img/obras/la-ola.jpg',                 {'quad': [(.027, .022), (.958, .03), (.966, .953), (.032, .963)]}),
 (e(9),  'img/obras/musa-de-la-ciudad.jpg',      {'quad': [(.022, .082), (.983, .077), (.988, .903), (.022, .908)]}),
 (e(10), 'img/obras/lluvia-en-la-ciudad.jpg',    {'crop': (.01, .016, .984, .968)}),
 (e(11), 'img/obras/reserva-guadual.jpg',        {'crop': (.017, .022, .984, .973)}),
 (e(12), 'img/obras/primero-mi-felicidad.jpg',   {'crop': (.006, .006, .968, .963)}),
 (e(13), 'img/obras/retrato-en-carbon.jpg',      {'quad': [(.037, .012), (.953, .012), (.938, .983), (.027, .983)]}),
 (e(14), 'img/obras/cabellos-al-viento.jpg',     {'crop': (.022, .006, .984, .973)}),
 (e(15), 'img/obras/bajo-la-sombrilla.jpg',      {'quad': [(.037, .017), (.923, .017), (.928, .963), (.037, .963)]}),
 (e(16), 'img/obras/shakira.jpg',                {'crop': (.003, .003, .997, .997)}),
 # Obras anteriores que no están en las carpetas nuevas: solo se mejoran
 (A + 'la-antigua-finca.jpg',         'img/obras/la-antigua-finca.jpg',         {}),
 (A + 'primavera-en-forest-park.jpg', 'img/obras/primavera-en-forest-park.jpg', {}),
 (A + 'vientos-de-rockaway.jpg',      'img/vendidas/vientos-de-rockaway.jpg',   {}),
 # Vendidas
 (v(0),  'img/vendidas/dama-con-aretes.jpg',        {'crop': (0, 0, .94, .925)}),
 (v(1),  'img/vendidas/cuadrilleros.jpg',           {'crop': (.037, .037, .963, .928)}),
 (v(2),  'img/vendidas/sonrisa.jpg',                {'crop': (0, 0, .985, 1)}),
 (v(3),  'img/vendidas/retrato-de-graduacion.jpg',  {'crop': (.022, .022, .973, .978)}),
 (v(4),  'img/vendidas/mi-daniel.jpg',              {'crop': (.004, .004, .996, .996)}),
 (v(5),  'img/vendidas/contemplando-a-manhattan.jpg', {'crop': (.004, .004, .996, .996)}),
 (v(6),  'img/vendidas/vientos-de-rockaway-con-el-autor.jpg', {}),
 (v(7),  'img/vendidas/amado-mora.jpg',             {'crop': (.004, .097, .996, .898)}),
 (v(8),  'img/vendidas/eucaliptos.jpg',             {'crop': (0, 0, 1, .972)}),
 (v(9),  'img/vendidas/retrato-de-caballero-1.jpg', {'quad': [(.082, .163), (.922, .148), (.932, .863), (.077, .882)]}),
 (v(10), 'img/vendidas/retrato-de-caballero-2.jpg', {'quad': [(.072, .182), (.883, .172), (.888, .793), (.067, .803)]}),
 (v(11), 'img/vendidas/retrato-de-caballero-3.jpg', {'quad': [(.057, .177), (.928, .147), (.933, .843), (.052, .853)]}),
 (v(12), 'img/vendidas/velero-al-atardecer.jpg',    {'crop': (0, 0, .985, .985)}),
 (v(13), 'img/vendidas/oleaje.jpg',                 {'crop': (0, 0, .94, 1)}),
 (v(14), 'img/vendidas/los-caballos.jpg',           {'crop': (0, 0, .973, 1)}),
 (v(15), 'img/vendidas/retrato-familiar.jpg',       {'quad': [(.155, .196), (.8, .192), (.8, .83), (.154, .83)]}),
 (v(16), 'img/vendidas/figura-en-sepia.jpg',        {'quad': [(.186, .176), (.824, .171), (.829, .814), (.181, .819)]}),
 (v(17), 'img/vendidas/retrato-de-pareja.jpg',      {'quad': [(.322, .162), (.739, .153), (.744, .808), (.317, .818)]}),
 (v(18), 'img/vendidas/nina-de-rizos.jpg',          {'crop': (.004, .004, .996, .996)}),
 (v(19), 'img/vendidas/junto-a-la-fuente.jpg',      {'crop': (.006, .032, .95, 1)}),
 (v(20), 'img/vendidas/bosque-junto-al-rio.jpg',    {'crop': (.006, .012, .978, .99)}),
 (v(21), 'img/vendidas/la-puerta-verde.jpg',        {'crop': (.004, .004, .996, .996)}),
 (v(22), 'img/vendidas/ventana-con-bicicleta-con-el-autor.jpg', {}),
 (v(23), 'img/vendidas/retrato-en-pastel.jpg',      {'crop': (.02, .072, .958, .728)}),
 (v(24), 'img/vendidas/el-conferencista.jpg',       {'crop': (0, 0, .983, 1)}),
 (v(25), 'img/vendidas/palmeras-junto-al-lago.jpg', {'crop': (0, .013, 1, 1)}),
 (v(26), 'img/vendidas/la-marina.jpg',              {'crop': (.004, .004, .996, .996)}),
 (v(27), 'img/vendidas/retrato-con-flor.jpg',       {'crop': (0, 0, 1, .985)}),
 (v(28), 'img/vendidas/pastor-aleman.jpg',          {'crop': (0, 0, 1, .968)}),
 (v(29), 'img/vendidas/dulces-suenos.jpg',          {'crop': (.004, .004, .996, .996)}),
 (v(30), 'img/vendidas/tres-hermanos.jpg',          {'crop': (.004, .004, .996, .996)}),
 (v(31), 'img/vendidas/ola-al-atardecer.jpg',       {'crop': (0, 0, .965, .985)}),
 (v(32), 'img/vendidas/retrato-en-azul.jpg',        {'crop': (.004, .004, .996, .996)}),
 (v(33), 'img/vendidas/remanso.jpg',                {'crop': (.04, 0, .953, 1)}),
 (v(34), 'img/vendidas/abedules.jpg',               {'crop': (0, .042, .99, .973)}),
 (v(35), 'img/vendidas/rio-en-la-selva.jpg',        {'crop': (.016, 0, .963, 1)}),
 (v(36), 'img/vendidas/retrato-de-caballero-4.jpg', {'quad': [(.037, .157), (.972, .152), (.977, .838), (.032, .833)]}),
]
print(json.dumps([dict(origen=o, salida=s, **x) for o, s, x in L], ensure_ascii=False, indent=0))
