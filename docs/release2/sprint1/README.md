# Release 2 / Sprint 1 (Lab04S01) — Diagramas de Sequência, Visão Geral de Interação e Casos de Uso Restantes

**Participantes do grupo:**
* Bernardo Parreiras Prado
* Gabriel Marcondes Starling Rocha
* João Paulo Aguiar Prado
* Rafael Nagem Volpini

> **Nota sobre os casos de uso:** Todos os casos de uso restantes do enunciado (CRUD de vantagens pela empresa parceira, envio de moedas pelo professor com notificação por e-mail, crédito semestral acumulável de 1.000 moedas, consulta de extrato, resgate de vantagem com emissão de cupom e envio dos dois e-mails, conferência presencial de cupom e autenticação por token) já estão implementados e verificados pelos testes automatizados em [`Sprint3FluxosTests.java`](../../../src/test/java/br/pucminas/moedaestudantil/Sprint3FluxosTests.java).

---

## 1. Diagrama de Visão Geral de Interação (UML Interaction Overview)

```mermaid
flowchart TD
    Inicio([Início]) --> Auth["sd Autenticar Usuário (RN01)"]
    Auth --> DecisaoAuth{Autenticado?}
    DecisaoAuth -- Não --> Cadastro["sd Autocadastro Aluno / Empresa (RN02)"]
    Cadastro --> Auth
    DecisaoAuth -- Sim --> Perfil{Tipo de Perfil}

    Perfil -- ALUNO --> AlunoOp{Ação do Aluno}
    AlunoOp --> ExtratoA["sd Consultar Extrato (RN07)"]
    AlunoOp --> Resgate["sd Resgatar Vantagem e Emitir Cupom (RN09, RN10)"]
    AlunoOp --> CrudAluno["sd Manter Próprio Cadastro (US01-US03)"]

    Perfil -- PROFESSOR --> ProfOp{Ação do Professor}
    ProfOp --> Enviar["sd Enviar Moedas com Motivo e E-mail (RN05, RN06)"]
    ProfOp --> ExtratoP["sd Consultar Extrato (RN07)"]
    ProfOp --> Credito["sd Crédito Semestral Automático +1.000 (RN04)"]

    Perfil -- EMPRESA --> EmpOp{Ação da Empresa}
    EmpOp --> Vantagem["sd Manter Vantagens com Foto e Custo (RN08)"]
    EmpOp --> Conferir["sd Conferir e Utilizar Cupom (RN10)"]
    EmpOp --> CrudEmp["sd Manter Próprio Cadastro (US12-US14)"]

    ExtratoA --> Fim([Fim / Logout])
    Resgate --> Fim
    CrudAluno --> Fim
    Enviar --> Fim
    ExtratoP --> Fim
    Credito --> Fim
    Vantagem --> Fim
    Conferir --> Fim
    CrudEmp --> Fim
```

---

## 2. Diagramas de Sequência UML

### 2.1 Autenticação e Validação de Sessão (`RN01`)

```mermaid
sequenceDiagram
    actor Usuario as Usuário (Aluno / Professor / Empresa)
    participant View as login.html / login.js
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant Repo as UsuarioRepository
    participant Ent as Usuario (Entidade)
    participant Sessao as SessaoService
    participant Guard as AuthInterceptor

    Usuario->>View: Informa login e senha
    View->>Ctrl: POST /api/auth/login (LoginRequestDTO)
    Ctrl->>Svc: autenticar(dto)
    Svc->>Repo: findByLogin(dto.getLogin())
    Repo-->>Svc: Usuario
    Svc->>Ent: autenticar(login, senha)
    Ent-->>Svc: true (BCrypt match)
    Svc->>Sessao: abrirSessao(UsuarioSessao)
    Sessao-->>Svc: token UUID
    Svc-->>Ctrl: AuthResponseDTO(id, login, nome, tipo, token)
    Ctrl-->>View: 200 OK + JSON
    View->>View: localStorage.setItem('usuarioLogado')

    Note over View,Guard: Nas requisições seguintes para /api/**
    View->>Guard: Requisição com Authorization: Bearer <token>
    Guard->>Sessao: buscar(token)
    Sessao-->>Guard: Optional<UsuarioSessao>
    Guard-->>Ctrl: request.setAttribute("usuarioSessao", sessao)
```

### 2.2 Autocadastro e Manutenção de Aluno (`RN02`, `US01`–`US03`)

```mermaid
sequenceDiagram
    actor AlunoActor as Aluno
    participant View as login.html / alunos.html
    participant InstCtrl as InstituicaoController
    participant Ctrl as AlunoController
    participant Svc as AlunoService
    participant InstRepo as InstituicaoRepository
    participant UserRepo as UsuarioRepository
    participant AlunoRepo as AlunoRepository

    View->>InstCtrl: GET /api/instituicoes
    InstCtrl-->>View: Lista de instituições pré-cadastradas
    AlunoActor->>View: Preenche dados pessoais, endereço, instituição e acesso
    View->>Ctrl: POST /api/alunos (AlunoRequestDTO)
    Ctrl->>Svc: cadastrar(dto)
    Svc->>UserRepo: existsByLogin(dto.getLogin())
    Svc->>AlunoRepo: existsByCpf / existsByEmail
    Svc->>InstRepo: findById(dto.getInstituicaoId())
    InstRepo-->>Svc: InstituicaoEnsino
    Svc->>Svc: Cria Endereco + Aluno (saldoMoedas = 0, senha BCrypt)
    Svc->>AlunoRepo: save(aluno)
    AlunoRepo-->>Svc: Aluno persistido
    Svc-->>Ctrl: Aluno
    Ctrl-->>View: 201 Created
```

### 2.3 Cadastro de Vantagem pela Empresa Parceira (`RN08`)

```mermaid
sequenceDiagram
    actor EmpresaActor as Empresa Parceira
    participant View as vantagens.html / vantagens.js
    participant Ctrl as VantagemController
    participant Svc as VantagemService
    participant EmpRepo as EmpresaRepository
    participant FS as Disco (/uploads/vantagens/)
    participant Repo as VantagemRepository

    EmpresaActor->>View: Preenche nome, descrição, custo e seleciona foto
    View->>View: FileReader converte foto para Data URL (base64)
    View->>Ctrl: POST /api/vantagens (VantagemRequestDTO)
    Ctrl->>Ctrl: sessao.exigirTipo("EMPRESA")
    Ctrl->>Svc: cadastrar(sessao.id(), dto)
    Svc->>EmpRepo: findById(empresaId)
    EmpRepo-->>Svc: EmpresaParceira
    Svc->>FS: salvarFoto(base64) → grava arquivo UUID
    FS-->>Svc: "/uploads/vantagens/<uuid>.png"
    Svc->>Repo: save(Vantagem)
    Repo-->>Svc: Vantagem salva
    Svc-->>Ctrl: Vantagem
    Ctrl-->>View: 201 Created
```

### 2.4 Envio de Moedas pelo Professor (`RN05`, `RN06`)

```mermaid
sequenceDiagram
    actor ProfActor as Professor
    participant View as transferencia.html / transferencia.js
    participant Ctrl as TransacaoController
    participant Svc as TransacaoService
    participant ProfRepo as ProfessorRepository
    participant AlunoRepo as AlunoRepository
    participant ProfEnt as Professor
    participant AlunoEnt as Aluno
    participant TransRepo as TransacaoRepository
    participant Mail as EmailService

    ProfActor->>View: Seleciona aluno, quantidade e motivo obrigatório
    View->>Ctrl: POST /api/transacoes/transferencias (TransferenciaRequestDTO)
    Ctrl->>Ctrl: sessao.exigirTipo("PROFESSOR")
    Ctrl->>Svc: enviarMoedas(sessao.id(), dto)
    Svc->>ProfRepo: findById(professorId)
    ProfRepo-->>Svc: Professor
    Svc->>AlunoRepo: findById(dto.getAlunoId())
    AlunoRepo-->>Svc: Aluno
    Svc->>ProfEnt: enviarMoedas(aluno, valor, motivo)
    alt Saldo insuficiente ou motivo vazio
        ProfEnt-->>Svc: throws IllegalStateException / IllegalArgumentException
    else Saldo suficiente
        ProfEnt->>ProfEnt: saldoMoedas -= valor
        ProfEnt->>AlunoEnt: receberMoedas(valor)
        ProfEnt-->>Svc: TransferenciaMoedas
        Svc->>TransRepo: save(transferencia)
        Svc->>Mail: enviarNotificacaoTransferencia(aluno, professor, valor, motivo)
        Svc-->>Ctrl: TransacaoDTO
        Ctrl-->>View: 201 Created
    end
```

### 2.5 Consulta de Extrato (`RN07`)

```mermaid
sequenceDiagram
    actor Usuario as Aluno ou Professor
    participant View as extrato.html / extrato.js
    participant Ctrl as TransacaoController
    participant Svc as TransacaoService
    participant Repo as AlunoRepository / ProfessorRepository
    participant Ent as Aluno / Professor

    Usuario->>View: Acessa página de Extrato
    View->>Ctrl: GET /api/transacoes/extrato
    Ctrl->>Svc: consultarExtrato(sessao)
    Svc->>Svc: sessao.exigirTipo("ALUNO", "PROFESSOR")
    Svc->>Repo: findById(sessao.id())
    Repo-->>Svc: Aluno ou Professor
    Svc->>Ent: consultarExtrato()
    Ent-->>Svc: Extrato(saldoAtual, transacoes)
    Svc-->>Ctrl: ExtratoDTO(nome, tipoUsuario, saldoAtual, transacoesOrdenadas)
    Ctrl-->>View: 200 OK
```

### 2.6 Resgate de Vantagem com Cupom e E-mails (`RN09`, `RN10`)

```mermaid
sequenceDiagram
    actor AlunoActor as Aluno
    participant View as vantagens.html / vantagens.js
    participant Ctrl as TransacaoController
    participant Svc as TransacaoService
    participant AlunoRepo as AlunoRepository
    participant VantRepo as VantagemRepository
    participant AlunoEnt as Aluno
    participant CupomRepo as CupomRepository
    participant TransRepo as TransacaoRepository
    participant Mail as EmailService

    AlunoActor->>View: Clica em "Resgatar" e confirma diálogo
    View->>Ctrl: POST /api/transacoes/resgates (ResgateRequestDTO)
    Ctrl->>Ctrl: sessao.exigirTipo("ALUNO")
    Ctrl->>Svc: resgatarVantagem(sessao.id(), dto)
    Svc->>AlunoRepo: findById(alunoId)
    Svc->>VantRepo: findById(vantagemId)
    Svc->>AlunoEnt: debitarMoedas(vantagem.getCustoMoedas())
    Svc->>Svc: Cria ResgateVantagem + gera código único "ME-XXXXXXXX"
    Svc->>CupomRepo: existsByCodigo(codigo)
    Svc->>TransRepo: save(resgate) (cascade salva Cupom)
    Svc->>Mail: enviarCupomAluno(aluno, vantagem, codigo)
    Svc->>Mail: enviarConferenciaParceiro(empresa, aluno, vantagem, codigo)
    Svc-->>Ctrl: TransacaoDTO(codigoCupom, ...)
    Ctrl-->>View: 201 Created (exibe código do cupom)
```

### 2.7 Conferência Presencial do Cupom pela Empresa Parceira (`RN10`)

```mermaid
sequenceDiagram
    actor EmpresaActor as Empresa Parceira
    participant View as cupons.html / cupons.js
    participant Ctrl as TransacaoController
    participant Svc as TransacaoService
    participant CupomRepo as CupomRepository
    participant CupomEnt as Cupom

    EmpresaActor->>View: Informa código ME-XXXXXXXX apresentado pelo aluno
    View->>Ctrl: POST /api/transacoes/cupons/{codigo}/utilizar
    Ctrl->>Ctrl: sessao.exigirTipo("EMPRESA")
    Ctrl->>Svc: utilizarCupom(sessao.id(), codigo)
    Svc->>CupomRepo: findByCodigo(codigoNormalizado)
    CupomRepo-->>Svc: Cupom
    Svc->>Svc: Valida se a vantagem pertence à empresa da sessão
    Svc->>CupomEnt: utilizar() (EMITIDO -> UTILIZADO)
    CupomEnt-->>Svc: Status atualizado
    Svc-->>Ctrl: CupomDTO
    Ctrl-->>View: 200 OK
```

---

## 3. Alinhamento com os Modelos da Release 1

Todas as atualizações estruturais introduzidas a partir da Sprint 3 (hash BCrypt em `Usuario.definirSenha`, atributo `Professor.ultimoSemestreCreditado`, `Cupom.utilizar()`, `SessaoService`, `AuthInterceptor`, `SemestreScheduler`, `WebConfig` e `InstituicaoController`) estão refletidas nos diagramas desta Release 2 e documentadas em [`docs/sprint3/README.md`](../../sprint3/README.md).
