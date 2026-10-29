let listaEmpresasCache = [];
let vantagensPorEmpresa = {};

document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({
        pagina: u => (u.tipoUsuario === 'EMPRESA' ? 'cadastro' : 'empresas'),
        perfis: ['EMPRESA', 'PROFESSOR']
    });
    if (!user) return;

    if (user.tipoUsuario === 'EMPRESA') {
        document.title = 'Dados da empresa | Moeda Estudantil';
        document.getElementById('viewEmpresa').classList.remove('hidden');
        aplicarMascarasInput([], ['cnpj'], []);
        document.getElementById('empresaForm').addEventListener('submit', salvarCadastro);
        document.getElementById('btnExcluirEmpresa').addEventListener('click', excluirEmpresa);
        await carregarCadastro(user.id);
    } else {
        document.getElementById('viewProfessor').classList.remove('hidden');
        document.getElementById('buscaEmpresaGrupo').insertAdjacentHTML('afterbegin', icone('buscar'));
        document.getElementById('buscaEmpresa').addEventListener('input', e => renderizarTabela(e.target.value));
        await carregarEmpresas();
    }
});

// ---------------------------------------------------------------- Empresa

async function carregarCadastro(id) {
    try {
        const [emp, vantagens, cupons] = await Promise.all([
            apiRequest(`/api/empresas/${id}`),
            apiRequest(`/api/vantagens?empresaId=${id}`),
            apiRequest('/api/transacoes/cupons')
        ]);
        document.getElementById('nome').value = emp.nome;
        document.getElementById('cnpj').value = emp.cnpj;
        document.getElementById('email').value = emp.email;
        document.getElementById('login').value = emp.login;
        document.getElementById('senha').value = '';

        document.getElementById('resumoEmpresa').innerHTML = [
            ['CNPJ', emp.cnpj],
            ['Vantagens publicadas', formatarNumero(vantagens.length)],
            ['Cupons emitidos', formatarNumero(cupons.length)],
            ['Login', emp.login]
        ].map(([dt, dd]) => `<div class="dl-row"><dt>${dt}</dt><dd>${escapeHtml(dd)}</dd></div>`).join('');
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

async function salvarCadastro(e) {
    e.preventDefault();
    const user = obterUsuarioLogado();
    const payload = {
        nome: document.getElementById('nome').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        email: document.getElementById('email').value.trim(),
        login: document.getElementById('login').value.trim(),
        senha: document.getElementById('senha').value
    };
    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true);
    try {
        const atualizada = await apiRequest(`/api/empresas/${user.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        atualizarSessao({ nome: atualizada.nome, login: atualizada.login });
        renderizarLayout();
        await carregarCadastro(user.id);
        mostrarAlerta(null, 'Dados da empresa atualizados.');
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    } finally {
        definirCarregando(botao, false);
    }
}

async function excluirEmpresa() {
    const user = obterUsuarioLogado();
    const confirmado = await abrirDialogo({
        titulo: 'Excluir o cadastro da empresa?',
        corpoHtml: '<p>A empresa e as vantagens publicadas serão removidas, e você sairá do sistema. Esta ação não pode ser desfeita.</p>',
        confirmarTexto: 'Excluir cadastro',
        perigo: true
    });
    if (!confirmado) return;
    try {
        await apiRequest(`/api/empresas/${user.id}`, { method: 'DELETE' });
        logout();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

// ---------------------------------------------------------------- Professor

async function carregarEmpresas() {
    try {
        const [empresas, vantagens] = await Promise.all([apiRequest('/api/empresas'), apiRequest('/api/vantagens')]);
        listaEmpresasCache = (empresas || []).sort((a, b) => a.nome.localeCompare(b.nome));
        vantagensPorEmpresa = {};
        (vantagens || []).forEach(v => {
            const id = v.empresaParceira && v.empresaParceira.id;
            vantagensPorEmpresa[id] = (vantagensPorEmpresa[id] || 0) + 1;
        });
        renderizarTabela('');
    } catch (err) {
        document.getElementById('tabelaEmpresas').innerHTML =
            `<tr><td colspan="4">${estadoVazioHtml('Não foi possível carregar as empresas', err.message)}</td></tr>`;
    }
}

function renderizarTabela(filtro) {
    const termo = filtro.trim().toLowerCase();
    const empresas = listaEmpresasCache.filter(e => !termo || [e.nome, e.cnpj, e.email]
        .some(t => t && t.toLowerCase().includes(termo)));

    document.getElementById('contadorEmpresas').textContent =
        `${empresas.length} ${empresas.length === 1 ? 'empresa' : 'empresas'}`;

    const tbody = document.getElementById('tabelaEmpresas');
    if (empresas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">${termo
            ? estadoVazioHtml('Nenhuma empresa encontrada', 'Tente outro termo de busca.')
            : estadoVazioHtml('Nenhuma empresa parceira cadastrada')}</td></tr>`;
        return;
    }
    tbody.innerHTML = empresas.map(e => `
        <tr>
            <td class="cell-title">${escapeHtml(e.nome)}</td>
            <td class="mono">${escapeHtml(e.cnpj)}</td>
            <td>${escapeHtml(e.email)}</td>
            <td class="right num">${formatarNumero(vantagensPorEmpresa[e.id] || 0)}</td>
        </tr>`).join('');
}
