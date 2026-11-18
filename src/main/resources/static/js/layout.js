// =========================================================================
// Estrutura comum das telas autenticadas: menu lateral por perfil,
// bloco do usuario e controle de acesso por pagina.
// =========================================================================

const ICONES = {
    inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.6c2.2.7 3.5 2.6 3.5 5.4"/>',
    empresa: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/>',
    vantagem: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8c-1.4-3.2-5.5-3.6-5.5-1.4C6.5 8 9.6 8 12 8c2.4 0 5.5 0 5.5-1.4C17.5 4.4 13.4 4.8 12 8z"/>',
    enviar: '<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
    extrato: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    cupom: '<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z"/><path d="M14 6v12"/>',
    sair: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    excluir: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
    moeda: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    entrada: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    saida: '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
    imagem: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
    escola: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>'
};

function icone(nome, classe = '') {
    return `<svg class="icon ${classe}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
}

const MENU_POR_PERFIL = {
    ALUNO: [
        { secao: 'Geral', itens: [
            { pagina: 'inicio', href: '/index.html', icone: 'inicio', texto: 'Início' },
            { pagina: 'vantagens', href: '/vantagens.html', icone: 'vantagem', texto: 'Vantagens' },
            { pagina: 'extrato', href: '/extrato.html', icone: 'extrato', texto: 'Extrato' }
        ] },
        { secao: 'Conta', itens: [
            { pagina: 'cadastro', href: '/alunos.html', icone: 'usuario', texto: 'Meu cadastro' }
        ] }
    ],
    PROFESSOR: [
        { secao: 'Geral', itens: [
            { pagina: 'inicio', href: '/index.html', icone: 'inicio', texto: 'Início' },
            { pagina: 'transferencia', href: '/transferencia.html', icone: 'enviar', texto: 'Enviar moedas' },
            { pagina: 'extrato', href: '/extrato.html', icone: 'extrato', texto: 'Extrato' }
        ] },
        { secao: 'Consultas', itens: [
            { pagina: 'alunos', href: '/alunos.html', icone: 'usuarios', texto: 'Alunos' },
            { pagina: 'empresas', href: '/empresas.html', icone: 'empresa', texto: 'Empresas parceiras' },
            { pagina: 'vantagens', href: '/vantagens.html', icone: 'vantagem', texto: 'Vantagens' }
        ] }
    ],
    EMPRESA: [
        { secao: 'Geral', itens: [
            { pagina: 'inicio', href: '/index.html', icone: 'inicio', texto: 'Início' },
            { pagina: 'vantagens', href: '/vantagens.html', icone: 'vantagem', texto: 'Minhas vantagens' },
            { pagina: 'cupons', href: '/cupons.html', icone: 'cupom', texto: 'Conferência de cupons' }
        ] },
        { secao: 'Conta', itens: [
            { pagina: 'cadastro', href: '/empresas.html', icone: 'empresa', texto: 'Dados da empresa' }
        ] }
    ]
};

let paginaAtual = '';

/**
 * Verifica a sessao e o perfil, monta o menu e devolve o usuario logado.
 * Se o perfil nao puder acessar a pagina, redireciona para o inicio.
 */
function iniciarPagina({ pagina, perfis }) {
    const user = obterUsuarioLogado();
    if (!user || !user.token) {
        window.location.replace('/login.html');
        return null;
    }
    if (perfis && !perfis.includes(user.tipoUsuario)) {
        window.location.replace('/index.html');
        return null;
    }
    paginaAtual = typeof pagina === 'function' ? pagina(user) : pagina;
    renderizarLayout();
    return user;
}

function renderizarLayout() {
    const user = obterUsuarioLogado();
    const app = document.querySelector('.app');
    const sidebar = document.getElementById('sidebar');
    if (!user || !app || !sidebar) return;

    const grupos = MENU_POR_PERFIL[user.tipoUsuario] || [];
    sidebar.innerHTML = `
        <a href="/index.html" class="brand">
            <span class="brand-mark">${icone('moeda')}</span>
            <span class="brand-name">Moeda Estudantil<span class="brand-sub">PUC Minas</span></span>
        </a>
        ${grupos.map(g => `
            <div class="nav-label">${g.secao}</div>
            <nav class="nav">
                ${g.itens.map(i => `
                    <a href="${i.href}" class="nav-link ${i.pagina === paginaAtual ? 'active' : ''}" ${i.pagina === paginaAtual ? 'aria-current="page"' : ''}>
                        ${icone(i.icone)}<span>${i.texto}</span>
                    </a>`).join('')}
            </nav>`).join('')}
        <div class="sidebar-footer">
            <div class="user-block">
                <span class="avatar">${escapeHtml(iniciais(user.nome))}</span>
                <span class="user-info">
                    <span class="user-name" title="${escapeHtml(user.nome)}">${escapeHtml(user.nome)}</span>
                    <span class="user-role">${rotuloPerfil(user.tipoUsuario)}</span>
                </span>
                <button type="button" class="icon-btn" id="btnSair" title="Sair" aria-label="Sair">${icone('sair')}</button>
            </div>
        </div>`;
    document.getElementById('btnSair').addEventListener('click', logout);

    if (!document.querySelector('.mobile-bar')) {
        const barra = document.createElement('div');
        barra.className = 'mobile-bar';
        barra.innerHTML = `
            <button type="button" class="icon-btn" id="btnMenu" aria-label="Abrir menu">${icone('menu')}</button>
            <span class="brand-name">Moeda Estudantil</span>`;
        const fundo = document.createElement('div');
        fundo.className = 'sidebar-backdrop';
        app.prepend(fundo);
        app.insertBefore(barra, document.querySelector('.main'));
        barra.querySelector('#btnMenu').addEventListener('click', () => app.classList.add('menu-open'));
        fundo.addEventListener('click', () => app.classList.remove('menu-open'));
    }
}
