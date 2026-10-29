import { createFileRoute } from "@tanstack/react-router";
import { ScreamBattle } from "@/game/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scream Battle — Who Can Scream the Loudest?" },
      { name: "description", content: "A colorful cartoon game: scream into your mic and beat Ali, Aicha, the AI, or your friends." },
      { property: "og:title", content: "Scream Battle — Who Can Scream the Loudest?" },
      { property: "og:description", content: "Scream into your mic to win cartoon battles against the AI or a friend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScreamBattle,
});
