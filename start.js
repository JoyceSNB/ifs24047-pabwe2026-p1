// @ts-nocheck: folder build baru ada setelah vite build.
// Jembatan port: Delcom memberi APP_PORT, sedangkan adapter membaca RESEPFE_PORT.
const port = process.env.RESEPFE_PORT || process.env.APP_PORT || process.env.PORT;
if (port) process.env.RESEPFE_PORT = port;

await import("./build/index.js");