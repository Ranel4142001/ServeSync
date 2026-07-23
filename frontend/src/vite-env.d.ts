/// <reference types="vite/client" />

// Tell TypeScript that CSS imports are valid
declare module '*.css' {
  const content: string;
  export default content;
}