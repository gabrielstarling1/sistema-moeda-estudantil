# Sistema de Moeda Estudantil — PUC Minas (Laboratório 3)

**Disciplina:** Projeto de Software — Profa. Milena Menezes Adão  
**Integrantes do Grupo:**
* Bernardo Parreiras Prado
* Gabriel Marcondes Starling Rocha
* João Paulo Aguiar Prado
* Rafael Nagem Volpini

---

## Arquitetura do Sistema (MVC + Persistência ORM/DAO)

O sistema foi construído em **Java 21 + Spring Boot 3 + Spring Data JPA (Hibernate) + PostgreSQL**, seguindo estritamente o **Diagrama de Classes** e o **Diagrama de Componentes** modelados na Sprint 1:

* **`model/`**: Entidades de domínio mapeadas via JPA com herança `InheritanceType.JOINED` (`Usuario` -> `Aluno`, `Professor`, `EmpresaParceira`; e `Transacao` -> `TransferenciaMoedas`, `ResgateVantagem`), além de `Endereco`, `InstituicaoEnsino`, `Vantagem`, `Cupom`, `StatusCupom` e `Extrato`.
* **`repository/`**: Camada de persistência (Padrão Repository / DAO) com `UsuarioRepository`, `AlunoRepository`, `ProfessorRepository`, `EmpresaRepository`, `InstituicaoRepository`, `VantagemRepository`, `TransacaoRepository` e `CupomRepository`.
* **`service/`**: Camada de regras de negócio (`AuthService`, `SessaoService`, `AlunoService`, `ProfessorService`, `EmpresaService`, `VantagemService`, `TransacaoService`, `EmailService`).
* **`controller/`**: Camada Controller REST/MVC (`AuthController`, `AlunoController`, `EmpresaController`, `InstituicaoController`, `ProfessorController`, `VantagemController`, `TransacaoController`).
* **`config/`**: `AuthInterceptor` (exige o token de login nas rotas `/api/**`), `WebConfig`, `SemestreScheduler` (crédito semestral), `DataInitializer` e `GlobalExceptionHandler`.
* **`resources/static/`**: Camada View (telas de Login, CRUD de Alunos, CRUD de Empresas Parceiras, Vantagens, Envio de Moedas, Extrato e Conferência de Cupons).

---

## Documentação por Sprint

* **[Sprint 1 (`docs/sprint1/`)](docs/sprint1/)**: Regras de Negócio (RN01–RN10), Histórias do Usuário (US01–US16), Diagrama de Casos de Uso, Diagrama de Classes e Diagrama de Componentes.
* **[Sprint 2 (`docs/sprint2/`)](docs/sprint2/)**: Modelo Entidade-Relacionamento (`ERSprint2.png` e script DDL PostgreSQL `schema.sql`), estratégia de persistência ORM/DAO e CRUDs de Aluno e Empresa Parceira.
* **[Sprint 3 (`docs/sprint3/`)](docs/sprint3/)**: Versão final dos CRUDs (incluindo as vantagens da empresa parceira), envio de moedas, extrato, resgate com cupom, e-mails, crédito semestral e autenticação da API.

---

## Como Executar o Projeto

Pré-requisitos: **JDK 21** e **Maven 3.9+** (ou uma IDE com Maven embutido). Docker é opcional.

### Opção 1: Com PostgreSQL (via Docker ou Instalação Local)
1. Suba o banco PostgreSQL e o servidor de e-mail de testes (Mailpit) com Docker Compose (ou crie o banco `moeda_estudantil` no seu PostgreSQL local na porta `5432`):
   ```bash
   docker compose up -d
   ```
2. Execute a aplicação:
   ```bash
   mvn spring-boot:run
   ```

### Opção 2: Modo Local Instantâneo (Sem precisar do PostgreSQL/Docker aberto)
Para rodar com banco em arquivo em modo de compatibilidade PostgreSQL (zero configuração):
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Acesse no navegador: **`http://localhost:8080`**

* Professores pré-cadastrados: `milena.adao` e `carlos.silva` (senha `123456`), com 1.000 moedas.
* E-mails enviados pelo sistema (moedas recebidas, cupom do aluno e conferência do parceiro): **`http://localhost:8025`** (Mailpit). Sem o Mailpit rodando, o conteúdo dos e-mails aparece no log da aplicação.
* Para usar um SMTP real, defina `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH=true` e `MAIL_STARTTLS=true`.

### Testes automatizados
```bash
mvn test
```

---

## Funcionalidades e API REST

Todas as rotas `/api/**` exigem o cabeçalho `Authorization: Bearer <token>` recebido no login, exceto `POST /api/auth/login`, `GET /api/instituicoes` e os autocadastros `POST /api/alunos` e `POST /api/empresas`.

| Requisito | Rota | Perfil |
|---|---|---|
| Login / logout | `POST /api/auth/login` · `POST /api/auth/logout` | Todos |
| CRUD de aluno | `GET/POST /api/alunos` · `GET/PUT/DELETE /api/alunos/{id}` | Aluno (próprio cadastro) |
| CRUD de empresa parceira | `GET/POST /api/empresas` · `GET/PUT/DELETE /api/empresas/{id}` | Empresa (próprio cadastro) |
| CRUD de vantagens (nome, descrição, foto e custo) | `GET/POST /api/vantagens` · `GET/PUT/DELETE /api/vantagens/{id}` | Empresa |
| Enviar moedas com motivo (e-mail ao aluno) | `POST /api/transacoes/transferencias` | Professor |
| Resgatar vantagem (cupom por e-mail ao aluno e ao parceiro) | `POST /api/transacoes/resgates` | Aluno |
| Extrato (saldo e transações) | `GET /api/transacoes/extrato` | Aluno e Professor |
| Conferência de cupons | `GET /api/transacoes/cupons` · `POST /api/transacoes/cupons/{codigo}/utilizar` | Empresa |

* **Crédito semestral (RN04):** ao iniciar e todos os dias às 00:05, o `SemestreScheduler` credita 1.000 moedas a cada professor quando começa um novo semestre (1º semestre: jan–jun; 2º: jul–dez), somando ao saldo atual.
* **Senhas:** armazenadas com hash BCrypt. Bancos criados antes da Sprint 3 têm as senhas convertidas automaticamente ao iniciar.
