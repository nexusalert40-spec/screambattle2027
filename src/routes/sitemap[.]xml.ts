import { createFileRoute } from "@tanstack/react-router";

const ORIGIN = "https://screambattle.fun";
// Add every new public page here so it appears in the sitemap.
const PUBLIC_PATHS = ["/"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = PUBLIC_PATHS.map((p) => `  <url>\n    <loc>${ORIGIN}${p}</loc>\n  </url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
