import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Primary domain for Google indexing", () => {
  it("declares the custom domain as the homepage canonical", () => {
    const source = read("src/routes/index.tsx");
    expect(source.match(/rel: "canonical", href: "([^"]+)"/)?.[1]).toBe("https://screambattle.fun/");
  });

  it("lists the custom domain in the sitemap", () => {
    const source = read("public/sitemap.xml");
    expect(source.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")).toBe(true);
    expect(source).toContain("<loc>https://screambattle.fun/</loc>");
  });

  it("points crawlers to the custom domain sitemap", () => {
    expect(read("public/robots.txt").match(/^Sitemap: (.+)$/m)?.[1]).toBe("https://screambattle.fun/sitemap.xml");
  });
});