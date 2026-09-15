from pathlib import Path
from html.parser import HTMLParser
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
# IMPORTANT: `public/` is a historical snapshot (August 2026), not the current
# production source.  Keeping it as the input silently produced a visually old
# Catalan preview.  The preview must only be rebuilt from an explicitly synced
# copy of the current `main` branch.
SOURCE = ROOT / "current-source"
OUT = ROOT / "localized-preview"
PREVIEW_ASSET_VERSION = "italian-runtime-qa-20260915-v15"

REQUIRED_CURRENT_FILES = (
    "index.html",
    "cartells/index.html",
    "cartes-i-menus/index.html",
    "taules-de-preus/index.html",
    "codis-qr/index.html",
    "assets/template-picker.css",
    "assets/format-landing-showcase.css",
    "assets/catalog-heading.css",
    "assets/catalog-tabs-system.css",
)

missing_current_files = [name for name in REQUIRED_CURRENT_FILES if not (SOURCE / name).exists()]
if missing_current_files:
    missing = "\n  - ".join(missing_current_files)
    raise SystemExit(
        "Refusing to build localized-preview from the obsolete public/ snapshot.\n"
        "Sync the current GitHub main source into pre-v1.2/current-source first.\n"
        f"Missing current-source files:\n  - {missing}"
    )

ROUTES = {
    "ca": {"": "", "cartells": "cartells", "cartes-i-menus": "cartes-i-menus", "taules-de-preus": "taules-de-preus", "codis-qr": "codis-qr", "plans": "plans", "ultra": "ultra", "faqs": "faqs", "manifest": "manifest", "contacte": "contacte", "legal": "legal", "privacitat": "privacitat", "cookies": "cookies", "admin": "admin"},
    "es": {"": "", "cartells": "carteles", "cartes-i-menus": "cartas-y-menus", "taules-de-preus": "tablas-de-precios", "codis-qr": "codigos-qr", "plans": "planes", "ultra": "ultra", "faqs": "preguntas-frecuentes", "manifest": "manifiesto", "contacte": "contacto", "legal": "aviso-legal", "privacitat": "privacidad", "cookies": "cookies", "admin": "admin"},
    "it": {"": "", "cartells": "cartelli", "cartes-i-menus": "menu-e-carte", "taules-de-preus": "listini-prezzi", "codis-qr": "codici-qr", "plans": "piani", "ultra": "ultra", "faqs": "domande-frequenti", "manifest": "manifesto", "contacte": "contatti", "legal": "note-legali", "privacitat": "privacy", "cookies": "cookie", "admin": "admin"},
}

LEGACY_PHASE2 = ROOT / "public"

class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.items = []
    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "svg"}: self.skip += 1
    def handle_endtag(self, tag):
        if tag in {"script", "style", "svg"} and self.skip: self.skip -= 1
    def handle_data(self, data):
        value = " ".join(data.split())
        if not self.skip and value: self.items.append(value)

def visible_text(path):
    parser = VisibleText()
    parser.feed(path.read_text(errors="ignore"))
    return parser.items

def inline_locale(path):
    """Read the page locale payload without executing any project code."""
    if not path.exists():
        return None
    match = re.search(r"window\.UNCARTELL_LOCALE\s*=\s*(\{.*?\});\s*</script>", path.read_text(errors="ignore"), re.S)
    return json.loads(match.group(1)) if match else None

def pair_locale_strings(source, target, catalog):
    """Match locale payloads structurally so editor-generated UI is localized too."""
    if isinstance(source, str) and isinstance(target, str) and source != target:
        catalog[source] = target
    elif isinstance(source, dict) and isinstance(target, dict):
        for key in source.keys() & target.keys():
            pair_locale_strings(source[key], target[key], catalog)
    elif isinstance(source, list) and isinstance(target, list):
        for source_item, target_item in zip(source, target):
            pair_locale_strings(source_item, target_item, catalog)

def phase2_es_catalog():
    """Recover reviewed ES copy from matching Phase 2 pages, never their UI."""
    catalog = {}
    for ca_slug, es_slug in ROUTES["es"].items():
        ca_page = LEGACY_PHASE2 / "ca" / ca_slug / "index.html" if ca_slug else LEGACY_PHASE2 / "ca" / "index.html"
        es_page = LEGACY_PHASE2 / "es" / es_slug / "index.html" if es_slug else LEGACY_PHASE2 / "es" / "index.html"
        if not ca_page.exists() or not es_page.exists(): continue
        ca_text, es_text = visible_text(ca_page), visible_text(es_page)
        if len(ca_text) != len(es_text): continue
        catalog.update({source: target for source, target in zip(ca_text, es_text) if source != target})
    # Small reviewed overlay from Phase 2 takes precedence.
    source = (LEGACY_PHASE2 / "assets/i18n/es.js").read_text(errors="ignore")
    for key, value in re.findall(r"'((?:\\'|[^'])*)'\s*:\s*'((?:\\'|[^'])*)'", source):
        catalog[key.replace("\\'", "'")] = value.replace("\\'", "'")
    for ca_slug, es_slug in ROUTES["es"].items():
        current_page = SOURCE / ca_slug / "index.html" if ca_slug else SOURCE / "index.html"
        current_payload = inline_locale(current_page)
        legacy_page = LEGACY_PHASE2 / "es" / es_slug / "index.html" if es_slug else LEGACY_PHASE2 / "es" / "index.html"
        legacy_payload = inline_locale(legacy_page)
        if current_payload and legacy_payload:
            pair_locale_strings(current_payload, legacy_payload, catalog)
    return catalog

def phase2_it_catalog():
    source = (LEGACY_PHASE2 / "assets/i18n/it.js").read_text(errors="ignore")
    catalog = {}
    for key, value in re.findall(r"'((?:\\'|[^'])*)'\s*:\s*'((?:\\'|[^'])*)'", source):
        catalog[key.replace("\\'", "'")] = value.replace("\\'", "'")
    # The reviewed Italian Phase 2 dictionary contains both Catalan and Spanish
    # source phrases. Bridge current Catalan payloads through reviewed Spanish
    # labels when that is the only available Italian source key.
    for ca_text, es_text in phase2_es_catalog().items():
        if ca_text not in catalog and es_text in catalog:
            catalog[ca_text] = catalog[es_text]
        if ca_text in catalog and es_text not in catalog:
            catalog[es_text] = catalog[ca_text]
    return catalog

PREVIEW_CATALOGS = {
    "ca": {},
    "es": phase2_es_catalog(),
    "it": phase2_it_catalog(),
}

PREVIEW_CATALOGS["es"].update({
    "Comença gratis, creix quan ho necessitis.": "Empieza gratis, crece cuando lo necesites.",
    "Crea, descarrega i comparteix fàcilment.": "Crea, descarga y comparte fácilmente.",
    "Gratis per sempre": "Gratis para siempre",
    "Fins a 10 descàrregues al dia": "Hasta 10 descargas al día",
    "Descàrrega en PDF": "Descarga en PDF",
    "Crea codis QR": "Crea códigos QR",
    "Cartells, cartes i taules de preus": "Carteles, cartas y tablas de precios",
    "Sense registre": "Sin registro",
    "Pla actual": "Plan actual",
    "Premium · Més popular": "Premium · Más popular",
    "Tot el que necessites per crear, personalitzar i reutilitzar els teus dissenys.": "Todo lo que necesitas para crear, personalizar y reutilizar tus diseños.",
    "49,99 €/any": "49,99 €/año",
    "12 mesos de prova · després, 49,99 €/any": "12 meses de prueba · después, 49,99 €/año",
    "Tot el que inclou Basic": "Todo lo que incluye Basic",
    "Cartes per a mòbil": "Cartas para móvil",
    "Descàrregues il·limitades": "Descargas ilimitadas",
    "Desa i gestiona projectes": "Guarda y gestiona proyectos",
    "Descàrrega en PDF i PNG": "Descarga en PDF y PNG",
    "QR dinàmics": "QR dinámicos",
    "Canvia la destinació dels QR quan vulguis": "Cambia el destino de los QR cuando quieras",
    "Personalitza els colors": "Personaliza los colores",
    "Activa 12 mesos gratis": "Activa 12 meses gratis",
    "Properament": "Próximamente",
    "Més control de marca, formats avançats i analítiques.": "Más control de marca, formatos avanzados y analíticas.",
    "89,99 €/any": "89,99 €/año",
    "Tot el que inclou Premium": "Todo lo que incluye Premium",
    "Projectes il·limitats": "Proyectos ilimitados",
    "QR dinàmics il·limitats": "QR dinámicos ilimitados",
    "Descàrrega en PDF, PNG i SVG": "Descarga en PDF, PNG y SVG",
    "Elimina o personalitza la marca d’aigua": "Elimina o personaliza la marca de agua",
    "Afegeix el teu logotip": "Añade tu logotipo",
    "Imatges i personalització avançada": "Imágenes y personalización avanzada",
    "Analítiques dels QR": "Analíticas de los QR",
    "Dades dels últims 7, 30 o 90 dies": "Datos de los últimos 7, 30 o 90 días",
    "Suport prioritari": "Soporte prioritario",
    "Avisa’m": "Avísame",
    "El teu correu": "Tu correo",
    "Envia": "Enviar",
    "Cartes i menús — Proposta V1.2": "Tablas de precios | uncartel.es",
    "Retrat de la Marta, comerciant": "Retrato de Marta, comerciante",
    "Retrat de la Júlia, cuinera": "Retrato de Júlia, cocinera",
    "Menú": "Menú",
    "Formats": "Formatos",
    "3 DISSENYS": "3 DISEÑOS",
    "1 DISSENY": "1 DISEÑO",
    "Tria una plantilla": "Elige una plantilla",
    "Escull una base i adapta’n després els textos, colors i contingut.": "Elige una base y adapta después los textos, colores y contenido.",
    "Escull una base i adapta’n després els serveis, colors i contingut.": "Elige una base y adapta después los servicios, colores y contenido.",
    "Tria primer el format que necessites. Després podràs escollir un disseny i personalitzar-lo.": "Elige primero el formato que necesitas. Después podrás escoger un diseño y personalizarlo.",
    "Primer escull com la vols presentar. Després personalitza la plantilla al teu gust.": "Primero elige cómo quieres presentarla. Después personaliza la plantilla a tu gusto.",
    "Tots els formats impresos respecten marges generosos, àrea segura i impressió domèstica sense sang.": "Todos los formatos impresos respetan márgenes amplios, área segura e impresión doméstica sin sangrado.",
    "Tria un format vertical o horitzontal i deixa’l llest per imprimir.": "Elige un formato vertical u horizontal y déjalo listo para imprimir.",
    "1 columna": "1 columna",
    "Kit de marca": "Kit de marca",
    "Color principal": "Color principal",
    "Aplica el kit": "Aplica el kit",
    "Creador de cartells | uncartell.cat": "Creador de carteles | uncartel.es",
    "Tria un cartell del repositori, edita’n el contingut i deixa’l llest per imprimir.": "Elige un cartel del catálogo, edita su contenido y déjalo listo para imprimir.",
    "Torna al repositori": "Volver al catálogo",
    "Editor": "Editor",
    "Contingut del cartell": "Contenido del cartel",
    "Icona": "Icono",
    "Canvia": "Cambiar",
    "Disponible amb Premium i Ultra": "Disponible con Premium y Ultra",
    "Estil del cartell": "Estilo del cartel",
    "Combina dos colors": "Combina dos colores",
    "Color 1 · icona": "Color 1 · icono",
    "Color 2 · títol": "Color 2 · título",
    "Logotip i identitat del negoci": "Logotipo e identidad del negocio",
    "Esborra el logotip": "Eliminar el logotipo",
    "Canvis temporals": "Cambios temporales",
    "ICONES": "ICONOS",
    "Tria una icona": "Elige un icono",
    "Puja la teva icona": "Sube tu icono",
    "Creador de codis QR | uncartell.cat": "Creador de códigos QR | uncartel.es",
    "CODIS QR": "CÓDIGOS QR",
    "Converteix qualsevol enllaç en un QR gratuït, personalitzable i que no caduca.": "Convierte cualquier enlace en un QR gratuito, personalizable y que no caduca.",
    "Enllaç": "Enlace", "Marca d’aigua": "Marca de agua", "Kit d’empresa": "Kit de empresa",
    "ENLLAÇ": "ENLACE", "URL de destinació actual": "URL de destino actual", "Nova URL de destinació": "Nueva URL de destino",
    "Substitueix URL": "Sustituir URL", "El codi imprès no canviarà. Només actualitzarem la pàgina on redirigeix.": "El código impreso no cambiará. Solo actualizaremos la página a la que redirige.",
    "Destinació del QR": "Destino del QR", "Genera el codi QR": "Genera el código QR",
    "https://exemple.cat": "https://ejemplo.es",
    "Canvia la destinació sense tornar-los a imprimir.": "Cambia el destino sin volver a imprimirlos.",
    "Passa a Premium i crea QR dinàmics: canvia’n la destinació sense tornar-los a imprimir.": "Pásate a Premium y crea QR dinámicos: cambia su destino sin volver a imprimirlos.",
    "COLORS": "COLORES", "Colors del QR": "Colores del QR", "Personalitza el codi i el fons.": "Personaliza el código y el fondo.",
    "Color del QR": "Color del QR", "Fons": "Fondo", "MARCA D’AIGUA": "MARCA DE AGUA", "Marca inferior": "Marca inferior",
    "Edita o elimina el text que acompanya el QR.": "Edita o elimina el texto que acompaña al QR.",
    "LOGOTIP": "LOGOTIPO", "Logotip propi": "Logotipo propio", "Afegeix el logotip al centre del QR.": "Añade el logotipo en el centro del QR.",
    "Elimina el logotip": "Eliminar el logotipo", "KIT D’EMPRESA": "KIT DE EMPRESA", "Identitat corporativa": "Identidad corporativa",
    "Aplica els colors i el logotip del teu kit.": "Aplica los colores y el logotipo de tu kit.", "Aplica el kit d’empresa": "Aplicar el kit de empresa",
    "ANALÍTIQUES": "ANALÍTICAS", "Mètriques del QR": "Métricas del QR", "Dades agregades i respectuoses amb la privacitat.": "Datos agregados y respetuosos con la privacidad.",
    "7 dies": "7 días", "30 dies": "30 días", "90 dies": "90 días", "Escanejos totals": "Escaneos totales", "Escanejos del període": "Escaneos del período",
    "Mitjana diària": "Media diaria", "Darrer escaneig": "Último escaneo", "Des del darrer canvi": "Desde el último cambio", "Creat": "Creado",
    "Darrera substitució": "Última sustitución", "Destinació actual": "Destino actual", "Actualitza": "Actualizar", "Enganxa l’enllaç": "Pega el enlace",
    "Genera": "Generar", "Encara no has generat cap QR": "Todavía no has generado ningún QR", "ELS MEUS PROJECTES": "MIS PROYECTOS",
    "Codis QR desats": "Códigos QR guardados", "DESCÀRREGA": "DESCARGA", "Tria el format": "Elige el formato",
    "Comença a crear": "Empieza a crear",
    "Veure plans": "Ver planes",
    "EINES": "HERRAMIENTAS",
    "Tot comença amb una necessitat.": "Todo empieza con una necesidad.",
    "Tria l’eina, edita el contingut i descarrega una peça coherent sense començar de zero.": "Elige la herramienta, edita el contenido y descarga una pieza coherente sin empezar de cero.",
    "Cartes per a mòbil": "Cartas para móvil",
    "Crea una carta per a mòbil, publica-la i comparteix-la amb una adreça pròpia.": "Crea una carta para móvil, publícala y compártela con una dirección propia.",
    "Crea una carta per a mòbil →": "Crea una carta para móvil →",
    "Quan canvia l’horari o comencen les rebaixes, preparo i imprimeixo el cartell sense dependre de ningú.": "Cuando cambia el horario o empiezan las rebajas, preparo e imprimo el cartel sin depender de nadie.",
    "Marta – Comerciant": "Marta – Comerciante",
    "Actualitzo la carta del restaurant perquè els clients la consultin al mòbil, sempre amb els al·lèrgens al dia.": "Actualizo la carta del restaurante para que los clientes la consulten en el móvil, siempre con los alérgenos al día.",
    "Júlia – Cuinera": "Júlia – Cocinera",
    "Actualitzo el menú del dia, hi afegeixo els al·lèrgens i el tinc preparat i imprès en només cinc minuts, sense dependre de ningú.": "Actualizo el menú del día, añado los alérgenos y lo tengo preparado e impreso en solo cinco minutos, sin depender de nadie.",
    "Carles – Cuiner": "Carles – Cocinero",
    "Retrat d’en Carles, cuiner": "Retrato de Carles, cocinero",
    "Testimoni anterior": "Testimonio anterior",
    "Testimoni següent": "Testimonio siguiente",
    "Selecciona un testimoni": "Selecciona un testimonio",
    "Testimoni 1": "Testimonio 1",
    "Testimoni 2": "Testimonio 2",
    "Testimoni 3": "Testimonio 3",
})

PREVIEW_CATALOGS["it"].update({
    "Retrat de la Marta, comerciant": "Ritratto di Marta, commerciante",
    "Retrat de la Júlia, cuinera": "Ritratto di Júlia, cuoca",
    "Planes": "Piani", "Cuenta": "Account", "SOBRE NOSOTROS": "CHI SIAMO",
    "Creador de cartas y menús": "Creatore di menu e carte",
    "Creador de tablas de precios": "Creatore di listini prezzi",
    "Creador de códigos QR": "Creatore di codici QR",
    "Preguntas frecuentes": "Domande frequenti", "Privacidad": "Privacy",
    "Descargas restantes hoy": "Download disponibili oggi",
    "Descargas ilimitadas": "Download illimitati",
    "10/10 Descargas restantes hoy": "10/10 download disponibili oggi",
    "Tú decides las cookies": "Decidi tu sui cookie",
    "Utilizamos elementos necesarios para que la web funcione. Las cookies analíticas son opcionales y ahora mismo no activamos ninguna.": "Utilizziamo gli elementi necessari al funzionamento del sito. I cookie analitici sono facoltativi e al momento non ne attiviamo nessuno.",
    "Rechazar opcionales": "Rifiuta facoltativi", "Configurar": "Configura", "Aceptar opcionales": "Accetta facoltativi",
    "Formats": "Formati", "3 DISSENYS": "3 DESIGN", "1 DISSENY": "1 DESIGN", "Tria una plantilla": "Scegli un modello",
    "Escull una base i adapta’n després els textos, colors i contingut.": "Scegli una base e poi adatta testi, colori e contenuti.",
    "Escull una base i adapta’n després els serveis, colors i contingut.": "Scegli una base e poi adatta servizi, colori e contenuti.",
    "Tria primer el format que necessites. Després podràs escollir un disseny i personalitzar-lo.": "Scegli prima il formato che ti serve. Poi potrai scegliere un design e personalizzarlo.",
    "Primer escull com la vols presentar. Després personalitza la plantilla al teu gust.": "Prima scegli come presentarla. Poi personalizza il modello come preferisci.",
    "Tots els formats impresos respecten marges generosos, àrea segura i impressió domèstica sense sang.": "Tutti i formati stampati rispettano margini ampi, area sicura e stampa domestica senza abbondanza.",
    "Tria un format vertical o horitzontal i deixa’l llest per imprimir.": "Scegli un formato verticale o orizzontale e preparalo per la stampa.",
    "Passa a Premium i crea QR dinàmics: canvia’n la destinació sense tornar-los a imprimir.": "Passa a Premium e crea QR dinamici: cambia la destinazione senza ristamparli.",
    "Quan canvia l’horari o comencen les rebaixes, preparo i imprimeixo el cartell sense dependre de ningú.": "Quando cambiano gli orari o iniziano i saldi, preparo e stampo il cartello in autonomia.",
    "Marta – Comerciant": "Marta – Commerciante",
    "Actualitzo la carta del restaurant perquè els clients la consultin al mòbil, sempre amb els al·lèrgens al dia.": "Aggiorno il menu del ristorante perché i clienti possano consultarlo dal telefono, con gli allergeni sempre aggiornati.",
    "Júlia – Cuinera": "Júlia – Cuoca",
    "Comença a crear": "Inizia a creare",
    "Veure plans": "Vedi i piani",
    "EINES": "STRUMENTI",
    "Tot comença amb una necessitat.": "Tutto parte da un’esigenza.",
    "Tria l’eina, edita el contingut i descarrega una peça coherent sense començar de zero.": "Scegli lo strumento, modifica il contenuto e scarica un progetto coerente senza partire da zero.",
    "Cartes per a mòbil": "Menu per smartphone",
    "Crea una carta per a mòbil, publica-la i comparteix-la amb una adreça pròpia.": "Crea un menu per smartphone, pubblicalo e condividilo con un indirizzo dedicato.",
    "Crea una carta per a mòbil →": "Crea un menu per smartphone →",
    "Actualitzo el menú del dia, hi afegeixo els al·lèrgens i el tinc preparat i imprès en només cinc minuts, sense dependre de ningú.": "Aggiorno il menu del giorno, aggiungo gli allergeni e in soli cinque minuti è pronto e stampato, senza dipendere da nessuno.",
    "Carles – Cuiner": "Carles – Cuoco",
    "Retrat d’en Carles, cuiner": "Ritratto di Carles, cuoco",
    "Testimoni anterior": "Testimonianza precedente",
    "Testimoni següent": "Testimonianza successiva",
    "Selecciona un testimoni": "Seleziona una testimonianza",
    "Testimoni 1": "Testimonianza 1",
    "Testimoni 2": "Testimonianza 2",
    "Testimoni 3": "Testimonianza 3",
})

# Current-source-only strings are kept separately from the historical Phase 2
# catalogue.  This makes new UI/editor copy auditable and prevents a legacy
# CA/ES fallback from silently reaching the Italian build.
IT_CURRENT_CATALOG = ROOT / "i18n" / "it-current.json"
if not IT_CURRENT_CATALOG.exists():
    raise SystemExit(f"Missing mandatory Italian current-source catalogue: {IT_CURRENT_CATALOG}")
PREVIEW_CATALOGS["it"].update(json.loads(IT_CURRENT_CATALOG.read_text()))

def localize_static_markup(html, locale):
    """Translate visible static markup while leaving scripts and user data alone."""
    if locale == "ca":
        return html
    catalog = PREVIEW_CATALOGS[locale]
    market = {"es": ("Uncartel", "uncartel.es"), "it": ("Uncartello", "uncartello.it")}[locale]
    protected = re.compile(r"(<(?:script|style|textarea)\b[^>]*>.*?</(?:script|style|textarea)>)", re.I | re.S)

    def translate_value(value):
        raw = value
        stripped = raw.strip()
        if not stripped:
            return raw
        translated = catalog.get(stripped, stripped)
        translated = re.sub(r"uncartell\.cat", market[1], translated, flags=re.I)
        translated = re.sub(r"\bUncartell\b", market[0], translated)
        return raw.replace(stripped, translated)

    chunks = protected.split(html)
    for index in range(0, len(chunks), 2):
        chunk = chunks[index]
        pieces = re.split(r"(<[^>]+>)", chunk)
        for piece_index in range(0, len(pieces), 2):
            pieces[piece_index] = translate_value(pieces[piece_index])
        chunk = "".join(pieces)
        chunk = re.sub(
            r'\b(aria-label|title|placeholder|alt)=("|\')(.*?)(\2)',
            lambda match: f'{match.group(1)}={match.group(2)}{translate_value(match.group(3))}{match.group(2)}',
            chunk,
            flags=re.I | re.S,
        )
        chunks[index] = chunk
    return "".join(chunks)

def localize_inline_locale_payload(html, locale):
    """Localize the editor payload before application code reads it.

    Translating the rendered DOM is too late for the editors: they capture
    ``window.UNCARTELL_LOCALE`` at startup and use it to create default blocks,
    labels and project names.  Keep identifiers and numbers intact and only
    translate string values through the reviewed Phase 2 catalog.
    """
    if locale == "ca":
        return html
    catalog = PREVIEW_CATALOGS[locale]
    market = {
        "es": {"brand": "uncartel", "tld": "es", "domain": "uncartel.es"},
        "it": {"brand": "uncartello", "tld": "it", "domain": "uncartello.it"},
    }[locale]

    def translate(value):
        if isinstance(value, str):
            result = catalog.get(value, value)
            result = re.sub(r"uncartell\.cat", market["domain"], result, flags=re.I)
            result = re.sub(r"\bUncartell\b", market["brand"].capitalize(), result)
            return result
        if isinstance(value, list):
            return [translate(item) for item in value]
        if isinstance(value, dict):
            return {key: translate(item) for key, item in value.items()}
        return value

    pattern = re.compile(r"window\.UNCARTELL_LOCALE\s*=\s*(\{.*?\});\s*</script>", re.S)
    def replace(match):
        payload = translate(json.loads(match.group(1)))
        payload.update({"lang": locale, "brand": market["brand"], "tld": market["tld"]})
        return "window.UNCARTELL_LOCALE = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";</script>"
    return pattern.sub(replace, html, count=1)

def write_preview_catalogs():
    assets = OUT / "assets/i18n"
    assets.mkdir(parents=True, exist_ok=True)
    es = json.dumps(PREVIEW_CATALOGS["es"], ensure_ascii=False, separators=(",", ":"))
    (assets / "preview-es.js").write_text(f"window.UncartellPreviewTranslations=window.UncartellPreviewTranslations||{{}};window.UncartellPreviewTranslations.es={es};")
    # The reviewed IT dictionary contains Catalan and inherited Spanish source
    # strings, so it can localize both static pages and dynamically rendered UI.
    it = json.dumps(PREVIEW_CATALOGS["it"], ensure_ascii=False, separators=(",", ":"))
    (assets / "preview-it.js").write_text(f"window.UncartellPreviewTranslations=window.UncartellPreviewTranslations||{{}};window.UncartellPreviewTranslations.it={it};")
    shutil.copy2(ROOT / "preview-i18n-runtime.js", assets / "preview-runtime.js")

def source_path(locale, ca_slug):
    # The current GitHub main serves Catalan from the repository root.  ES/IT
    # previews are always derived from these exact files so that no historical
    # localized snapshot can replace newer UI, templates or editor logic.
    return SOURCE / ca_slug / "index.html" if ca_slug else SOURCE / "index.html"

def inject(html, locale):
    html = re.sub(r'<html\s+lang="[^"]+"', f'<html lang="{locale}"', html, count=1)
    html = localize_inline_locale_payload(html, locale)
    html = localize_static_markup(html, locale)
    # The localized preview is rebuilt repeatedly while keeping the same local
    # origin. Force every local CSS/JS request onto this preview revision so a
    # browser cannot mix the current markup with an older locale-specific
    # stylesheet from its HTTP cache.
    def bust_local_asset(match):
        attr, quote, url = match.groups()
        separator = "&" if "?" in url else "?"
        return f'{attr}={quote}{url}{separator}preview={PREVIEW_ASSET_VERSION}{quote}'
    html = re.sub(
        r"\b(src|href)=([\"'])(/(?:assets|cartells|cartes-i-menus|taules-de-preus|codis-qr)/[^\"']+\.(?:css|js)(?:\?[^\"']*)?)\2",
        bust_local_asset,
        html,
        flags=re.I,
    )
    # Current pages already load the shared i18n bundle.  The preview override
    # must be set before config/runtime execute, without injecting duplicate
    # runtimes or event handlers.
    bootstrap = f'<script>window.UNCARTELL_PREVIEW_LOCALE="{locale}";</script>'
    html = html.replace('</head>', bootstrap + '</head>', 1)
    html = html.replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex,nofollow">')
    if 'name="robots"' not in html:
        html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>', 1)
    # Keep navigation inside the local locale tree.  Query strings and hashes
    # remain untouched because only the pathname prefix is replaced.
    localized_paths = {
        '/': f'/{locale}/',
        **{
            f'/{source_slug}/': f'/{locale}/{ROUTES[locale][source_slug]}/'
            for source_slug in ROUTES['ca'] if source_slug
        },
    }
    def local_href(match):
        quote, path = match.group(1), match.group(2)
        for source_pathname in sorted(localized_paths, key=len, reverse=True):
            if path == source_pathname or path.startswith(source_pathname + '?') or path.startswith(source_pathname + '#'):
                return f'href={quote}{localized_paths[source_pathname]}{path[len(source_pathname):]}{quote}'
        return match.group(0)
    html = re.sub(r'href=(["\'])(/[^"\']*)\1', local_href, html)
    scripts = (
        '<script src="/assets/i18n/preview-es.js"></script>'
        '<script src="/assets/i18n/preview-it.js"></script>'
        '<script src="/assets/i18n/preview-runtime.js"></script>'
    )
    html = html.replace('</body>', scripts + '</body>', 1)
    return html

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for entry in SOURCE.iterdir():
    if entry.name not in {"ca", "es", "it", "index.html", "CNAME", "robots.txt", "sitemap.xml"}:
        destination = OUT / entry.name
        shutil.copytree(entry, destination) if entry.is_dir() else shutil.copy2(entry, destination)

write_preview_catalogs()

for locale, mapping in ROUTES.items():
    for ca_slug, localized_slug in mapping.items():
        src = source_path(locale, ca_slug)
        if not src.exists():
            raise SystemExit(f"Missing source page: {src}")
        dest = OUT / locale / localized_slug / "index.html" if localized_slug else OUT / locale / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(inject(src.read_text(), locale))

(OUT / "index.html").write_text('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Uncartell locale preview</title><a href="/ca/">CA</a> · <a href="/es/">ES</a> · <a href="/it/">IT</a>')
(OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
print(f"Localized noindex preview built at {OUT}")
