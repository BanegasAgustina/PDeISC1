// vite-env.d.ts - Le dice a TypeScript cómo manejar imports de CSS e imágenes
/// <reference types="vite/client" />

// Permite importar archivos CSS
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Permite importar imágenes (devuelven un string con la URL final)
declare module '*.png'  { const src: string; export default src; }
declare module '*.jpg'  { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.jfif' { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
declare module '*.svg'  { const src: string; export default src; }
declare module '*.gif'  { const src: string; export default src; }
