document.addEventListener('DOMContentLoaded', () => {
    const user = obterUsuarioLogado();
    if (user && user.token) {
        window.location.replace('/index.html');
        return;
    }

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => trocarAba(tab.dataset.aba));
    });
    document.getElementById('btnExemploAluno').addEventListener('click', preencherExemploAluno);
    document.getElementById('btnExemploEmpresa').addEventListener('click', preencherExemploEmpresa);

    document.getElementById('loginForm').addEventListener('submit', entrar);
    document.getElementById('cadastroAlunoForm').addEventListener('submit', cadastrarAluno);
    document.getElementById('cadastroEmpresaForm').addEventListener('submit', cadastrarEmpresa);

    aplicarMascarasInput(['alCpf'], ['empCnpj'], ['alCep']);
    carregarInstituicoes();
});

function trocarAba(aba) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.aba === aba));
    document.querySelectorAll('[data-painel]').forEach(p => p.classList.toggle('hidden', p.dataset.painel !== aba));
}

async function carregarInstituicoes() {
    try {
        const instituicoes = await apiRequest('/api/instituicoes');
        const select = document.getElementById('alInstituicaoId');
        instituicoes.forEach(i => select.add(new Option(i.nome, i.id)));
    } catch (err) {
        mostrarAlerta(null, 'Não foi possível carregar as instituições: ' + err.message, 'error');
    }
}

async function autenticar(login, senha) {
    const sessao = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, senha })
    });
    salvarSessao(sessao);
    window.location.replace('/index.html');
}

async function entrar(e) {
    e.preventDefault();
    const login = document.getElementById('loginInput').value.trim();
    const senha = document.getElementById('senhaInput').value;
    if (!login || !senha) {
        mostrarAlerta(null, 'Informe o login e a senha.', 'error');
        return;
    }
    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true, 'Entrando...');
    try {
        await autenticar(login, senha);
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
        definirCarregando(botao, false);
    }
}

async function cadastrarAluno(e) {
    e.preventDefault();
    const valor = id => document.getElementById(id).value.trim();
    const payload = {
        nome: valor('alNome'),
        email: valor('alEmail'),
        cpf: valor('alCpf'),
        rg: valor('alRg'),
        instituicaoId: Number(valor('alInstituicaoId')) || null,
        curso: valor('alCurso'),
        cep: valor('alCep'),
        uf: valor('alUf').toUpperCase(),
        cidade: valor('alCidade'),
        bairro: valor('alBairro'),
        logradouro: valor('alLogradouro'),
        numero: valor('alNumero'),
        complemento: valor('alComplemento'),
        login: valor('alLogin'),
        senha: document.getElementById('alSenha').value
    };
    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true, 'Criando conta...');
    try {
        await apiRequest('/api/alunos', { method: 'POST', body: JSON.stringify(payload) });
        await autenticar(payload.login, payload.senha);
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
        definirCarregando(botao, false);
    }
}

async function cadastrarEmpresa(e) {
    e.preventDefault();
    const valor = id => document.getElementById(id).value.trim();
    const payload = {
        nome: valor('empNome'),
        cnpj: valor('empCnpj'),
        email: valor('empEmail'),
        login: valor('empLogin'),
        senha: document.getElementById('empSenha').value
    };
    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true, 'Criando conta...');
    try {
        await apiRequest('/api/empresas', { method: 'POST', body: JSON.stringify(payload) });
        await autenticar(payload.login, payload.senha);
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
        definirCarregando(botao, false);
    }
}

// Dados de exemplo para demonstracao em sala
function preencherExemploAluno() {
    const sufixo = Math.floor(100 + Math.random() * 899);
    const campos = {
        alNome: 'João Paulo Aguiar Prado',
        alEmail: `joaopaulo.${sufixo}@sga.pucminas.br`,
        alCpf: `123.456.${sufixo}-09`,
        alRg: `MG-19.${sufixo}.210`,
        alCurso: 'Engenharia de Software',
        alCep: '30535-901',
        alUf: 'MG',
        alCidade: 'Belo Horizonte',
        alLogradouro: 'Av. Dom José Gaspar',
        alBairro: 'Coração Eucarístico',
        alNumero: '500',
        alComplemento: 'Prédio 34',
        alLogin: `joaopaulo.${sufixo}`,
        alSenha: '123456'
    };
    Object.entries(campos).forEach(([id, v]) => { document.getElementById(id).value = v; });
    const select = document.getElementById('alInstituicaoId');
    if (select.options.length > 1) select.selectedIndex = 1;
}

function preencherExemploEmpresa() {
    const sufixo = Math.floor(100 + Math.random() * 899);
    document.getElementById('empNome').value = `Livraria Universitária ${sufixo}`;
    document.getElementById('empCnpj').value = `18.234.${sufixo}/0001-80`;
    document.getElementById('empEmail').value = `contato.${sufixo}@livrariauniversitaria.com.br`;
    document.getElementById('empLogin').value = `livraria.${sufixo}`;
    document.getElementById('empSenha').value = '123456';
}
