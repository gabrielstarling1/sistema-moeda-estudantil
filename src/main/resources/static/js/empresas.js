let listaEmpresasCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = obterUsuarioLogado();
    if (!user) return;

    aplicarMascarasInput([], ['cnpj'], []);

    if (user.tipoUsuario === 'EMPRESA') {
        // Empresa logada: acessa, edita e exclui APENAS o proprio cadastro
        document.getElementById('visaoPropriaEmpresa').style.display = 'grid';
        document.getElementById('visaoProfessorEmpresas').style.display = 'none';
        await carregarMeuCadastroEmpresa(user.id);

        document.getElementById('empresaForm').addEventListener('submit', salvarMeuCadastroEmpresa);
        document.getElementById('btnExcluirMinhaContaEmpresa').addEventListener('click', () => excluirMinhaContaEmpresa(user.id));
    } else if (user.tipoUsuario === 'PROFESSOR') {
        // Professor logado: consulta a rede de empresas parceiras
        document.getElementById('badgeTopoEmpresa').textContent = '👨‍🏫 Consulta Docente';
        document.getElementById('tituloPaginaEmpresa').textContent = 'Empresas Parceiras Conveniadas';
        document.getElementById('descPaginaEmpresa').textContent = 'Consulte as empresas parceiras credenciadas no sistema de mérito estudantil.';
        document.getElementById('visaoPropriaEmpresa').style.display = 'none';
        document.getElementById('visaoProfessorEmpresas').style.display = 'block';

        const buscaInput = document.getElementById('buscaEmpresa');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => renderizarTabelaEmpresas(e.target.value));
        }
        await carregarEmpresasProfessor();
    }
});

async function carregarMeuCadastroEmpresa(id) {
    try {
        const emp = await apiRequest(`/api/empresas/${id}`);
        document.getElementById('empresaId').value = emp.id;
        document.getElementById('nome').value = emp.nome;
        document.getElementById('cnpj').value = emp.cnpj;
        document.getElementById('email').value = emp.email;
        document.getElementById('login').value = emp.login;
        document.getElementById('senha').value = '';

        document.getElementById('resumoDadosEmpresa').innerHTML = `
            <div><strong>Razão Social / Nome:</strong> ${emp.nome}</div>
            <div><strong>CNPJ:</strong> ${emp.cnpj}</div>
            <div><strong>E-mail de Conferência:</strong> ${emp.email}</div>
            <div><strong>Login de Acesso:</strong> @${emp.login}</div>
        `;
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

async function salvarMeuCadastroEmpresa(e) {
    e.preventDefault();
    const id = document.getElementById('empresaId').value;

    const payload = {
        nome: document.getElementById('nome').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        email: document.getElementById('email').value.trim(),
        login: document.getElementById('login').value.trim(),
        senha: document.getElementById('senha').value
    };

    try {
        const atualizada = await apiRequest(`/api/empresas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        const user = obterUsuarioLogado();
        if (user) {
            user.nome = atualizada.nome;
            user.login = atualizada.login;
            localStorage.setItem('usuarioLogado', JSON.stringify(user));
            atualizarStatusUsuario();
        }

        await carregarMeuCadastroEmpresa(id);
        mostrarAlerta('empresaAlert', 'Os dados da sua empresa foram atualizados com sucesso!', 'success');
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

async function excluirMinhaContaEmpresa(id) {
    if (!confirm('Tem certeza que deseja excluir permanentemente o cadastro da sua empresa parceira? Você será desconectado imediatamente.')) {
        return;
    }
    try {
        await apiRequest(`/api/empresas/${id}`, { method: 'DELETE' });
        alert('O cadastro da sua empresa foi excluído com sucesso.');
        logout();
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

async function carregarEmpresasProfessor() {
    try {
        listaEmpresasCache = await apiRequest('/api/empresas') || [];
        renderizarTabelaEmpresas(document.getElementById('buscaEmpresa')?.value || '');
    } catch (err) {
        document.getElementById('tabelaEmpresas').innerHTML =
            `<tr><td colspan="5" style="color:red;text-align:center;">${err.message}</td></tr>`;
    }
}

function renderizarTabelaEmpresas(filtro = '') {
    const tbody = document.getElementById('tabelaEmpresas');
    const contador = document.getElementById('contadorEmpresas');
    const termo = filtro.trim().toLowerCase();

    const filtradas = listaEmpresasCache.filter(emp => {
        if (!termo) return true;
        return (
            (emp.nome && emp.nome.toLowerCase().includes(termo)) ||
            (emp.cnpj && emp.cnpj.toLowerCase().includes(termo)) ||
            (emp.email && emp.email.toLowerCase().includes(termo)) ||
            (emp.login && emp.login.toLowerCase().includes(termo))
        );
    });

    if (contador) {
        contador.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'parceiro' : 'parceiros'}`;
    }

    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:2rem;">Nenhuma empresa parceira cadastrada ainda.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtradas.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${emp.id}</strong></td>
            <td>
                <div style="font-weight:700;color:#0f172a;">${emp.nome}</div>
                <small style="color:#64748b;">Parceiro Oficial do Mérito Estudantil</small>
            </td>
            <td><code>${emp.cnpj}</code></td>
            <td>
                <div>${emp.email}</div>
                <small style="color:#64748b;">Login: @${emp.login}</small>
            </td>
            <td><span class="badge-role empresa">Credenciada</span></td>
        `;
        tbody.appendChild(tr);
    });
}
