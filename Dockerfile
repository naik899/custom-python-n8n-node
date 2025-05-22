FROM n8nio/n8n:1.92.2

USER root

# 🐍 Install Python using Alpine's package manager
RUN apk add --no-cache python3 py3-pip && \
    ln -sf python3 /usr/bin/python

# 📁 Setup your custom node
COPY . /data/custom
RUN chown -R node:node /data/custom

USER node
WORKDIR /data/custom

RUN npm install
RUN npm run build
RUN npm prune --omit=dev

ENV N8N_CUSTOM_EXTENSIONS=/data/custom
ENV N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true