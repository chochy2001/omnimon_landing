import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { homeCopy } from './home';
import { CONSENT_STRINGS } from './consent';
import { resolveLegalStrings } from './legal';
import { chromeCopy, notFoundCopy } from './locale';

// High-confidence misspellings in Spanish copy. Ambiguous words (mas, esta,
// solo, version, menu, icono, periodo) are pinned by exact strings instead,
// because they also appear in code identifiers or English.
const BANNED = [
  'analitica',
  'anticorrupcion',
  'analiticas',
  'automatica',
  'automaticas',
  'automatico',
  'automaticos',
  'automaticamente',
  'basico',
  'boton',
  'busqueda',
  'confirmacion',
  'cotizacion',
  'descripcion',
  'deteccion',
  'dia',
  'dias',
  'dialogo',
  'dialogos',
  'diseno',
  'disenos',
  'documentacion',
  'ejecucion',
  'eleccion',
  'energia',
  'fisica',
  'fisico',
  'funcion',
  'garantia',
  'grafica',
  'graficas',
  'guia',
  'imagenes',
  'ingles',
  'instalacion',
  'integracion',
  'interaccion',
  'limite',
  'mexico',
  'pagina',
  'pestana',
  'pestanas',
  'politica',
  'politicas',
  'proxima',
  'rapida',
  'redaccion',
  'resolucion',
  'seccion',
  'segun',
  'seudonima',
  'tambien',
  'telemetria',
  'terminos',
  'titulo',
  'titulos',
  'ultima',
  'ultimo',
  'verificacion',
];

// Spanish-visible sources. Mixed-locale .ts files are scanned whole: their
// English copy holds none of the banned words.
const SCANNED = [
  'src/pages/es/blog/v6-4-1-release-es.astro',
  'src/pages/es/blog/v6-5-0-release-es.astro',
  'src/pages/es/blog/v6-6-0-release-es.astro',
  'src/pages/es/blog/v6-7-0-release-es.astro',
  'src/pages/es/blog/v6-8-0-release-es.astro',
  'src/pages/es/blog/index.astro',
  'src/components/ui/CookieBanner.astro',
  'src/pages/404.astro',
  'src/lib/home.ts',
  'src/lib/legal.ts',
  'src/lib/consent.ts',
  'src/lib/releases.ts',
  'src/lib/locale.ts',
  'src/pages/blog/v6-4-1-release.astro',
  'src/pages/blog/v6-5-0-release.astro',
  'src/pages/blog/v6-6-0-release.astro',
  'src/pages/blog/v6-7-0-release.astro',
  'src/pages/blog/v6-8-0-release.astro',
];

// Legitimate unaccented occurrences (English copy or identifiers), stripped
// before scanning. Each entry documents why it is not a defect.
const EXCEPTIONS: Record<string, string[]> = {
  'src/lib/legal.ts': [
    // English privacy/terms: "Mexico"/"Mexico City" in English sentences.
    'Mexico City',
    'laws of Mexico',
    // English privacy: official agency name without diacritics (the Spanish
    // notice uses "Secretaría Anticorrupción y Buen Gobierno").
    'Secretaria Anticorrupcion y Buen Gobierno',
  ],
};

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function findBanned(text: string): string[] {
  const hits: string[] = [];
  const lower = text.toLowerCase();
  for (const word of BANNED) {
    const pattern = new RegExp(`(?<![a-záéíóúñü])${word}(?![a-záéíóúñü])`);
    if (pattern.test(lower)) hits.push(word);
  }
  return hits;
}

describe('spanish orthography', () => {
  test('no banned unaccented word in Spanish-visible sources', () => {
    const root = join(import.meta.dir, '..', '..');
    const failures: string[] = [];
    for (const rel of SCANNED) {
      let text = stripComments(readFileSync(join(root, rel), 'utf8'));
      for (const exc of EXCEPTIONS[rel] ?? []) {
        text = text.split(exc).join(' ');
      }
      for (const word of findBanned(text)) {
        failures.push(`${rel}: [${word}]`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('pins the fixed Spanish strings', () => {
    expect(homeCopy.es.ctaDownload).toBe('Descargar última versión');
    expect(homeCopy.es.ctaDocs).toBe('Ver documentación');
    expect(homeCopy.es.versionWord).toBe('Versión');
    expect(resolveLegalStrings('es').termsTitle).toBe('Términos de uso');
    expect(resolveLegalStrings('es').privacyTitle).toBe('Política de privacidad');
    expect(CONSENT_STRINGS.es.title).toBe('Cookies y analítica');
    expect(CONSENT_STRINGS.es.prefsSave).toBe('Guardar elección');
    expect(chromeCopy.es.menu).toBe('Abrir menú');
    expect(chromeCopy.es.closeMenu).toBe('Cerrar menú');
    expect(notFoundCopy('es').h1).toBe('No encontramos esa página');
  });

  test('english posts link to the Spanish version with accent', () => {
    const root = join(import.meta.dir, '..', '..');
    for (const slug of ['v6-4-1', 'v6-5-0', 'v6-6-0', 'v6-7-0', 'v6-8-0']) {
      const page = readFileSync(join(root, 'src/pages/blog', `${slug}-release.astro`), 'utf8');
      expect(page).toContain('Leer en español');
      expect(page).not.toContain('Leer en espanol');
    }
  });
});
