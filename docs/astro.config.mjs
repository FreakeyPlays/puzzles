// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "🧩 Puzzles",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/freakeyplays/puzzles",
        },
      ],
      sidebar: [
        { slug: "getting-started" },
        {
          label: "Reposiotry",
          items: [{ autogenerate: { directory: "repo" } }],
        },
        {
          label: "Sudoku",
          items: [{ autogenerate: { directory: "sudoku" } }],
        },
      ],
    }),
  ],
});
