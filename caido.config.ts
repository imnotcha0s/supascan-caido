import { defineConfig } from "@caido-community/dev";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  id: "supascan",
  name: "SupaScan",
  description: "Supabase misconfiguration scanner",
  version: "0.1.3",
  author: {
    name: "Cha0s",
    email: "notcha0s@proton.me",
    url: "https://x.com/imnotcha0s"
  },
  plugins: [
    {
      kind: "frontend",
      id: "supascan-frontend",
      name: "SupaScan Frontend",
      root: "./packages/frontend",
      backend: {
        id: "supascan-backend",
      },
      vite: {
        plugins: [vue()],
      },
    },
    {
      kind: "backend",
      id: "supascan-backend",
      name: "SupaScan Backend",
      root: "./packages/backend",
    },
  ],
});
