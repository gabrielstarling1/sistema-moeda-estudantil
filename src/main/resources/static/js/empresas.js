document.addEventListener('DOMContentLoaded', () => {
    carregarEmpresas();

    document.getElementById('empresaForm').addEventListener('submit', salvarEmpresa);
    document.getElementById('btnCancelar').addEventListener('click', limparFormulario);
});

async function carregarEmpresas() {
    const tbody = document.getElementById('tabelaEmpresas');
    try {
        const empresas = await apiRequest('/api/empresas');
        if (!empresas || empresas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;">Nenhuma empresa parceira cadastrada ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        empresas.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${emp.id}</td>
                <td><strong>${emp.nome}</strong></td>
                <td>${emp.cnpj}</td>
                <td>
                    ${emp.email}<br>
                    <small style="color:#64748b;">Login: @${emp.login}</small>
                </td>
                <td>
                    <div style="display:flex;gap:0.4rem;">
                        <button class="btn btn-secondary btn-sm" onclick="editarEmpresa(${emp.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirEmpresa(${emp.id}, '${emp.nome.replace(/'/g, "\\'")}')">Excluir</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red;">${err.message}</td></tr>`;
    }
}

async function salvarEmpresa(e) {
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
        if (id) {
            await apiRequest(`/api/empresas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            mostrarAlerta('empresaAlert', 'Dados da empresa parceira atualizados com sucesso!', 'success');
        } else {
            await apiRequest('/api/empresas', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            mostrarAlerta('empresaAlert', 'Empresa parceira cadastrada com sucesso!', 'success');
        }
        limparFormulario();
        carregarEmpresas();
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

async function editarEmpresa(id) {
    try {
        const emp = await apiRequest(`/api/empresas/${id}`);
        document.getElementById('empresaId').value = emp.id;
        document.getElementById('nome').value = emp.nome;
        document.getElementById('cnpj').value = emp.cnpj;
        document.getElementById('email').value = emp.email;
        document.getElementById('login').value = emp.login;

        const senhaInput = document.getElementById('senha');
        senhaInput.value = '';
        senhaInput.required = false;
        document.getElementById('senhaLabel').textContent = 'Nova Senha (deixe em branco para manter)';

        document.getElementById('formTitle').textContent = `Editar Empresa #${emp.id}`;
        document.getElementById('btnSalvar').textContent = 'Salvar Alterações';
        document.getElementById('btnCancelar').style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

async function excluirEmpresa(id, nome) {
    // US14: A exclusao exige confirmacao
    if (!confirm(`Tem certeza que deseja excluir o cadastro da empresa "${nome}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    try {
        await apiRequest(`/api/empresas/${id}`, { method: 'DELETE' });
        mostrarAlerta('empresaAlert', `Cadastro da empresa "${nome}" excluído com sucesso.`, 'success');
        carregarEmpresas();
    } catch (err) {
        mostrarAlerta('empresaAlert', err.message, 'error');
    }
}

function limparFormulario() {
    document.getElementById('empresaForm').reset();
    document.getElementById('empresaId').value = '';
    const senhaInput = document.getElementById('senha');
    senhaInput.required = true;
    document.getElementById('senhaLabel').textContent = 'Senha *';
    document.getElementById('formTitle').textContent = 'Cadastrar Empresa Parceira';
    document.getElementById('btnSalvar').textContent = 'Cadastrar Empresa';
    document.getElementById('btnCancelar').style.display = 'none';
}
