# Despliegue de la landing de OmniMon

Origen publico: `https://omnimon.com.mx` (Hostinger, subida por FTP).
Workflow: `.github/workflows/deploy-hostinger.yml`.

## Por que existe este documento

Hasta el 2026-09-19 este repositorio no tenia ningun pipeline de publicacion.
`gh workflow list --all` devolvia solo `Landing CI`, que instala, prueba y
construye, y nada que publicara. La landing se subia a mano por FTP, y eso dejo
produccion detras de `main` sin que nadie pudiera medir cuanto. Lo medido ese
dia contra el origen publico:

- `https://omnimon.com.mx/` servia `OmniMon 6.3.0`, mientras `src/consts.ts` en
  `main` declara `6.7.0`.
- `/privacy/`, `/terms/`, `/es/privacy/` y `/es/terms/` respondian `404` aunque
  existen en `main` desde `ed56bcc`.
- `/blog/v6-6-0-release/` y `/blog/v6-7-0-release/` respondian `404`, igual que
  sus equivalentes en espanol.
- El HTML servido no llevaba ninguna huella de build, asi que no habia forma de
  saber que commit estaba publicado.

El workflow nuevo cierra eso. No basta con que el despliegue termine en verde:
vuelve a leer la URL publica y falla si lo servido no es el commit que acaba de
promocionar.

## Secretos y variables que debe crear el operador

El workflow no puede correr hasta que existan. Si falta cualquiera de ellos, el
primer paso del job falla nombrando exactamente cual, antes de construir nada y
antes de tocar el origen.

### Secretos (Settings > Secrets and variables > Actions > Secrets)

| Nombre | Contenido | De donde sale |
|--------|-----------|----------------|
| `FTP_HOST` | Host o IP del servidor FTP de Hostinger | hPanel > Archivos > Cuentas FTP, o el `.env.local` gitignoreado del checkout local, clave `FTP_HOST` |
| `FTP_USER` | Usuario FTP | mismo origen, clave `FTP_USER` |
| `FTP_PASSWORD` | Contrasena FTP | mismo origen, clave `FTP_PASSWORD`. Si no se conoce, se regenera en hPanel |

### Variables (Settings > Secrets and variables > Actions > Variables)

| Nombre | Contenido | De donde sale |
|--------|-----------|----------------|
| `FTP_PORT` | Puerto FTP, normalmente `21` | `.env.local`, clave `FTP_PORT` |
| `FTP_REMOTE_DIR` | Directorio remoto donde vive el sitio, **terminado en `/`** | `.env.local`, clave `FTP_REMOTE_DIR` |

`FTP_PORT` y `FTP_REMOTE_DIR` van como variables y no como secretos a proposito.
GitHub enmascara el valor de un secreto en todo el log: si `21` fuera secreto,
cualquier `21` que apareciera en un SHA, en un codigo de estado o en un tamano
de fichero saldria como `***` y el log del despliegue dejaria de ser legible.
Ninguno de los dos es una credencial.

Sobre `FTP_REMOTE_DIR`: las cuentas FTP de Hostinger suelen quedar enjauladas en
la raiz del dominio, asi que el valor util suele ser `./` y no
`/public_html/algo/`. Verificar el valor real contra el panel o contra el
`.env.local` local. Si se pone mal, la subida escribe en un sitio que Apache no
sirve, y el paso `Assert live build fingerprint on public origin` falla con ese
mensaje exacto en vez de reportar un despliegue verde de un sitio que nadie ve.

### Opcionales

| Tipo | Nombre | Efecto si falta |
|------|--------|-----------------|
| Secreto | `PUBLIC_POSTHOG_KEY` | El sitio se publica sin analitica. El build emite un `::warning::` y continua |
| Variable | `PUBLIC_POSTHOG_HOST` | Se usa el valor por defecto `https://us.i.posthog.com` que ya trae el componente |

### Carga con `gh`

```bash
gh secret set FTP_HOST -R chochy2001/omnimon_landing
gh secret set FTP_USER -R chochy2001/omnimon_landing
gh secret set FTP_PASSWORD -R chochy2001/omnimon_landing

gh variable set FTP_PORT -R chochy2001/omnimon_landing --body '21'
gh variable set FTP_REMOTE_DIR -R chochy2001/omnimon_landing --body './'

# opcional
gh secret set PUBLIC_POSTHOG_KEY -R chochy2001/omnimon_landing
```

`gh secret set` sin `--body` pide el valor por stdin y no lo deja en el
historial del shell. Nunca se commitean estos valores: `.env` y `.env.local`
estan en `.gitignore` y deben seguir ahi.

### Entorno `production`

El job declara `environment: production`. GitHub crea ese entorno en la primera
ejecucion. Si se quiere una aprobacion humana antes de cada publicacion, se
anade en Settings > Environments > production > Required reviewers. Los secretos
pueden vivir a nivel de repositorio o del entorno; el workflow los lee igual.

## Como se dispara

1. Merge a `main`.
2. `Landing CI` corre sobre ese commit.
3. Si CI concluye en `success` y el run vino de un `push` a `main`, el workflow
   de despliegue arranca por `workflow_run` y promociona **ese SHA exacto**, no
   la punta de la rama.

Promocion o reversion manual:

```bash
gh workflow run deploy-hostinger.yml -R chochy2001/omnimon_landing \
  -f release_sha=<sha de 40 caracteres>
```

La ruta manual no se salta CI: el workflow consulta la API y exige un run de
`Landing CI` en `success` para ese SHA, y exige ademas que el SHA sea ancestro
de `origin/main`. Para revertir se promociona el ultimo SHA bueno de `main`.

## Que garantiza y como

1. **Encadenado sobre CI.** `workflow_run` sobre `Landing CI`, filtrado a
   `conclusion == success` y `event == push` en `main`. Un CI de pull request,
   incluido el de un fork, no despliega. El checkout usa el SHA del run.
2. **Huella en el artefacto.** El build recibe `PUBLIC_BUILD_SHA` y
   `src/layouts/Layout.astro` lo emite como
   `<meta name="omnimon-build" content="...">`. El build aborta si alguna pagina
   construida no lleva la huella y tampoco es una redireccion estatica de Astro
   (hoy solo `/es/`, que redirige a `/`). Eso tambien detecta una pagina nueva
   que se olvide de usar `Layout.astro`.
3. **Verificacion contra la URL publica.** Tras la subida, el workflow lee
   `https://omnimon.com.mx` con un parametro anticache y exige que la huella
   servida sea el SHA promocionado, en la raiz y en todas las demas paginas con
   huella. Una subida parcial que deje la raiz nueva y el resto viejo tambien
   falla.
4. **Smoke de rutas reales.** Las rutas salen del `dist` recien construido, no
   de una lista escrita a mano ni del sitemap del origen: ese sitemap lo dejo un
   despliegue manual viejo, ya no lo emite este build y describe un sitio que no
   es el que se publica. Todas deben responder `200`, y una ruta inexistente
   debe responder `404`.
5. **Assets servidos y no vacios.** Se comprueba cada fichero de `dist` que no
   sea HTML y cada asset que referencia el HTML vivo: `200` y cuerpo mayor que
   cero. El fallo clasico del FTP es HTML nuevo apuntando a hashes de `_astro`
   que nunca se transfirieron; la pagina carga rota y el despliegue ya reporto
   exito.

## Limites conocidos

- **No se borra nada del origen.** `dangerous-clean-slate: false`. El origen
  conserva ficheros de despliegues manuales anteriores (entradas de blog que el
  fuente ya no emite, `sitemap-index.xml`, imagenes, `.htaccess`). Limpiarlos es
  una tarea aparte y deliberada; borrarlos desde aqui tiraria el sitio.
- **Verificacion del certificado FTPS.** Se usa `protocol: ftps`, con el
  comportamiento por defecto de `SamKirkland/FTP-Deploy-Action` para la opcion
  `security`. El canal va cifrado, pero el certificado FTPS de Hostinger no
  declara un nombre que coincida con el host, algo ya documentado en la flota,
  asi que no hay autenticacion estricta del servidor. Es el mismo compromiso que
  el workflow de referencia de `CapdesisWebLanding`.
- **El runner es GitHub-hosted a proposito.** Este repositorio es publico y no
  tiene runners propios, y los runners self-hosted de CAPDESIS no sirven a un
  repositorio personal. Entregar credenciales FTP de produccion a un runner
  self-hosted alcanzable desde un repositorio publico es la condicion del P0
  `CAPDESIS/CapLiving#525`. El primer paso del job falla si alguna vez aterriza
  en un runner que no sea GitHub-hosted.
- **El encadenado depende del nombre del CI.** `workflow_run` referencia
  `workflows: ["Landing CI"]` y la comprobacion por API usa `ci.yml`. Si se
  renombra el workflow de CI o su fichero, hay que actualizar ambos aqui.
- **No hay checks requeridos.** Este repositorio no tiene proteccion de rama, asi
  que nada impide un merge sin CI. Lo que si esta garantizado es que un commit
  sin CI verde no llega al origen publico.

## Referencia

`/Users/jorge/Documents/Apps/CapdesisWebLanding/.github/workflows/deploy-hostinger-public.yml`
es el workflow del que sale este modelo: es el unico de la flota que hoy
sostiene paridad entre `main` y produccion.
