# Release 2 / Sprint 2 (Lab04S02) — Diagrama de Implantação e Implantação na Nuvem

**Participantes do grupo:**
* Bernardo Parreiras Prado
* Gabriel Marcondes Starling Rocha
* João Paulo Aguiar Prado
* Rafael Nagem Volpini

---

## 1. Diagramas de Implantação UML

Esta pasta reúne os Diagramas de Implantação do **Sistema de Moeda Estudantil**, contemplando o ambiente de produção em nuvem (**Vercel + Render**) e os dois perfis de execução local do projeto:

1. **[`diagrama-implantacao-nuvem-vercel-render.svg`](diagrama-implantacao-nuvem-vercel-render.svg)** (e código-fonte PlantUML em [`diagrama-implantacao.puml`](diagrama-implantacao.puml)) — Arquitetura de implantação em nuvem recomendada pelo enunciado (`Lab04S02`):
   * **`Dispositivo do usuário «device»`** (`Navegador Web «executionEnvironment»`): executa as páginas `HTML/CSS/JS` e armazena a sessão em `localStorage: usuarioLogado`.
   * **`Vercel Edge Network «executionEnvironment»`**: serve a pasta estática [`src/main/resources/static/`](../../../src/main/resources/static/) e redireciona `/api/:path*` e `/uploads/:path*` via [`vercel.json`](../../../vercel.json) para o back-end no Render.
   * **`Render Cloud (Web Service) «device»`**: container Docker (`eclipse-temurin:21-jre-alpine`, gerado pelo [`Dockerfile`](../../../Dockerfile)) executando `sistema-moeda-estudantil-0.0.1-SNAPSHOT.jar` na porta dinâmica `$PORT`, com suporte a CORS em [`WebConfig.java`](../../../src/main/java/br/pucminas/moedaestudantil/config/WebConfig.java).
   * **`Render Managed PostgreSQL «executionEnvironment»`**: banco `PostgreSQL 16` (`moeda_estudantil`) conectado via JDBC com conversão automática de `DATABASE_URL` (`postgres://...`) em [`SistemaMoedaEstudantilApplication.java`](../../../src/main/java/br/pucminas/moedaestudantil/SistemaMoedaEstudantilApplication.java).
   * **`Servidor SMTP externo «device»`** (opcional): envio de e-mails de transferência (RN06) e cupons (RN10); quando `MAIL_ENABLED=false`, o conteúdo é registrado nos logs do Render.

2. **[`diagrama-implantacao-postgresql-docker.jpg`](diagrama-implantacao-postgresql-docker.jpg)** — Implantação local padrão com Docker (`PostgreSQL 16` na porta `5432` + volume `postgres_data` e servidor SMTP/Mailpit via [`docker-compose.yml`](../../../docker-compose.yml)).

3. **[`diagrama-implantacao-local-h2.png`](diagrama-implantacao-local-h2.png)** — Implantação local em perfil `local` com banco embarcado H2 em arquivo (`./data/moeda_estudantil_db.mv.db` e `/h2-console`), conforme [`application-local.properties`](../../../src/main/resources/application-local.properties).

---

## 2. Arquivos de Configuração para Nuvem

| Arquivo / Componente | Função |
|---|---|
| [`Dockerfile`](../../../Dockerfile) | Build multi-stage com Maven 3.9 + JDK 21 e runtime `eclipse-temurin:21-jre-alpine` respeitando `${PORT}`. |
| [`.dockerignore`](../../../.dockerignore) | Exclui `target/`, `.git/`, `data/`, `uploads/` e documentação da imagem Docker. |
| [`render.yaml`](../../../render.yaml) | Blueprint do Render provisionando o PostgreSQL gerenciado (`moeda-estudantil-db`) e o Web Service Docker (`sistema-moeda-estudantil-api`). |
| [`vercel.json`](../../../vercel.json) | Publica os arquivos estáticos de `src/main/resources/static` e configura `rewrites` de `/api/:path*` e `/uploads/:path*` para o Render. |
| [`SistemaMoedaEstudantilApplication.java`](../../../src/main/java/br/pucminas/moedaestudantil/SistemaMoedaEstudantilApplication.java) | Converte automaticamente `DATABASE_URL` / `DB_URL` do formato `postgres://` (Render) para `jdbc:postgresql://` e extrai `DB_USER` e `DB_PASSWORD`. |
| [`WebConfig.java`](../../../src/main/java/br/pucminas/moedaestudantil/config/WebConfig.java) | Configura CORS (`app.cors.allowed-origins`) para permitir requisições do front-end hospedado na Vercel. |
| [`application.properties`](../../../src/main/resources/application.properties) | Parametriza `server.port=${PORT:8080}`, `spring.web.resources.static-locations` e `app.cors.allowed-origins`. |
| [`api.js`](../../../src/main/resources/static/js/api.js) | Suporta proxy relativo (`/api/...`) na Vercel ou URL explícita via `window.MOEDA_API_URL` / `localStorage.MOEDA_API_URL`, incluindo imagens `/uploads/...`. |

---

## 3. Passo a Passo para Implantação (Render + Vercel)

### 3.1 Back-end + PostgreSQL no Render
1. Acesse o dashboard do **Render** e clique em **New → Blueprint** (ou **New → Web Service**).
2. Conecte este repositório do GitHub; o Render lerá automaticamente o arquivo [`render.yaml`](../../../render.yaml).
3. Serão criados:
   * Banco PostgreSQL gratuito **`moeda-estudantil-db`** (`PostgreSQL 16`);
   * Serviço Web Docker **`sistema-moeda-estudantil-api`** com `healthCheckPath: /api/instituicoes`.
4. (Opcional) Para envio real de e-mails (RN06/RN10), defina no painel do Render as variáveis `MAIL_ENABLED=true`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH=true` e `MAIL_STARTTLS=true`.
5. Após o deploy, anote a URL pública gerada pelo Render (ex.: `https://sistema-moeda-estudantil-api.onrender.com`).

### 3.2 Front-end na Vercel
1. Caso o serviço no Render tenha recebido um sufixo diferente de `https://sistema-moeda-estudantil-api.onrender.com`, atualize os dois destinos em [`vercel.json`](../../../vercel.json).
2. Acesse a **Vercel**, clique em **Add New → Project** e importe o mesmo repositório do GitHub.
3. Como [`vercel.json`](../../../vercel.json) já define `"outputDirectory": "src/main/resources/static"` e os `rewrites`, basta clicar em **Deploy**.
4. Acesse a URL da Vercel publicada; a aplicação redirecionará para `/login.html` e se comunicará com a API no Render.
