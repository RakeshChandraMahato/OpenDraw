import type { Plugin } from 'vite';

export function excludeUnusedFiles(): Plugin {
  return {
    name: 'exclude-unused-files',
    resolveId(id) {
      // Exclude unused font files
      if (id.includes('/fonts/Xiaolai/') || 
          id.includes('/fonts/Nunito/') ||
          id.includes('/fonts/ComicShanns/') ||
          id.includes('/fonts/Lilita/') ||
          id.includes('/fonts/Liberation/')) {
        return { id, external: true };
      }
      
      // Exclude unused locale files (keep only en, es, fr, de, and Indian languages)
      if (id.includes('/locales/') && 
          !id.includes('/locales/en.json') &&
          !id.includes('/locales/es-ES.json') &&
          !id.includes('/locales/fr-FR.json') &&
          !id.includes('/locales/de-DE.json') &&
          !id.includes('/locales/hi-IN.json') &&
          !id.includes('/locales/pa-IN.json') &&
          !id.includes('/locales/mr-IN.json') &&
          !id.includes('/locales/ta-IN.json') &&
          !id.includes('/locales/percentages.json')) {
        return { id, external: true };
      }
      
      // Exclude AI and Mermaid related files
      if (id.includes('mermaid') || 
          id.includes('MermaidToExcalidraw') ||
          id.includes('DiagramToCode')) {
        return { id, external: true };
      }
      
      return null;
    }
  };
}