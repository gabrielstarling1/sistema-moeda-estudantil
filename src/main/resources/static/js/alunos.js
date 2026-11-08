let listaAlunosCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({
        pagina: u => (u.tipoUsuario === 'ALUNO' ? 'cadastro' : 'alunos'),
        perfis: ['ALUNO', 'PROFESSOR']
    });
    if (!user) return;

    if (user.tipoUsuario === 'ALUNO') {
        document.title = 'Meu cadastro | Moeda Estudantil';
        document.getElementById('viewAluno').classList.remove('hidden');
        aplicarMascarasInput(['cpf'], [], ['cep']);
        document.getElementById('alunoForm').addEventListener('submit', salvarCadastro);
        document.getElementById('btnExcluirConta').addEventListener('click', excluirConta);
        await carregarInstituicoes();
        await carregarCadastro(user.id);
    } else {
        document.getElementById('viewProfessor').classList.remove('hidden');
        document.getElementById('buscaAlunoGrupo').insertAdjacentHTML('afterbegin', icone('buscar'));
        document.getElementById('buscaAluno').addEventListener('input', e => renderizarTabela(e.target.value));
        await carregarAlunos();
    }
});

// ---------------------------------------------------------------- Aluno

async function carregarInstituicoes() {
    try {
        const instituicoes = await apiRequest('/api/instituicoes');
        const select = document.getElementById('instituicaoId');
        instituicoes.forEach(i => select.add(new Option(i.nome, i.id)));
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

async function carregarCadastro(id) {
    try {
        const a = await apiRequest(`/api/alunos/${id}`);
        const campos = {
            nome: a.nome, email: a.email, cpf: a.cpf, rg: a.rg, curso: a.curso, login: a.login,
            instituicaoId: a.instituicaoEnsino ? a.instituicaoEnsino.id : ''
        };
        if (a.endereco) {
            Object.assign(campos, {
                cep: a.endereco.cep, uf: a.endereco.uf, cidade: a.endereco.cidade, bairro: a.endereco.bairro,
                logradouro: a.endereco.logradouro, numero: a.endereco.numero, complemento: a.endereco.complemento || ''
            });
        }
        Object.entries(campos).forEach(([campo, valor]) => { document.getElementById(campo).value = valor ?? ''; });
        document.getElementById('senha').value = '';

        document.getElementById('resumoSaldo').textContent = formatarNumero(a.saldoMoedas);
        document.getElementById('resumoAluno').innerHTML = [
            ['Instituição', a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-'],
            ['Curso', a.curso],
            ['Login', a.login],
            ['E-mail', a.email]
        ].map(([dt, dd]) => `<div class="dl-row"><dt>${dt}</dt><dd>${escapeHtml(dd)}</dd></div>`).join('');
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

async function salvarCadastro(e) {
    e.preventDefault();
    const user = obterUsuarioLogado();
    const valor = id => document.getElementById(id).value.trim();
    const payload = {
        nome: valor('nome'), email: valor('email'), cpf: valor('cpf'), rg: valor('rg'),
        instituicaoId: Number(valor('instituicaoId')) || null, curso: valor('curso'),
        cep: valor('cep'), uf: valor('uf').toUpperCase(), cidade: valor('cidade'), bairro: valor('bairro'),
        logradouro: valor('logradouro'), numero: valor('numero'), complemento: valor('complemento'),
        login: valor('login'), senha: document.getElementById('senha').value
    };
    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true);
    try {
        const atualizado = await apiRequest(`/api/alunos/${user.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        atualizarSessao({ nome: atualizado.nome, login: atualizado.login });
        renderizarLayout();
        await carregarCadastro(user.id);
        mostrarAlerta(null, 'Cadastro atualizado.');
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    } finally {
        definirCarregando(botao, false);
    }
}

async function excluirConta() {
    const user = obterUsuarioLogado();
    const confirmado = await abrirDialogo({
        titulo: 'Excluir sua conta?',
        corpoHtml: '<p>Seu cadastro será removido e você sairá do sistema. Esta ação não pode ser desfeita.</p>',
        confirmarTexto: 'Excluir conta',
        perigo: true
    });
    if (!confirmado) return;
    try {
        await apiRequest(`/api/alunos/${user.id}`, { method: 'DELETE' });
        logout();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

// ---------------------------------------------------------------- Professor

async function carregarAlunos() {
    try {
        listaAlunosCache = (await apiRequest('/api/alunos') || []).sort((a, b) => a.nome.localeCompare(b.nome));
        renderizarTabela('');
    } catch (err) {
        document.getElementById('tabelaAlunos').innerHTML =
            `<tr><td colspan="5">${estadoVazioHtml('Não foi possível carregar os alunos', err.message)}</td></tr>`;
    }
}

function renderizarTabela(filtro) {
    const termo = filtro.trim().toLowerCase();
    const alunos = listaAlunosCache.filter(a => !termo || [a.nome, a.email, a.curso, a.instituicaoEnsino && a.instituicaoEnsino.nome]
        .some(t => t && t.toLowerCase().includes(termo)));

    document.getElementById('contadorAlunos').textContent =
        `${alunos.length} ${alunos.length === 1 ? 'aluno' : 'alunos'}`;

    const tbody = document.getElementById('tabelaAlunos');
    if (alunos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">${termo
            ? estadoVazioHtml('Nenhum aluno encontrado', 'Tente outro termo de busca.')
            : estadoVazioHtml('Nenhum aluno cadastrado', 'Os alunos aparecem aqui depois de criarem a conta.')}</td></tr>`;
        return;
    }
    tbody.innerHTML = alunos.map(a => `
        <tr>
            <td>
                <div class="cell-title">${escapeHtml(a.nome)}</div>
                <div class="cell-sub">${escapeHtml(a.email)}</div>
            </td>
            <td>${escapeHtml(a.curso)}</td>
            <td>${escapeHtml(a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-')}</td>
            <td class="right"><span class="coin">${formatarNumero(a.saldoMoedas)}</span></td>
            <td class="actions">
                <a class="btn btn-secondary btn-sm" href="/transferencia.html?aluno=${a.id}">${icone('enviar', 'icon-sm')} Enviar moedas</a>
            </td>
        </tr>`).join('');
}
