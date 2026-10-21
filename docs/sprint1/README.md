# Lab 3 / Sprint 1 - Modelagem: Regras de Negócio e Histórias do Usuário

**Participantes do grupo:**
* Bernardo Parreiras Prado
* Gabriel Marcondes Starling Rocha
* João Paulo Aguiar Prado
* Rafael Nagem Volpini

## Artefatos da Sprint 1 (nesta pasta)
* `diagrama-casos-de-uso.jpg` — Diagrama de Casos de Uso
* `diagrama-classes.png` — Diagrama de Classes UML
* `diagrama-componentes.png` — Diagrama de Componentes (Arquitetura MVC + Camada de Persistência)

## Regras de Negócio
* **RN01** - Todo acesso ao sistema (aluno, professor ou empresa parceira) exige login e senha cadastrados e autenticação prévia.
* **RN02** - As instituições de ensino são pré-cadastradas; o aluno apenas seleciona uma delas no cadastro.
* **RN03** - Os professores são pré-cadastrados (a instituição envia a lista na parceria) com nome, CPF, departamento e instituição de vínculo.
* **RN04** - A cada semestre, cada professor recebe 1.000 moedas. O saldo é acumulável: o que não for distribuído permanece e os 1.000 novos são somados ao saldo corrente.
* **RN05** - Para enviar moedas, o professor precisa ter saldo suficiente, escolher o aluno e informar um motivo (mensagem aberta, obrigatória).
* **RN06** - Ao receber moedas, o aluno é notificado por e-mail.
* **RN07** - Professor e aluno podem consultar o extrato: saldo atual e transações (professor: envios; aluno: recebimentos e trocas).
* **RN08** - Toda vantagem tem nome, descrição, foto e custo em moedas, e pertence a uma empresa parceira.
* **RN09** - Ao resgatar uma vantagem, o custo é descontado do saldo do aluno (o saldo deve ser suficiente).
* **RN10** - No resgate, o sistema gera um código único e envia dois e-mails com esse código: cupom ao aluno e e-mail de conferência ao parceiro.
