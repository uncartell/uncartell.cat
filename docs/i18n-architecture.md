# Arquitectura multidioma d’Uncartell

## Estat actual auditat

El producte és una única aplicació web estàtica en HTML, CSS i JavaScript. `assets/platform.js` injecta la capçalera, el peu, autenticació, perfil, plans, cookies i altres components compartits. Els editors de Cartells, Cartes i menús, Taules de preus i QR són mòduls JavaScript del mateix desplegament. Supabase presta autenticació, persistència, publicació i resolució de QR; la generació de PDF i imatges es fa principalment al navegador.

El directori canònic de publicació és `pre-v1.2/release/ca`. Les carpetes de còpia o treball històriques no són aplicacions per mercat i no s’han d’utilitzar per crear variants ES/IT.

## Model implantat

- `assets/i18n/config.js`: registre únic de mercats, dominis, estat de publicació i mapa de rutes estable.
- `assets/i18n/ca.js`: diccionari català i fallback obligatori.
- `assets/i18n/es.js` i `assets/i18n/it.js`: esquelet deliberadament buit i no publicat.
- `assets/i18n/runtime.js`: detecció host/document, fallback, interpolació, URLs contextuals i localització exclusiva de contingut de sistema.
- `assets/platform.js`: consumeix mercat i rutes centrals. Les bifurcacions antigues es mantenen només com a compatibilitat temporal mentre els textos es migren progressivament.

El català continua sent l’únic idioma habilitat, públic i indexable. `uncartel.es` i `uncartello.it` estan registrats però deshabilitats; si arriben a la mateixa aplicació abans de publicar-se, es redirigeixen a la pàgina catalana equivalent.

## Regles de contingut

Els textos de sistema poden viure al diccionari o, si provenen de Supabase, en un camp localitzat `camp_i18n` (objecte per idioma). Els camps plans creats per persones usuàries es retornen literalment i mai es tradueixen automàticament. Basic, Premium i Ultra són noms de pla invariants.

PDF, PNG, SVG, marques d’aigua, documents públics, correus i dominis han de consultar `window.UncartellI18n.market` i `t()`. La migració és progressiva per preservar exactament el català actual; `scripts/audit-i18n.mjs` inventaria literals pendents sense tocar dades.

## Rutes i selector

Les claus de ruta són identificadors interns estables. Només hi ha slugs catalans publicats. No s’han inventat slugs ES/IT ni s’han creat `hreflang`, sitemap o pàgines indexables per idiomes incomplets. `localeSwitchUrl()` conserva ruta, query i hash quan el mercat objectiu estigui publicat; fins aleshores retorna `null`, de manera que el selector es pot mantenir ocult o desactivat.

## Activació futura dels dominis

1. Completar i revisar professionalment els diccionaris i metadades ES/IT.
2. Afegir els slugs aprovats al mapa central i provar totes les equivalències.
3. Canviar `enabled`, `public` i, només al final, `indexable` al registre del mercat.
4. Configurar a Dinahosting el DNS de `uncartel.es` i `uncartello.it` contra el mateix origen/CDN que `uncartell.cat`; no crear còpies de fitxers ni redireccions permanents a traduccions incompletes.
5. Afegir els dominis al proveïdor de hosting i TLS, a les URL permeses de Supabase Auth i als orígens permesos de les funcions.
6. Publicar canònics, `hreflang` i sitemap només després de validar cada mercat.

GitHub Pages només admet un `CNAME` per lloc; per tant, els dominis addicionals necessiten un frontal/CDN amb dominis personalitzats o un hosting que accepti múltiples hostnames sobre el mateix artefacte. Canviar només DNS sense donar d’alta host i certificat no és suficient.

## Inventari pendent

Queden literals visibles dins les pàgines HTML, els editors, autenticació/perfil, plans, onboarding, errors, validacions i documents públics. S’han de migrar per àrees, mantenint el valor català byte a byte sempre que sigui possible. També s’han de revisar abans de publicar ES/IT els textos de funcions Supabase i les dades editorials de catàleg; no cal migrar noms de projecte, textos de cartes, preus, URLs, logotips ni cap altre contingut aportat per usuaris.
