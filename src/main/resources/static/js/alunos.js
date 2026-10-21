let listaAlunosCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = obterUsuarioLogado();
    if (!user) return;

    aplicarMascarasInput(['cpf'], [], ['cep']);
    await carregarInstituicoes();

    if (user.tipoUsuario === 'ALUNO') {
        // Aluno logado: acessa, edita e exclui APENAS o proprio cadastro
        document.getElementById('visaoProprioAluno').style.display = 'grid';
        document.getElementById('visaoProfessorAlunos').style.display = 'none';
        await carregarMeuCadastroAluno(user.id);

        document.getElementById('alunoForm').addEventListener('submit', salvarMeuCadastroAluno);
        document.getElementById('btnExcluirMinhaContaAluno').addEventListener('click', () => excluirMinhaContaAluno(user.id));
    } else if (user.tipoUsuario === 'PROFESSOR') {
        // Professor logado: visualiza a lista de alunos cadastrados na instituicao
        document.getElementById('badgeTopoAluno').textContent = '👨‍🏫 Consulta Docente';
        document.getElementById('tituloPaginaAluno').textContent = 'Alunos Cadastrados no Sistema';
        document.getElementById('descPaginaAluno').textContent = 'Consulte os estudantes participantes para envio de moedas e acompanhamento acadêmico.';
        document.getElementById('visaoProprioAluno').style.display = 'none';
        document.getElementById('visaoProfessorAlunos').style.display = 'block';

        const buscaInput = document.getElementById('buscaAluno');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => renderizarTabelaAlunos(e.target.value));
        }
        await carregarAlunosProfessor();
    }
});

async function carregarInstituicoes() {
    try {
        const instituicoes = await apiRequest('/api/instituicoes');
        const select = document.getElementById('instituicaoId');
        if (!select) return;
        select.innerHTML = '<option value="">Selecione a instituição...</option>';
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

async function carregarMeuCadastroAluno(id) {
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
        document.getElementById('senha').value = '';

        document.getElementById('resumoSaldoAluno').textContent = `🪙 ${a.saldoMoedas} M$`;
        document.getElementById('resumoDadosAluno').innerHTML = `
            <div><strong>Nome:</strong> ${a.nome}</div>
            <div><strong>Login:</strong> @${a.login}</div>
            <div><strong>E-mail:</strong> ${a.email}</div>
            <div><strong>CPF / RG:</strong> ${a.cpf} • ${a.rg}</div>
            <div><strong>Instituição:</strong> ${a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-'}</div>
            <div><strong>Curso:</strong> ${a.curso}</div>
            <div><strong>Endereço:</strong> ${a.endereco ? `${a.endereco.logradouro}, ${a.endereco.numero} - ${a.endereco.bairro}, ${a.endereco.cidade}/${a.endereco.uf} (${a.endereco.cep})` : '-'}</div>
        `;
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

async function salvarMeuCadastroAluno(e) {
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
        const atualizado = await apiRequest(`/api/alunos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        // Atualiza tambem o nome/login na sessao local
        const user = obterUsuarioLogado();
        if (user) {
            user.nome = atualizado.nome;
            user.login = atualizado.login;
            localStorage.setItem('usuarioLogado', JSON.stringify(user));
            atualizarStatusUsuario();
        }

        await carregarMeuCadastroAluno(id);
        mostrarAlerta('alunoAlert', 'Seus dados cadastrais foram atualizados com sucesso!', 'success');
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

async function excluirMinhaContaAluno(id) {
    if (!confirm('Tem certeza que deseja excluir permanentemente o seu cadastro de aluno? Você será desconectado imediatamente.')) {
        return;
    }
    try {
        await apiRequest(`/api/alunos/${id}`, { method: 'DELETE' });
        alert('Seu cadastro foi excluído com sucesso.');
        logout();
    } catch (err) {
        mostrarAlerta('alunoAlert', err.message, 'error');
    }
}

async function carregarAlunosProfessor() {
    try {
        listaAlunosCache = await apiRequest('/api/alunos') || [];
        renderizarTabelaAlunos(document.getElementById('buscaAluno')?.value || '');
    } catch (err) {
        document.getElementById('tabelaAlunos').innerHTML =
            `<tr><td colspan="6" style="color:red;text-align:center;">${err.message}</td></tr>`;
    }
}

function renderizarTabelaAlunos(filtro = '') {
    const tbody = document.getElementById('tabelaAlunos');
    const contador = document.getElementById('contadorAlunos');
    const termo = filtro.trim().toLowerCase();

    const filtrados = listaAlunosCache.filter(a => {
        if (!termo) return true;
        return (
            (a.nome && a.nome.toLowerCase().includes(termo)) ||
            (a.cpf && a.cpf.toLowerCase().includes(termo)) ||
            (a.curso && a.curso.toLowerCase().includes(termo)) ||
            (a.login && a.login.toLowerCase().includes(termo)) ||
            (a.instituicaoEnsino && a.instituicaoEnsino.nome.toLowerCase().includes(termo))
        );
    });

    if (contador) {
        contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'aluno' : 'alunos'}`;
    }

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;padding:2rem;">Nenhum aluno cadastrado ainda.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtrados.forEach(a => {
        const end = a.endereco ? `${a.endereco.cidade}/${a.endereco.uf}` : '-';
        const logradouro = a.endereco ? `${a.endereco.logradouro}, ${a.endereco.numero}` : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${a.id}</strong></td>
            <td>
                <div style="font-weight:700;color:#0f172a;">${a.nome}</div>
                <small style="color:#64748b;">@${a.login} • ${a.email}</small>
            </td>
            <td>
                <div>CPF: ${a.cpf}</div>
                <small style="color:#64748b;">RG: ${a.rg}</small>
            </td>
            <td>
                <div style="font-weight:600;color:#1e3a8a;">${a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-'}</div>
                <small style="color:#475569;">${a.curso}</small>
            </td>
            <td>
                <div>${end}</div>
                <small style="color:#64748b;">${logradouro}</small>
            </td>
            <td><span class="badge-coin">🪙 ${a.saldoMoedas} M$</span></td>
        `;
        tbody.appendChild(tr);
    });
}
