import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { h } from "hastscript";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

export default defineConfig({
  site: "https://www.winterjung.dev",
  output: "static",
  build: {
    format: "directory",
  },
  redirects: {
    "/resume": "/resume.pdf",
    "/en/resume": "/en/resume.pdf",
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            class: "heading-link",
            ariaLabel: "Link to this section",
          },
          content: h("span.heading-link-icon", "#"),
        },
      ],
    ],
  },
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
