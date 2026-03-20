FROM mcr.microsoft.com/playwright:v1.58.2-noble

ENV CI=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /workspace/email-assistant

COPY frontend/App/package.json frontend/App/package-lock.json ./frontend/App/
COPY tools/design-capture/package.json tools/design-capture/package-lock.json ./tools/design-capture/

RUN npm --prefix frontend/App ci
RUN npm --prefix tools/design-capture ci

COPY . .

CMD ["node", "tools/design-capture/capture.mjs"]
