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
    }, 5000);
}

function atualizarStatusUsuario() {
    const statusEl = document.getElementById('userStatus');
    if (!statusEl) return;
    const raw = localStorage.getItem('usuarioLogado');
    if (raw) {
        const user = JSON.parse(raw);
        statusEl.innerHTML = `Logado: <strong>${user.nome}</strong> (${user.tipoUsuario}) | <a href="#" onclick="logout()" style="color:#fcd34d;padding:0;">Sair</a>`;
    } else {
        statusEl.innerHTML = `Não autenticado`;
    }
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', atualizarStatusUsuario);
