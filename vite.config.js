import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Se for publicar no GitHub Pages em https://SEU_USUARIO.github.io/NOME_DO_REPO/,
// troque a linha `base` abaixo para "/NOME_DO_REPO/".
// Se for publicar em domínio próprio, Vercel ou Netlify, pode deixar "/".
export default defineConfig({
  plugins: [react()],
  base: "/controle-estoque/",
});
