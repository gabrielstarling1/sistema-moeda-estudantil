let cupons = [];
let filtroStatus = 'todos';

document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({ pagina: 'cupons', perfis: ['EMPRESA'] });
    if (!user) return;

    document.getElementById('validarCupomForm').addEventListener('submit', e => {
        e.preventDefault();
        confirmarUtilizacao(document.getElementById('codigoCupom').value);
    });
    const filtro = document.getElementById('filtroStatus');
    filtro.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        filtroStatus = btn.dataset.filtro;
        filtro.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        renderizarTabela();
    }));

    await carregarCupons();
});

async function carregarCupons() {
    try {
        cupons = await apiRequest('/api/transacoes/cupons') || [];
        const pendentes = cupons.filter(c => c.status === 'EMITIDO').length;
        document.getElementById('cuponsIndicadores').innerHTML = `
            <div class="stat stat-primary">
                <p class="stat-label">Aguardando troca</p>
                <p class="stat-value">${formatarNumero(pendentes)}</p>
                <p class="stat-meta">cupons a conferir</p>
            </div>
            <div class="stat">
                <p class="stat-label">Utilizados</p>
                <p class="stat-value">${formatarNumero(cupons.length - pendentes)}</p>
                <p class="stat-meta">de ${formatarNumero(cupons.length)} emitidos</p>
            </div>`;
        renderizarTabela();
    } catch (err) {
        document.getElementById('tabelaCupons').innerHTML =
            `<tr><td colspan="6">${estadoVazioHtml('Não foi possível carregar os cupons', err.message)}</td></tr>`;
    }
}

function renderizarTabela() {
    const lista = cupons.filter(c => filtroStatus === 'todos' || c.status === filtroStatus);
    const tbody = document.getElementById('tabelaCupons');
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">${cupons.length
            ? estadoVazioHtml('Nenhum cupom nesta situação')
            : estadoVazioHtml('Nenhum resgate ainda', 'Quando um aluno resgatar uma das suas vantagens, o cupom aparece aqui.')}</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(c => {
        const utilizado = c.status === 'UTILIZADO';
        return `
            <tr>
                <td><span class="code">${escapeHtml(c.codigo)}</span></td>
                <td>
                    <div class="cell-title">${escapeHtml(c.vantagem)}</div>
                    <div class="cell-sub">${formatarMoedas(c.custoMoedas)}</div>
                </td>
                <td>
                    <div>${escapeHtml(c.alunoNome)}</div>
                    <div class="cell-sub">${escapeHtml(c.alunoEmail)}</div>
                </td>
                <td class="num" style="white-space:nowrap;">${formatarDataHora(c.emitidoEm)}</td>
                <td>${utilizado ? '<span class="badge badge-success">Utilizado</span>' : '<span class="badge badge-warning">Aguardando troca</span>'}</td>
                <td class="actions">${utilizado ? '' : `<button type="button" class="btn btn-secondary btn-sm" data-codigo="${escapeHtml(c.codigo)}">Confirmar</button>`}</td>
            </tr>`;
    }).join('');
    tbody.querySelectorAll('[data-codigo]').forEach(b => b.addEventListener('click', () => confirmarUtilizacao(b.dataset.codigo)));
}

async function confirmarUtilizacao(codigoDigitado) {
    const codigo = codigoDigitado.trim().toUpperCase();
    if (!codigo) return;

    const cupom = cupons.find(c => c.codigo === codigo);
    if (cupom) {
        const confirmado = await abrirDialogo({
            titulo: 'Confirmar utilização do cupom',
            corpoHtml: `<p>Confira os dados com o aluno antes de entregar o produto ou aplicar o desconto.</p>
                <div class="summary">
                    ${linhaResumo('Código', cupom.codigo)}
                    ${linhaResumo('Vantagem', cupom.vantagem)}
                    ${linhaResumo('Aluno', cupom.alunoNome)}
                    ${linhaResumo('Emitido em', formatarDataHora(cupom.emitidoEm))}
                </div>`,
            confirmarTexto: 'Confirmar utilização'
        });
        if (!confirmado) return;
    }

    try {
        const atualizado = await apiRequest(`/api/transacoes/cupons/${encodeURIComponent(codigo)}/utilizar`, { method: 'POST' });
        mostrarAlerta(null, `Cupom ${atualizado.codigo} confirmado para ${atualizado.alunoNome}.`);
        document.getElementById('validarCupomForm').reset();
        await carregarCupons();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}
