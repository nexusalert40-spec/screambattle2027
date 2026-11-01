import { createFileRoute } from "@tanstack/react-router";
import { ScreamBattle } from "@/game/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Screambattle 2027 — Free Cartoon Screaming Game" },
      { name: "description", content: "Screambattle 2027: the free cartoon screaming game. Shout into your mic to beat Ali, Aicha, the AI or friends. Play in 8 languages." },
      { property: "og:title", content: "Screambattle 2027 — Free Cartoon Screaming Game" },
      { property: "og:description", content: "Screambattle 2027: the free cartoon screaming game. Shout into your mic to beat Ali, Aicha, the AI or friends. Play in 8 languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Screambattle 2027 — Free Cartoon Screaming Game" },
      { name: "twitter:description", content: "Screambattle 2027: the free cartoon screaming game. Shout into your mic to beat Ali, Aicha, the AI or friends. Play in 8 languages." },
      { property: "og:url", content: "https://screambattle2027.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://screambattle2027.lovable.app/" }],
  }),
  component: ScreamBattle,
});
