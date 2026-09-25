import { OMNIMON_VERSION, PUBLISHED_VERSION, RELEASE_DATE, RELEASE_DATE_ES } from '../consts';
import type { ConsentLocale } from './consent';

export type HomeCopy = {
  lang: ConsentLocale;
  title: string;
  description: string;
  badgeNew: string;
  versionWord: string;
  releaseWord: string;
  releaseDate: string;
  h1: string;
  lead: string;
  ctaDownload: string;
  ctaDocs: string;
  ctaSponsors: string;
  platformsKicker: string;
  platformsValue: string;
  securityKicker: string;
  securityValue: string;
  aiKicker: string;
  aiValue: string;
  snapshotKicker: string;
  snapshotCta: string;
  snapshotLine2: string;
  snapshotLine3: string;
  snapshotLine4: string;
  snapshotLine5: string;
  qaTitle: string;
  qaBody: string;
  cliTitle: string;
  cliBody: string;
  releaseKicker: string;
  releaseH2: string;
  releaseLead: string;
  highlights: { title: string; description: string }[];
  pillars: { title: string; description: string; accent: string }[];
  flowKicker: string;
  flowH2: string;
  flowItems: { title: string; description: string }[];
  tutorialKicker: string;
  tutorialH2: string;
  tutorialLead: string;
  tutorial: { step: string; title: string; description: string }[];
  downloadKicker: string;
  downloadH2: string;
  downloadLead: string;
  artifacts: { platform: string; name: string; description: string; accent: string; sha256: string }[];
  brewKicker: string;
  shaKicker: string;
  sponsorsTitle: string;
  sponsorsBody: string;
  sponsorsCta: string;
  faqKicker: string;
  faqH2: string;
  faqs: { question: string; answer: string }[];
  footerCopy: string;
  navBlog: string;
  navDocs: string;
  navDownload: string;
  screenshotAlt: string;
};

const v = OMNIMON_VERSION;

export const homeCopy: Record<ConsentLocale, HomeCopy> = {
  es: {
    lang: 'es',
    title: `OmniMon ${v} | Observabilidad, seguridad e IA para tu sistema`,
    description: `Vista previa de OmniMon ${v} (pre-release): Memory Guard, tutorial, descargas verificables y accesos para macOS, Windows y Linux.`,
    badgeNew: 'Proximo',
    versionWord: 'Version',
    releaseWord: 'Pre-release',
    releaseDate: RELEASE_DATE_ES,
    h1: 'Observabilidad real, seguridad activa y asistencia IA en una sola consola.',
    lead: `OmniMon ${v} (pre-release) une desktop nativo, CLI y TUI para monitorear procesos, red y alertas, con Memory Guard en macOS para leftovers idle sin falsos positivos.`,
    ctaDownload: 'Descargar ultima version',
    ctaDocs: 'Ver documentacion',
    ctaSponsors: 'GitHub Sponsors',
    platformsKicker: 'Plataformas',
    platformsValue: 'macOS, Windows y Linux',
    securityKicker: 'Seguridad',
    securityValue: 'Firmas Ed25519 + SHA-256',
    aiKicker: 'IA opcional',
    aiValue: 'Local o cloud segun tu flujo',
    snapshotKicker: 'Vista previa',
    snapshotCta: 'Ver releases',
    snapshotLine2: 'desktop: ready',
    snapshotLine3: 'security: privacy mode, signed releases, keyring delete-first',
    snapshotLine4: 'macos: memory guard leftovers only, never Warp/Chrome/fseventsd',
    snapshotLine5: 'alerts: zombie killer + evaluator state refactor',
    qaTitle: 'QA reforzado',
    qaBody: 'Cobertura, ramas criticas y regresiones bajo control.',
    cliTitle: 'CLI + GUI',
    cliBody: 'Paridad funcional para diagnostico local y remoto.',
    releaseKicker: `Pre-release ${v}`,
    releaseH2: 'Lo mas importante que trae esta pre-release',
    releaseLead:
      'Memory Guard en macOS, Zombie Killer en la app, y el mismo contrato: no matar lo que estas usando.',
    highlights: [
      {
        title: 'Memory Guard en macOS',
        description:
          'LaunchAgent opcional que cierra leftovers idle (huerfanos, CPU en 0, >= 1 h). Nunca Warp, Chrome, agentes con padre vivo ni fseventsd.',
      },
      {
        title: 'Zombie Killer en segundo plano',
        description:
          'Detecta procesos con CPU o RAM sostenida, los agrupa por (pid, start_time) y pide confirmacion antes de terminar.',
      },
      {
        title: 'Modo privacidad para IA',
        description:
          'Redaccion seudonima estable antes de enviar contexto a proveedores, sin exponer nombres reales fuera de tu equipo.',
      },
      {
        title: 'Presupuesto diario de IA',
        description:
          'Un bucket compartido limita ai_chat, analyze_processes, analyze_context y validate_api_key.',
      },
    ],
    pillars: [
      {
        title: 'Desktop nativo',
        description: 'UI en Tauri + Svelte 5 con telemetria en tiempo real y temas claro/oscuro.',
        accent: 'text-sky-300',
      },
      {
        title: 'CLI y TUI',
        description: 'Las mismas capacidades desde terminal para servidores y automatizacion.',
        accent: 'text-emerald-300',
      },
      {
        title: 'Seguridad operativa',
        description: 'Auditoria local, reglas y telemetria de red para detectar anomalias antes.',
        accent: 'text-orange-300',
      },
    ],
    flowKicker: 'Flujo rapido',
    flowH2: 'Desde la terminal al panel visual sin cambiar de herramienta',
    flowItems: [
      {
        title: 'omnimon monitor',
        description: 'Vista interactiva de procesos, ranking y actividad del sistema en vivo.',
      },
      {
        title: 'omnimon audit --security',
        description: 'Validaciones locales y superficie de riesgo con salida para operadores.',
      },
      {
        title: 'omnimon-memory-guard prove',
        description: 'Contrato del clasificador: leftovers si, falsos positivos no.',
      },
    ],
    tutorialKicker: 'Tutorial basico',
    tutorialH2: 'Primeros pasos para usar OmniMon sin perderte',
    tutorialLead:
      'Si es tu primera vez, este recorrido corto te lleva desde el dashboard hasta validar una descarga.',
    tutorial: [
      {
        step: '1',
        title: 'Abre OmniMon y revisa el dashboard',
        description: 'CPU, RAM, red y procesos para ver si el equipo esta estable.',
      },
      {
        step: '2',
        title: 'Filtra el ruido y enfoca el problema',
        description: 'Busqueda y tablas para aislar la app, host o pico que te interesa.',
      },
      {
        step: '3',
        title: 'Pide contexto a la IA o ejecuta un audit',
        description: 'Manual o con IA/CLI para resumir consumo y sugerir acciones.',
      },
      {
        step: '4',
        title: 'Verifica el release que instalas',
        description: 'Valida el artefacto contra SHA256SUMS.txt y la firma del release.',
      },
    ],
    downloadKicker: 'Descarga e instalacion',
    downloadH2: 'Instala OmniMon en minutos',
    downloadLead: `Descargas del ultimo release publicado (v${PUBLISHED_VERSION}), Homebrew o el instalador web. Valida siempre el checksum publicado.`,
    artifacts: [
      {
        platform: 'macOS',
        name: 'Universal DMG',
        description: 'Descarga el release mas reciente para Apple Silicon e Intel desde GitHub Releases.',
        accent: 'text-orange-200',
        sha256: 'Disponible en SHA256SUMS.txt del release oficial',
      },
      {
        platform: 'Windows',
        name: 'MSI oficial',
        description: 'Instala OmniMon desde el paquete MSI publicado en el ultimo release oficial.',
        accent: 'text-sky-200',
        sha256: 'Verifica el MSI con SHA256SUMS.txt antes de instalar',
      },
      {
        platform: 'Linux',
        name: 'Script + paquetes',
        description: 'Usa el instalador web o descarga .deb y .AppImage desde el release mas reciente.',
        accent: 'text-emerald-200',
        sha256: 'Checksums SHA-256 publicados junto al .deb y .AppImage',
      },
    ],
    brewKicker: 'Homebrew',
    shaKicker: 'Verificacion SHA-256',
    sponsorsTitle: 'GitHub Sponsors',
    sponsorsBody:
      'Si OmniMon te ahorra tiempo, puedes sostener el proyecto desde GitHub Sponsors.',
    sponsorsCta: 'Apoyar en GitHub Sponsors',
    faqKicker: 'FAQ',
    faqH2: 'Preguntas frecuentes',
    faqs: [
      {
        question: `Que incluye la version ${v}?`,
        answer:
          'Memory Guard para macOS, Zombie Killer, modo privacidad para IA, presupuesto diario de IA y hardening del keyring.',
      },
      {
        question: 'En que plataformas funciona OmniMon?',
        answer: 'macOS, Windows y Linux, con app de escritorio, CLI y TUI.',
      },
      {
        question: 'La IA es obligatoria?',
        answer: 'No. Puedes usarlo como monitor sin IA, o activar proveedores cuando los necesites.',
      },
      {
        question: 'Como verifico una descarga?',
        answer: 'Compara el hash con SHA256SUMS.txt y, si quieres, valida la firma del release.',
      },
    ],
    footerCopy: 'OmniMon. Open source bajo MIT.',
    navBlog: 'Blog',
    navDocs: 'Docs',
    navDownload: 'Descargar',
    screenshotAlt: `OmniMon ${v} - captura de la aplicacion de escritorio`,
  },
  en: {
    lang: 'en',
    title: `OmniMon ${v} | System observability, security, and optional AI`,
    description: `OmniMon ${v} pre-release preview: Memory Guard for macOS, downloads, and docs for macOS, Windows, and Linux.`,
    badgeNew: 'Next',
    versionWord: 'Version',
    releaseWord: 'Pre-release',
    releaseDate: RELEASE_DATE,
    h1: 'Real observability, active security, and optional AI in one console.',
    lead: `OmniMon ${v} (pre-release) brings together a native desktop app, CLI, and TUI, plus a macOS Memory Guard that reaps idle leftovers without touching Warp, Chrome, or fseventsd.`,
    ctaDownload: 'Download latest',
    ctaDocs: 'Read the docs',
    ctaSponsors: 'GitHub Sponsors',
    platformsKicker: 'Platforms',
    platformsValue: 'macOS, Windows, and Linux',
    securityKicker: 'Security',
    securityValue: 'Ed25519 signatures + SHA-256',
    aiKicker: 'Optional AI',
    aiValue: 'Local or cloud, when you want it',
    snapshotKicker: 'Preview snapshot',
    snapshotCta: 'View releases',
    snapshotLine2: 'desktop: ready',
    snapshotLine3: 'security: privacy mode, signed releases, keyring delete-first',
    snapshotLine4: 'macos: memory guard leftovers only, never Warp/Chrome/fseventsd',
    snapshotLine5: 'alerts: zombie killer + evaluator state refactor',
    qaTitle: 'Hardened QA',
    qaBody: 'Coverage, critical paths, and regression checks stay on.',
    cliTitle: 'CLI + GUI',
    cliBody: 'Same capabilities for local and remote diagnosis.',
    releaseKicker: `Pre-release ${v}`,
    releaseH2: 'What this pre-release brings',
    releaseLead:
      'Memory Guard on macOS, Zombie Killer in the app, and the same rule: do not kill what you are using.',
    highlights: [
      {
        title: 'Memory Guard on macOS',
        description:
          'Optional LaunchAgent that reaps idle orphans (ppid 1, idle CPU, at least one hour). Never Warp, Chrome, live agent CLIs, or fseventsd.',
      },
      {
        title: 'Background Zombie Killer',
        description:
          'Flags processes with sustained CPU or RAM, keys them by (pid, start_time), and waits for confirmation.',
      },
      {
        title: 'AI privacy mode',
        description:
          'Stable pseudonymous redaction before context leaves your machine.',
      },
      {
        title: 'Daily AI budget',
        description:
          'A shared bucket caps ai_chat, analyze_processes, analyze_context, and validate_api_key.',
      },
    ],
    pillars: [
      {
        title: 'Native desktop',
        description: 'Tauri + Svelte 5 UI with live telemetry and light/dark themes.',
        accent: 'text-sky-300',
      },
      {
        title: 'CLI and TUI',
        description: 'The same core capabilities from a terminal for servers and automation.',
        accent: 'text-emerald-300',
      },
      {
        title: 'Operational security',
        description: 'Local audit, rules, and network telemetry to catch anomalies early.',
        accent: 'text-orange-300',
      },
    ],
    flowKicker: 'Fast path',
    flowH2: 'From the terminal to the visual panel without switching tools',
    flowItems: [
      {
        title: 'omnimon monitor',
        description: 'Interactive view of processes, ranking, and live system activity.',
      },
      {
        title: 'omnimon audit --security',
        description: 'Local checks and risk surface with operator-friendly output.',
      },
      {
        title: 'omnimon-memory-guard prove',
        description: 'Classifier contract: leftovers yes, false positives no.',
      },
    ],
    tutorialKicker: 'Quick start',
    tutorialH2: 'First steps so you do not get lost',
    tutorialLead: 'A short path from the dashboard to a verified download.',
    tutorial: [
      {
        step: '1',
        title: 'Open OmniMon and read the dashboard',
        description: 'CPU, RAM, network, and processes tell you if the machine is stable.',
      },
      {
        step: '2',
        title: 'Filter noise and focus the problem',
        description: 'Search and tables isolate the app, host, or spike you care about.',
      },
      {
        step: '3',
        title: 'Ask AI for context or run an audit',
        description: 'Stay manual, or use AI/CLI to summarize usage and suggest actions.',
      },
      {
        step: '4',
        title: 'Verify the release you install',
        description: 'Check the artifact against SHA256SUMS.txt and the published signature.',
      },
    ],
    downloadKicker: 'Download and install',
    downloadH2: 'Install OmniMon in minutes',
    downloadLead: `Downloads from the latest published release (v${PUBLISHED_VERSION}), Homebrew, or the web installer. Always check the published checksum.`,
    artifacts: [
      {
        platform: 'macOS',
        name: 'Universal DMG',
        description: 'Latest Apple Silicon and Intel build from GitHub Releases.',
        accent: 'text-orange-200',
        sha256: 'Published in SHA256SUMS.txt of the official release',
      },
      {
        platform: 'Windows',
        name: 'Official MSI',
        description: 'Install from the MSI on the latest official release.',
        accent: 'text-sky-200',
        sha256: 'Verify the MSI with SHA256SUMS.txt before installing',
      },
      {
        platform: 'Linux',
        name: 'Script + packages',
        description: 'Use the web installer or grab .deb and .AppImage from the latest release.',
        accent: 'text-emerald-200',
        sha256: 'SHA-256 checksums published next to the .deb and .AppImage',
      },
    ],
    brewKicker: 'Homebrew',
    shaKicker: 'SHA-256 verification',
    sponsorsTitle: 'GitHub Sponsors',
    sponsorsBody: 'If OmniMon saves you time, you can fund fixes and releases on GitHub Sponsors.',
    sponsorsCta: 'Sponsor on GitHub',
    faqKicker: 'FAQ',
    faqH2: 'Frequently asked questions',
    faqs: [
      {
        question: `What is in version ${v}?`,
        answer:
          'Memory Guard for macOS, Zombie Killer, AI privacy mode, a daily AI budget, and keyring hardening.',
      },
      {
        question: 'Which platforms does OmniMon support?',
        answer: 'macOS, Windows, and Linux, with a desktop app, CLI, and TUI.',
      },
      {
        question: 'Is AI required?',
        answer: 'No. Use it as a monitor without AI, or turn providers on when you need them.',
      },
      {
        question: 'How do I verify a download?',
        answer: 'Compare the hash with SHA256SUMS.txt and, if you want, the release signature.',
      },
    ],
    footerCopy: 'OmniMon. Open source under MIT.',
    navBlog: 'Blog',
    navDocs: 'Docs',
    navDownload: 'Download',
    screenshotAlt: `OmniMon ${v} - desktop app screenshot`,
  },
};
