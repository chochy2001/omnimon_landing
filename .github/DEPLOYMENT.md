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
| `HOSTINGER_FTPS_HOST` | Nombre de servidor FTPS de Hostinger que el certificado cubre. **No vale una IP** | hPanel > Archivos > Cuentas FTP. El certificado servido por el FTP de esta cuenta, medido el 2026-09-19, es `CN=*.hstgr.io` con SAN `*.hstgr.io` y `hstgr.io`, asi que el valor tiene que ser un nombre bajo `hstgr.io`. El `FTP_HOST` del `.env.local` local es la IP `31.170.161.105` y **no sirve aqui**: con `security: strict` la verificacion de nombre la rechaza |
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
gh secret set HOSTINGER_FTPS_HOST -R chochy2001/omnimon_landing
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

`workflow_dispatch` es la unica ruta exenta de la comprobacion de no retroceso
(punto 6 de la seccion siguiente), justo para que revertir siga siendo posible.
Un `workflow_run` automatico nunca puede publicar algo anterior a lo que el
origen ya sirve.

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
5. **Assets identicos al artefacto, byte a byte.** Se comprueba cada fichero de
   `dist` que no sea HTML y cada asset que referencia el HTML vivo: `200` y
   cuerpo con el mismo `sha256` que el fichero construido. El fallo clasico del
   FTP es HTML nuevo apuntando a hashes de `_astro` que nunca se transfirieron o
   que llegaron a medias; la pagina carga rota y el despliegue ya reporto exito.
   Exigir solo `200` y cuerpo mayor que cero no lo detecta: un corte de FTP deja
   un fichero truncado, no uno de cero bytes. Y los ficheros de `public/`
   (`favicon.ico`, `favicon.svg`) no llevan hash de contenido en el nombre, asi
   que una copia vieja del origen responderia `200` con cuerpo no vacio para
   siempre; el `sha256` si la distingue aunque pese lo mismo. Un asset que el
   HTML vivo referencia y este build no emite no tiene copia local con la que
   comparar: a ese solo se le exige `200` y cuerpo no vacio, y el log lo dice.
6. **Produccion no retrocede.** Antes de subir nada, el workflow lee la huella
   que el origen sirve en ese momento y exige que sea ancestro del SHA que va a
   promocionar. Sin eso, dos pushes casi simultaneos cuyos CI terminan en orden
   invertido dejarian que el run del commit viejo subiera el ultimo y terminara
   verde con produccion por detras de `main`, porque la verificacion posterior
   solo comprueba su propia huella. Casos permitidos de forma explicita: que el
   origen no sirva ninguna huella todavia (el primer despliegue del pipeline,
   que es la situacion de hoy) y que sirva exactamente el mismo SHA
   (republicacion). Si el origen sirve una huella que no es un SHA de 40
   caracteres, o un SHA que no existe en el repositorio, o uno que no es
   ancestro, el job falla antes de tocar el origen.

## Limites conocidos

- **El origen si pierde ficheros, aunque `dangerous-clean-slate` sea `false`.**
  Las dos cosas son distintas y conviene no confundirlas.
  `dangerous-clean-slate: true` borraria el directorio remoto ENTERO antes de
  subir; con `false` eso no ocurre nunca. Pero la accion tambien borra por
  diferencia de estado, y eso si ocurre. Medido leyendo el `dist/index.js` de
  `SamKirkland/FTP-Deploy-Action` v4.4.0 (SHA `110f9186`), que es el bundle que
  el runner ejecuta:
  - La accion deja un inventario, `.ftp-deploy-sync-state.json`, dentro del
    directorio remoto al terminar cada subida (`syncLocalToServer`).
  - Al empezar intenta leerlo. Si no existe registra
    `this must be your first publish` y toma el estado del servidor como vacio
    (`getServerFiles` devuelve `data: []`), asi que el primer run **no borra
    nada**.
  - A partir del segundo run el inventario ya esta. `HashDiff.getDiffs` mete en
    `deleteList` todo fichero o carpeta que figure en ese inventario y que el
    build nuevo ya no emita, y `syncLocalToServer` los elimina con `removeFile`
    y `removeFolder`. Ese camino **no consulta `dangerous-clean-slate`**.

  O sea: lo que este pipeline subio en un despliegue anterior y el build actual
  deja de emitir **se borra**. Lo que nunca estuvo en el inventario no se toca,
  y ahi es donde estan los restos de las subidas manuales antiguas (entradas de
  blog que el fuente ya no emite, `sitemap-index.xml`, imagenes, `.htaccess`):
  esos si sobreviven, porque el primer run del pipeline solo apunto el contenido
  de `dist/`. Borrar el inventario a mano en el servidor devuelve la accion al
  modo primera publicacion y suspende los borrados hasta el siguiente run.
- **Verificacion del certificado FTPS: estricta.** Se usa `protocol: ftps` con
  `security: strict`. La clave no es decorativa: en el `dist/index.js` de la
  accion fijada, la entrada `security` se rellena con `"loose"` cuando no se
  pasa, y el codigo hace
  `const rejectUnauthorized = args.security === "strict";` antes de mandarlo tal
  cual en `secureOptions`. Sin la clave, `protocol: ftps` da un canal cifrado
  pero **no autenticado**: no se valida ni la cadena ni el nombre del servidor,
  y quien pueda interponerse en la ruta se queda con la contrasena FTP de
  produccion. Consecuencia operativa: `HOSTINGER_FTPS_HOST` debe ser un nombre
  que el certificado cubra. El certificado servido por el FTP de esta cuenta,
  medido el 2026-09-19 con `openssl s_client -starttls ftp`, es `CN=*.hstgr.io`
  con SAN `*.hstgr.io` y `hstgr.io`; una IP o un `ftp.omnimon.com.mx` fallan la
  verificacion de nombre. El paso `Verify the strict FTPS endpoint before
  sending credentials` lo comprueba con `openssl` **antes** de que el workflow
  entregue usuario o contrasena a nadie, asi que un valor mal puesto falla con
  un mensaje legible en vez de morir dentro de la subida.
- **El runner es GitHub-hosted a proposito.** Este repositorio es publico y no
  tiene runners propios, y los runners self-hosted de CAPDESIS no sirven a un
  repositorio personal. Entregar credenciales FTP de produccion a un runner
  self-hosted alcanzable desde un repositorio publico es la condicion del P0
  `CAPDESIS/CapLiving#525`. El primer paso del job falla si alguna vez aterriza
  en un runner que no sea GitHub-hosted.
- **La comprobacion de no retroceso tiene una ventana.** Se lee la huella
  servida justo antes de subir, no de forma atomica con la subida. Entre ambos
  instantes solo cabe una publicacion hecha fuera de este workflow, porque el
  grupo de concurrencia `omnimon-landing-hostinger` serializa los runs entre si.
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
