async function apiRequest(url, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    };

    const response = await fetch(url, config);
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.erro || 'Ocorreu um erro ao processar a requisição.');
    }
    return data;
}

function mostrarAlerta(elementId, mensagem, tipo = 'success') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = mensagem;
    el.className = `alert ${tipo}`;
    setTimeout(() => {
        el.className = 'alert';
    }, 6000);
}

// Mascaras utilitarias reutilizaveis em qualquer tela
function formatarCPF(valor) {
    let v = valor.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    return v;
}

function formatarCNPJ(valor) {
    let v = valor.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    if (v.length > 8) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    if (v.length > 5) return v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (v.length > 2) return v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    return v;
}

function formatarCEP(valor) {
    let v = valor.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) return v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    return v;
}

function aplicarMascarasInput(cpfIds = [], cnpjIds = [], cepIds = []) {
    cpfIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => { e.target.value = formatarCPF(e.target.value); });
    });
    cnpjIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => { e.target.value = formatarCNPJ(e.target.value); });
    });
    cepIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => { e.target.value = formatarCEP(e.target.value); });
    });
}

function obterUsuarioLogado() {
    const raw = localStorage.getItem('usuarioLogado');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function exigirAutenticacao() {
    const path = window.location.pathname;
    const isPaginaLogin = path.endsWith('/login.html');
    const user = obterUsuarioLogado();

    if (!user && !isPaginaLogin) {
        window.location.replace('/login.html');
        return false;
    }

    // Controle de acesso por perfil (Role-Based Access Control)
    if (user && !isPaginaLogin) {
        if (path.endsWith('/alunos.html') && user.tipoUsuario === 'EMPRESA') {
            window.location.replace('/index.html');
            return false;
        }
        if (path.endsWith('/empresas.html') && user.tipoUsuario === 'ALUNO') {
            window.location.replace('/index.html');
            return false;
        }
    }
    return true;
}

function renderizarMenuPorPerfil(user) {
    const navPrincipal = document.getElementById('sidebarNavPrincipal');
    const navOperacoes = document.getElementById('sidebarNavOperacoes');
    if (!navPrincipal || !navOperacoes || !user) return;

    const path = window.location.pathname;
    const isIndex = path === '/' || path.endsWith('/index.html');
    const isAlunos = path.endsWith('/alunos.html');
    const isEmpresas = path.endsWith('/empresas.html');

    if (user.tipoUsuario === 'ALUNO') {
        navPrincipal.innerHTML = `
            <a href="/index.html" class="nav-link ${isIndex ? 'active' : ''}">
                <span class="nav-left">📊 Painel do Aluno</span>
                <span class="pill-active">Início</span>
            </a>
            <a href="/alunos.html" class="nav-link ${isAlunos ? 'active' : ''}">
                <span class="nav-left">🎓 Meu Cadastro</span>
                <span class="pill-active">Perfil</span>
            </a>
        `;
        navOperacoes.innerHTML = `
            <button type="button" class="nav-link" onclick="abrirModalPreview('vantagens')">
                <span class="nav-left">🎁 Trocar Moedas</span>
                <span class="pill-soon">Em breve</span>
            </button>
            <button type="button" class="nav-link" onclick="abrirModalPreview('extrato')">
                <span class="nav-left">📄 Meu Extrato</span>
                <span class="pill-soon">Em breve</span>
            </button>
        `;
    } else if (user.tipoUsuario === 'EMPRESA') {
        navPrincipal.innerHTML = `
            <a href="/index.html" class="nav-link ${isIndex ? 'active' : ''}">
                <span class="nav-left">📊 Painel do Parceiro</span>
                <span class="pill-active">Início</span>
            </a>
            <a href="/empresas.html" class="nav-link ${isEmpresas ? 'active' : ''}">
                <span class="nav-left">🏢 Dados da Minha Empresa</span>
                <span class="pill-active">Perfil</span>
            </a>
        `;
        navOperacoes.innerHTML = `
            <button type="button" class="nav-link" onclick="abrirModalPreview('vantagens')">
                <span class="nav-left">🎁 Cadastrar Vantagens</span>
                <span class="pill-soon">Em breve</span>
            </button>
            <button type="button" class="nav-link" onclick="abrirModalPreview('conferencia')">
                <span class="nav-left">🎟️ Conferência de Cupons</span>
                <span class="pill-soon">Em breve</span>
            </button>
        `;
    } else {
        // PROFESSOR
        navPrincipal.innerHTML = `
            <a href="/index.html" class="nav-link ${isIndex ? 'active' : ''}">
                <span class="nav-left">📊 Painel Docente</span>
                <span class="pill-active">Início</span>
            </a>
            <a href="/alunos.html" class="nav-link ${isAlunos ? 'active' : ''}">
                <span class="nav-left">🎓 Alunos da Instituição</span>
                <span class="pill-active">Consulta</span>
            </a>
            <a href="/empresas.html" class="nav-link ${isEmpresas ? 'active' : ''}">
                <span class="nav-left">🏢 Empresas Parceiras</span>
                <span class="pill-active">Consulta</span>
            </a>
        `;
        navOperacoes.innerHTML = `
            <button type="button" class="nav-link" onclick="abrirModalPreview('transferencia')">
                <span class="nav-left">🪙 Enviar Moedas</span>
                <span class="pill-soon">Em breve</span>
            </button>
            <button type="button" class="nav-link" onclick="abrirModalPreview('extrato')">
                <span class="nav-left">📄 Extrato Docente</span>
                <span class="pill-soon">Em breve</span>
            </button>
        `;
    }
}

async function atualizarStatusUsuario() {
    if (!exigirAutenticacao()) return;

    const user = obterUsuarioLogado();
    if (!user) return;

    renderizarMenuPorPerfil(user);

    const statusEl = document.getElementById('userStatus');
    const walletLabel = document.getElementById('heroWalletLabel');
    const walletValue = document.getElementById('heroWalletValue');
    const walletSub = document.getElementById('heroWalletSub');
    const welcomeTitle = document.getElementById('welcomeUserTitle');

    const iniciais = user.nome ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'US';
    const roleClass = (user.tipoUsuario || 'aluno').toLowerCase();

    if (welcomeTitle) {
        welcomeTitle.textContent = `Olá, ${user.nome}!`;
    }

    if (statusEl) {
        statusEl.innerHTML = `
            <div class="user-avatar">${iniciais}</div>
            <div>
                <div style="font-weight:700;font-size:0.8rem;line-height:1.1;">${user.nome}</div>
                <span class="badge-role ${roleClass}">${user.tipoUsuario}</span>
            </div>
            <button onclick="logout()" class="btn btn-danger btn-sm" style="margin-left:0.4rem;">Sair</button>
        `;
    }

    if (walletValue) {
        if (user.tipoUsuario === 'PROFESSOR') {
            walletLabel.textContent = 'Saldo Docente Disponível';
            try {
                const prof = await apiRequest(`/api/professores/${user.id}`);
                walletValue.textContent = `${prof.saldoMoedas} M$`;
                walletSub.textContent = `${prof.departamento} • ${prof.instituicaoEnsino ? prof.instituicaoEnsino.nome : ''}`;
            } catch {
                walletValue.textContent = '1.000 M$';
                walletSub.textContent = `${user.nome} • Semestre 2026/2`;
            }
        } else if (user.tipoUsuario === 'ALUNO') {
            walletLabel.textContent = 'Sua Carteira Estudantil';
            try {
                const al = await apiRequest(`/api/alunos/${user.id}`);
                walletValue.textContent = `${al.saldoMoedas} M$`;
                walletSub.textContent = `${al.curso} • ${al.instituicaoEnsino ? al.instituicaoEnsino.nome : ''}`;
            } catch {
                walletValue.textContent = '0 M$';
                walletSub.textContent = `${user.nome} • Conta Ativa`;
            }
        } else {
            walletLabel.textContent = 'Status da Parceria';
            walletValue.textContent = 'Credenciada';
            walletSub.textContent = `${user.nome} • Conta Corporativa`;
        }
    }
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.replace('/login.html');
}

function abrirModalPreview(modulo) {
    const modal = document.getElementById('modalSprint3');
    const titulo = document.getElementById('modalTitulo');
    const desc = document.getElementById('modalDescricao');
    const preview = document.getElementById('modalPreviewBox');
    if (!modal) return;

    if (modulo === 'transferencia') {
        titulo.textContent = 'Enviar Moedas a Aluno';
        desc.textContent = 'Reconhecimento de mérito estudantil pelos professores com notificação automática por e-mail:';
        preview.innerHTML = `
            <strong>Funcionamento do Módulo:</strong><br>
            • A cada semestre, os professores recebem <strong>1.000 moedas acumuláveis</strong>.<br>
            • O professor seleciona o aluno destinatário, informa o montante (validando saldo suficiente) e escreve o <strong>motivo obrigatório</strong> do reconhecimento.<br>
            • O aluno é notificado por e-mail imediatamente.
        `;
    } else if (modulo === 'extrato') {
        titulo.textContent = 'Consulta de Extrato da Conta';
        desc.textContent = 'Visualização do saldo atual de moedas e histórico completo de movimentações:';
        preview.innerHTML = `
            <strong>Funcionamento do Módulo:</strong><br>
            • Exibe o total de moedas disponíveis na carteira.<br>
            • <strong>Para o Professor:</strong> Histórico de envios realizados aos alunos.<br>
            • <strong>Para o Aluno:</strong> Histórico de moedas recebidas de professores e trocas por vantagens.
        `;
    } else if (modulo === 'vantagens') {
        titulo.textContent = 'Catálogo de Vantagens & Resgate';
        desc.textContent = 'Cadastro de produtos e descontos por empresas parceiras e resgate pelos alunos:';
        preview.innerHTML = `
            <strong>Funcionamento do Módulo:</strong><br>
            • Empresas parceiras cadastram vantagens com <strong>descrição, foto do produto e custo em moedas</strong>.<br>
            • Ao resgatar uma vantagem, o valor é descontado do saldo do aluno e dois e-mails com um código único são enviados (cupom ao aluno e conferência ao parceiro).
        `;
    } else if (modulo === 'conferencia') {
        titulo.textContent = 'Conferência de Cupons Presenciais';
        desc.textContent = 'Validação dos códigos gerados pelo sistema no momento do resgate de vantagens:';
        preview.innerHTML = `
            <strong>Funcionamento do Módulo:</strong><br>
            • A cada vantagem resgatada por um estudante, a empresa parceira recebe um e-mail contendo o código único gerado pelo sistema e o nome do aluno para validar a troca presencial.
        `;
    }

    modal.classList.add('open');
}

function fecharModalPreview() {
    const modal = document.getElementById('modalSprint3');
    if (modal) modal.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', atualizarStatusUsuario);
