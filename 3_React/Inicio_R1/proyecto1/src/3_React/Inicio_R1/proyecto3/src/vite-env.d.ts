// vite-env.d.ts - Permite imports de CSS e imágenes en Vite + TS
/// <reference types="vite/client" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png'  { const src: string; export default src; }
declare module '*.jpg'  { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.jfif' { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
declare module '*.svg'  { const src: string; export default src; }
declare module '*.gif'  { const src: string; export default src; }
