# Lab 3 / Sprint 3 - Versão final do sistema

**Participantes do grupo:**
* Bernardo Parreiras Prado
* Gabriel Marcondes Starling Rocha
* João Paulo Aguiar Prado
* Rafael Nagem Volpini

## O que foi entregue

| Requisito do enunciado | Implementação |
|---|---|
| CRUDs de aluno e empresa parceira (versão final) | Telas `alunos.html` e `empresas.html`; cadastro na tela de login. Só o dono do cadastro pode alterá-lo ou excluí-lo |
| Empresa cadastra vantagens com descrição, foto e custo (RN08) | CRUD em `vantagens.html` e `/api/vantagens`; a foto é gravada em `uploads/vantagens/` |
| Professor envia moedas com motivo obrigatório e saldo suficiente (RN05) | `transferencia.html` → `TransacaoService.enviarMoedas` → `Professor.enviarMoedas` |
| Aluno é notificado por e-mail ao receber moedas (RN06) | `EmailService.enviarNotificacaoTransferencia` |
| 1.000 moedas por semestre, acumuláveis (RN04) | `SemestreScheduler` → `ProfessorService.creditarSemestreAtual` → `Professor.creditarSemestre` |
| Extrato de aluno e professor (RN07) | `extrato.html` → `TransacaoService.consultarExtrato` → `Aluno/Professor.consultarExtrato` |
| Resgate de vantagem com débito do saldo (RN09) | Botão "Resgatar" em `vantagens.html` → `TransacaoService.resgatarVantagem` → `Aluno.debitarMoedas` |
| Cupom com código único por e-mail ao aluno e ao parceiro (RN10) | `Cupom` com código `ME-XXXXXXXX`; `EmailService.enviarCupomAluno` e `enviarConferenciaParceiro`; conferência em `cupons.html` |
| Login e senha com autenticação (RN01) | Senha com hash BCrypt (`Usuario.definirSenha` / `autenticar`); token de sessão exigido pelo `AuthInterceptor` em `/api/**` |

## Atualizações de modelo em relação à Sprint 1 e 2

Itens novos no código que os diagramas precisam refletir:

**Diagrama de classes**
* `Usuario`: novo método `definirSenha(senhaPura)`; `senhaHash` passa a guardar o hash BCrypt.
* `Professor`: novo atributo `ultimoSemestreCreditado : String`, usado para creditar as 1.000 moedas uma única vez por semestre.
* `Cupom`: novo método `utilizar()`, que muda o status de `EMITIDO` para `UTILIZADO`.

**Diagrama de componentes**
* Controller: `InstituicaoController` (já existia no código, ainda não está no diagrama).
* Services: `SessaoService` (tokens de login).
* Persistência: `CupomRepository`.
* Configuração: `AuthInterceptor` (entre View e Controllers), `SemestreScheduler` (chama `ProfessorService`), `WebConfig`.
* Servidor SMTP: em desenvolvimento é o Mailpit do `docker-compose.yml` (caixa de entrada em `http://localhost:8025`).

**Modelo ER**
* Tabela `professores`: nova coluna `ultimo_semestre_creditado VARCHAR(7)`, criada automaticamente pelo Hibernate (`ddl-auto=update`).

## Roteiro de teste manual

1. `docker compose up -d` e `mvn spring-boot:run` (ou `mvn spring-boot:run -Dspring-boot.run.profiles=local` sem Docker).
2. Cadastre uma empresa parceira na tela de login e, em **Minhas Vantagens**, cadastre uma vantagem com foto.
3. Saia e cadastre um aluno.
4. Entre como `milena.adao` / `123456` e, em **Enviar Moedas**, envie moedas ao aluno com um motivo.
5. Abra `http://localhost:8025` e confira o e-mail recebido pelo aluno.
6. Entre como o aluno, resgate a vantagem e anote o código do cupom (também no **Extrato** e no e-mail).
7. Entre como a empresa e, em **Conferência de Cupons**, confirme o código.
