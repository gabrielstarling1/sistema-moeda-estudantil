// =========================================================================
// Sessao, chamadas a API e utilitarios compartilhados pelas telas
// =========================================================================

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem('usuarioLogado'));
    } catch {
        return null;
    }
}

function salvarSessao(usuario) {
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
}

function atualizarSessao(dados) {
    const user = obterUsuarioLogado();
    if (user) {
        salvarSessao({ ...user, ...dados });
    }
}

async function apiRequest(url, options = {}) {
    const user = obterUsuarioLogado();
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);
    if (response.status === 401 && !window.location.pathname.endsWith('/login.html')) {
        // Token expirado ou servidor reiniciado: volta para o login
        localStorage.removeItem('usuarioLogado');
        window.location.replace('/login.html');
        throw new Error('Sua sessão expirou. Entre novamente.');
    }
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.erro || 'Não foi possível concluir a operação.');
    }
    return data;
}

function logout() {
    const user = obterUsuarioLogado();
    if (user && user.token) {
        fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${user.token}` } }).catch(() => {});
    }
    localStorage.removeItem('usuarioLogado');
    window.location.replace('/login.html');
}

// -------------------------------------------------------------------------
// Formatacao
// -------------------------------------------------------------------------

// Evita que textos digitados por usuarios sejam interpretados como HTML
function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

function formatarMoedas(valor) {
    const n = Number(valor || 0);
    return `${formatarNumero(n)} ${Math.abs(n) === 1 ? 'moeda' : 'moedas'}`;
}

function formatarDataHora(valor) {
    if (!valor) return '-';
    return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatarData(valor) {
    if (!valor) return '-';
    return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function iniciais(nome) {
    return (nome || '?')
        .replace(/^(Profa?\.|Prof\.)\s+/i, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase();
}

function primeiroNome(nome) {
    return (nome || '').replace(/^(Profa?\.|Prof\.)\s+/i, '').split(/\s+/)[0];
}

function rotuloPerfil(tipo) {
    return { ALUNO: 'Aluno', PROFESSOR: 'Professor', EMPRESA: 'Empresa parceira' }[tipo] || tipo;
}

// Semestre letivo de uma data, no mesmo formato do back-end (ex.: "2026/2")
function semestreDe(data) {
    const d = new Date(data);
    return `${d.getFullYear()}/${d.getMonth() < 6 ? 1 : 2}`;
}

function inicioProximoSemestre(data = new Date()) {
    const d = new Date(data);
    return d.getMonth() < 6 ? new Date(d.getFullYear(), 6, 1) : new Date(d.getFullYear() + 1, 0, 1);
}

// Linha de extrato vista por quem consulta (ENVIO, RECEBIMENTO ou RESGATE)
function descreverTransacao(t) {
    if (t.tipo === 'RECEBIMENTO') {
        return { titulo: t.descricao, detalhe: `Recebido de ${t.contraparte}`, entrada: true, rotulo: 'Recebimento' };
    }
    if (t.tipo === 'RESGATE') {
        return { titulo: t.descricao, detalhe: `Troca em ${t.contraparte}`, entrada: false, rotulo: 'Troca por vantagem' };
    }
    return { titulo: t.descricao, detalhe: `Enviado para ${t.contraparte}`, entrada: false, rotulo: 'Envio' };
}

function valorTransacaoHtml(t) {
    const { entrada } = descreverTransacao(t);
    return `<span class="${entrada ? 'amount-in' : 'amount-out'}">${entrada ? '+' : '−'}${formatarNumero(t.valor)}</span>`;
}

function itemTransacaoHtml(t) {
    const d = descreverTransacao(t);
    return `
        <li class="list-item">
            <span class="list-icon ${d.entrada ? 'in' : 'out'}">${icone(d.entrada ? 'entrada' : 'saida', 'icon-sm')}</span>
            <span class="list-main">
                <span class="list-title" title="${escapeHtml(d.titulo)}">${escapeHtml(d.titulo)}</span>
                <span class="list-meta">${escapeHtml(d.detalhe)} · ${formatarDataHora(t.dataHora)}</span>
            </span>
            ${valorTransacaoHtml(t)}
        </li>`;
}

function estadoVazioHtml(titulo, texto = '') {
    return `<div class="empty"><p class="empty-title">${escapeHtml(titulo)}</p>${texto ? `<p>${escapeHtml(texto)}</p>` : ''}</div>`;
}

// -------------------------------------------------------------------------
// Mascaras de CPF, CNPJ e CEP
// -------------------------------------------------------------------------
function formatarCPF(valor) {
    const v = valor.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    return v;
}

function formatarCNPJ(valor) {
    const v = valor.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    if (v.length > 8) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    if (v.length > 5) return v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (v.length > 2) return v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    return v;
}

function formatarCEP(valor) {
    const v = valor.replace(/\D/g, '').slice(0, 8);
    return v.length > 5 ? v.replace(/(\d{5})(\d{1,3})/, '$1-$2') : v;
}

function aplicarMascarasInput(cpfIds = [], cnpjIds = [], cepIds = []) {
    const aplicar = (ids, fn) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => { e.target.value = fn(e.target.value); });
    });
    aplicar(cpfIds, formatarCPF);
    aplicar(cnpjIds, formatarCNPJ);
    aplicar(cepIds, formatarCEP);
}

// -------------------------------------------------------------------------
// Avisos (toasts) e dialogos de confirmacao
// -------------------------------------------------------------------------
function mostrarAlerta(_elementId, mensagem, tipo = 'success') {
    let pilha = document.getElementById('toastStack');
    if (!pilha) {
        pilha = document.createElement('div');
        pilha.id = 'toastStack';
        pilha.className = 'toast-stack';
        pilha.setAttribute('role', 'status');
        pilha.setAttribute('aria-live', 'polite');
        document.body.appendChild(pilha);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo === 'error' ? 'error' : 'success'}`;
    toast.innerHTML = `${icone(tipo === 'error' ? 'alerta' : 'check')}<div></div>`;
    toast.querySelector('div').textContent = mensagem;
    pilha.appendChild(toast);
    setTimeout(() => toast.remove(), tipo === 'error' ? 7000 : 5000);
}

/**
 * Abre um dialogo modal. Retorna uma Promise que resolve true (confirmar) ou false (cancelar).
 * corpoHtml deve conter apenas conteudo ja escapado.
 */
function abrirDialogo({ titulo, corpoHtml, confirmarTexto = 'Confirmar', cancelarTexto = 'Cancelar', perigo = false, somenteOk = false, largo = false }) {
    return new Promise(resolve => {
        const fundo = document.createElement('div');
        fundo.className = 'modal-backdrop';
        fundo.innerHTML = `
            <div class="modal ${largo ? 'modal-lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialogoTitulo">
                <div class="modal-header">
                    <h2 class="modal-title" id="dialogoTitulo"></h2>
                    <button type="button" class="icon-btn" data-acao="cancelar" aria-label="Fechar">${icone('fechar')}</button>
                </div>
                <div class="modal-body">${corpoHtml}</div>
                <div class="modal-footer">
                    ${somenteOk ? '' : `<button type="button" class="btn btn-secondary" data-acao="cancelar">${escapeHtml(cancelarTexto)}</button>`}
                    <button type="button" class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" data-acao="confirmar">${escapeHtml(confirmarTexto)}</button>
                </div>
            </div>`;
        fundo.querySelector('#dialogoTitulo').textContent = titulo;

        const fechar = (resultado) => {
            document.removeEventListener('keydown', teclado);
            fundo.remove();
            resolve(resultado);
        };
        const teclado = (e) => { if (e.key === 'Escape') fechar(false); };

        fundo.addEventListener('click', (e) => {
            if (e.target === fundo) return fechar(false);
            const acao = e.target.closest('[data-acao]');
            if (acao) fechar(acao.dataset.acao === 'confirmar');
        });
        document.addEventListener('keydown', teclado);
        document.body.appendChild(fundo);
        fundo.querySelector('[data-acao="confirmar"]').focus();
    });
}

function linhaResumo(rotulo, valor) {
    return `<div class="summary-row"><span>${escapeHtml(rotulo)}</span><span>${escapeHtml(valor)}</span></div>`;
}

function definirCarregando(botao, carregando, textoCarregando = 'Salvando...') {
    if (!botao) return;
    if (carregando) {
        botao.dataset.textoOriginal = botao.innerHTML;
        botao.textContent = textoCarregando;
        botao.disabled = true;
    } else {
        if (botao.dataset.textoOriginal) botao.innerHTML = botao.dataset.textoOriginal;
        botao.disabled = false;
    }
}
