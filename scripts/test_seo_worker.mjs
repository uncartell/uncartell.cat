import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../_worker.js", import.meta.url), "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { default: worker } = await import(moduleUrl);

const env = {
  ASSETS: {
    fetch(request) {
      const url = new URL(request.url);
      const missing = url.pathname.includes("no-existe");
      return Promise.resolve(new Response(missing ? "Not found" : url.pathname, { status: missing ? 404 : 200 }));
    },
  },
};

const cases = [
  ["https://uncartell.cat/cartes-i-menus?utm_source=qa", 308, "https://uncartell.cat/cartes-i-menus/?utm_source=qa"],
  ["https://uncartel.es/tablas-de-precios?utm_source=qa", 308, "https://uncartel.es/tablas-de-precios/?utm_source=qa"],
  ["https://uncartello.it/menu-e-carte?utm_source=qa", 308, "https://uncartello.it/menu-e-carte/?utm_source=qa"],
  ["https://uncartell.cat/ca/cartes-i-menus/?utm_source=qa", 308, "https://uncartell.cat/cartes-i-menus/?utm_source=qa"],
  ["https://uncartel.es/es/tablas-de-precios/", 308, "https://uncartel.es/tablas-de-precios/"],
  ["https://uncartello.it/it/menu-e-carte/", 308, "https://uncartello.it/menu-e-carte/"],
  ["https://uncartell.cat/es/cartas-y-menus/", 404, null],
  ["https://uncartell.cat/assets/platform.js?v=1", 200, null],
  ["https://uncartell.cat/no-existe/", 404, null],
];

for (const [url, expectedStatus, expectedLocation] of cases) {
  const response = await worker.fetch(new Request(url), env);
  if (response.status !== expectedStatus) {
    throw new Error(`${url}: expected ${expectedStatus}, got ${response.status}`);
  }
  if (expectedLocation && response.headers.get("location") !== expectedLocation) {
    throw new Error(`${url}: expected ${expectedLocation}, got ${response.headers.get("location")}`);
  }
}

console.log(`Verified ${cases.length} Worker routing cases`);
