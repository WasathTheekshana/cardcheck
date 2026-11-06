FROM node:24-alpine
WORKDIR /app

# .yarnrc.yml (nodeLinker: node-modules) and the pinned Yarn release have to be here
# before `yarn install`. Without them Yarn installs in Plug'n'Play mode, and the later
# `yarn run build` cannot find node_modules.
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN --mount=type=cache,target=/root/.yarn/berry/cache corepack enable && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn install --immutable

COPY . .

# The rest matches the Dockerfile Roar generates, so build-time env, APP_URL and memory limits keep working.
ARG APP_PUBLIC_URL
ARG APP_URL
ARG VERCEL_PROJECT_PRODUCTION_URL
ARG ROAR_BUILD_MEMORY_MB
RUN --mount=type=secret,id=roarenv,required=false if [ -f /run/secrets/roarenv ]; then set -a; . /run/secrets/roarenv; set +a; fi; case " ${NODE_OPTIONS:-} " in *max-old-space-size*) ;; *) roar_heap=$(awk -v m="${ROAR_BUILD_MEMORY_MB:-0}" '/^MemAvailable:/ { a = int($2 / 1024 * 0.6) } END { h = int(m * 0.75); if (a > 0 && a < h) h = a; if (h > 2048) print h }' /proc/meminfo 2>/dev/null || true); if [ -n "$roar_heap" ]; then export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=$roar_heap"; echo "build memory: Node may use up to $roar_heap MB"; fi ;; esac; yarn run build

CMD npx next start -p ${PORT:-3000} -H 0.0.0.0
