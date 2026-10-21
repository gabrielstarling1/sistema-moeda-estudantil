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
* **`repository/`**: Camada de persistência (Padrão Repository / DAO) com `UsuarioRepository`, `AlunoRepository`, `ProfessorRepository`, `EmpresaRepository`, `InstituicaoRepository`, `VantagemRepository` e `TransacaoRepository`.
* **`service/`**: Camada de regras de negócio (`AuthService`, `AlunoService`, `ProfessorService`, `EmpresaService`, `VantagemService`, `TransacaoService`, `EmailService`).
* **`controller/`**: Camada Controller REST/MVC (`AuthController`, `AlunoController`, `EmpresaController`, `InstituicaoController`, `ProfessorController`, `VantagemController`, `TransacaoController`).
* **`resources/static/`**: Camada View (Telas Web responsivas para Login, CRUD de Alunos e CRUD de Empresas Parceiras).

---

## Documentação por Sprint

* **[Sprint 1 (`docs/sprint1/`)](docs/sprint1/)**: Regras de Negócio (RN01–RN10), Histórias do Usuário (US01–US16), Diagrama de Casos de Uso, Diagrama de Classes e Diagrama de Componentes.
* **[Sprint 2 (`docs/sprint2/`)](docs/sprint2/)**: Modelo Entidade-Relacionamento (`ERSprint2.png` e script DDL PostgreSQL `schema.sql`), estratégia de persistência ORM/DAO e CRUDs de Aluno e Empresa Parceira.

---

## Como Executar o Projeto

### Opção 1: Com PostgreSQL (via Docker ou Instalação Local)
1. Suba o banco PostgreSQL com Docker Compose (ou crie o banco `moeda_estudantil` no seu PostgreSQL local na porta `5432`):
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
