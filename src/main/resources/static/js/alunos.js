document.addEventListener('DOMContentLoaded', () => {
    carregarInstituicoes();
    carregarAlunos();

    document.getElementById('alunoForm').addEventListener('submit', salvarAluno);
    document.getElementById('btnCancelar').addEventListener('click', limparFormulario);
});

async function carregarInstituicoes() {
    try {
        const instituicoes = await apiRequest('/api/instituicoes');
        const select = document.getElementById('instituicaoId');
        select.innerHTML = '<option value="">Selecione uma instituição...</option>';
        instituicoes.forEach(inst => {
            const opt = document.createElement('option');
            opt.value = inst.id;
            opt.textContent = inst.nome;
            select.appendChild(opt);
        });
    } catch (err) {
        mostrarAlerta('alunoAlert', 'Erro ao carregar instituições: ' + err.message, 'error');
    }
}

async function carregarAlunos() {
    const tbody = document.getElementById('tabelaAlunos');
    try {
        const alunos = await apiRequest('/api/alunos');
        if (!alunos || alunos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">Nenhum aluno cadastrado ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        alunos.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${a.id}</td>
                <td>
                    <strong>${a.nome}</strong><br>
                    <small style="color:#64748b;">@${a.login} | ${a.email}</small>
                </td>
                <td>
                    ${a.cpf}<br>
                    <small style="color:#64748b;">RG: ${a.rg}</small>
                </td>
                <td>
                    ${a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-'}<br>
                    <small style="color:#64748b;">${a.curso}</small>
                </td>
                <td><span class="badge">${a.saldoMoedas} M$</span></td>
                <td>
                    <div style="display:flex;gap:0.4rem;">
                        <button class="btn btn-secondary btn-sm" onclick="editarAluno(${a.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirAluno(${a.id}, '${a.nome.replace(/'/g, "\\'")}')">Excluir</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:red;">${err.message}</td></tr>`;
    }
}

async function salvarAluno(e) {
    e.preventDefault();
    const id = document.getElementById('alunoId').value;

    const payload = {
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        rg: document.getElementById('rg').value.trim(),
        email: document.getElementById('email').value.trim(),
        instituicaoId: Number(document.getElementById('instituicaoId').value),
        curso: document.getElementById('curso').value.trim(),
        cep: document.getElementById('cep').value.trim(),
        uf: document.getElementById('uf').value.trim().toUpperCase(),
        cidade: document.getElementById('cidade').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        logradouro: document.getElementById('logradouro').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim(),
        login: document.getElementById('login').value.trim(),
        senha: document.getElementById('senha').value
    };

    try {
        if (id) {
            await apiRequest(`/api/alunos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            mostrarAlerta('alunoAlert', 'Dados do aluno atualizados com sucesso!', 'success');
        } else {
            await apiRequest('/api/alunos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            mostrarAlerta('alunoAlert', 'Aluno cadastrado com sucesso (saldo inicial: 0 moedas)!', 'success');
        }
        limparFormulario();
        carregarAlunos();
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

async function editarAluno(id) {
    try {
        const a = await apiRequest(`/api/alunos/${id}`);
        document.getElementById('alunoId').value = a.id;
        document.getElementById('nome').value = a.nome;
        document.getElementById('cpf').value = a.cpf;
        document.getElementById('rg').value = a.rg;
        document.getElementById('email').value = a.email;
        document.getElementById('instituicaoId').value = a.instituicaoEnsino ? a.instituicaoEnsino.id : '';
        document.getElementById('curso').value = a.curso;

        if (a.endereco) {
            document.getElementById('cep').value = a.endereco.cep || '';
            document.getElementById('uf').value = a.endereco.uf || '';
            document.getElementById('cidade').value = a.endereco.cidade || '';
            document.getElementById('bairro').value = a.endereco.bairro || '';
            document.getElementById('logradouro').value = a.endereco.logradouro || '';
            document.getElementById('numero').value = a.endereco.numero || '';
            document.getElementById('complemento').value = a.endereco.complemento || '';
        }

        document.getElementById('login').value = a.login;
        const senhaInput = document.getElementById('senha');
        senhaInput.value = '';
        senhaInput.required = false;
        document.getElementById('senhaLabel').textContent = 'Nova Senha (deixe em branco para manter)';

        document.getElementById('formTitle').textContent = `Editar Aluno #${a.id}`;
        document.getElementById('btnSalvar').textContent = 'Salvar Alterações';
        document.getElementById('btnCancelar').style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

async function excluirAluno(id, nome) {
    // US03: A exclusao exige confirmacao
    if (!confirm(`Tem certeza que deseja excluir o cadastro do aluno "${nome}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    try {
        await apiRequest(`/api/alunos/${id}`, { method: 'DELETE' });
        mostrarAlerta('alunoAlert', `Cadastro do aluno "${nome}" excluído com sucesso.`, 'success');
        carregarAlunos();
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

function limparFormulario() {
    document.getElementById('alunoForm').reset();
    document.getElementById('alunoId').value = '';
    const senhaInput = document.getElementById('senha');
    senhaInput.required = true;
    document.getElementById('senhaLabel').textContent = 'Senha *';
    document.getElementById('formTitle').textContent = 'Cadastrar Novo Aluno';
    document.getElementById('btnSalvar').textContent = 'Cadastrar Aluno';
    document.getElementById('btnCancelar').style.display = 'none';
}
