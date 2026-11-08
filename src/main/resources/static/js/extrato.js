let transacoes = [];
let filtroAtual = 'todas';

document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({ pagina: 'extrato', perfis: ['ALUNO', 'PROFESSOR'] });
    if (!user) return;

    const professor = user.tipoUsuario === 'PROFESSOR';
    document.getElementById('extratoDescricao').textContent = professor
        ? 'Saldo acumulado e todas as moedas enviadas aos alunos. A cada semestre você recebe 1.000 moedas, somadas ao saldo atual.'
        : 'Saldo atual, moedas recebidas dos professores e trocas por vantagens.';
    document.getElementById('colContraparte').textContent = professor ? 'Aluno' : 'Origem / destino';

    if (!professor) {
        const filtro = document.getElementById('filtroTipo');
        filtro.classList.remove('hidden');
        filtro.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
            filtroAtual = btn.dataset.filtro;
            filtro.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
            renderizarTabela();
        }));
    }

    try {
        const extrato = await apiRequest('/api/transacoes/extrato');
        transacoes = extrato.transacoes;
        renderizarIndicadores(extrato, professor);
        renderizarTabela();
    } catch (err) {
        document.getElementById('tabelaExtrato').innerHTML =
            `<tr><td colspan="5">${estadoVazioHtml('Não foi possível carregar o extrato', err.message)}</td></tr>`;
    }
});

function indicador(rotulo, valor, meta, destaque = false) {
    return `
        <div class="stat ${destaque ? 'stat-primary' : ''}">
            <p class="stat-label">${escapeHtml(rotulo)}</p>
            <p class="stat-value">${escapeHtml(valor)}<span class="stat-unit">moedas</span></p>
            <p class="stat-meta">${escapeHtml(meta)}</p>
        </div>`;
}

function renderizarIndicadores(extrato, professor) {
    const soma = tipo => transacoes.filter(t => t.tipo === tipo).reduce((s, t) => s + t.valor, 0);
    const conta = tipo => transacoes.filter(t => t.tipo === tipo).length;
    const html = professor
        ? [
            indicador('Saldo atual', formatarNumero(extrato.saldoAtual), `Semestre ${semestreDe(new Date())}`, true),
            indicador('Total enviado', formatarNumero(soma('ENVIO')), `${conta('ENVIO')} ${conta('ENVIO') === 1 ? 'envio' : 'envios'}`),
            indicador('Próximo crédito', '+1.000', `Em ${formatarData(inicioProximoSemestre())}`)
        ]
        : [
            indicador('Saldo atual', formatarNumero(extrato.saldoAtual), 'Disponível para trocas', true),
            indicador('Total recebido', formatarNumero(soma('RECEBIMENTO')), `${conta('RECEBIMENTO')} ${conta('RECEBIMENTO') === 1 ? 'recebimento' : 'recebimentos'}`),
            indicador('Total trocado', formatarNumero(soma('RESGATE')), `${conta('RESGATE')} ${conta('RESGATE') === 1 ? 'cupom' : 'cupons'}`)
        ];
    document.getElementById('extratoIndicadores').innerHTML = html.join('');
}

function renderizarTabela() {
    const lista = transacoes.filter(t => filtroAtual === 'todas'
        || (filtroAtual === 'entradas' && t.tipo === 'RECEBIMENTO')
        || (filtroAtual === 'saidas' && t.tipo !== 'RECEBIMENTO'));

    const tbody = document.getElementById('tabelaExtrato');
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">${estadoVazioHtml('Nenhuma movimentação',
            transacoes.length ? 'Não há movimentações para este filtro.' : 'As movimentações aparecem aqui conforme acontecem.')}</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(t => {
        const d = descreverTransacao(t);
        const cupom = t.codigoCupom
            ? `<span class="code">${escapeHtml(t.codigoCupom)}</span>
               ${t.statusCupom === 'UTILIZADO' ? '<span class="badge badge-success">Utilizado</span>' : '<span class="badge badge-warning">Disponível</span>'}`
            : '<span class="muted">-</span>';
        return `
            <tr>
                <td class="num" style="white-space:nowrap;">${formatarDataHora(t.dataHora)}</td>
                <td>
                    <div class="cell-title">${escapeHtml(t.descricao)}</div>
                    <div class="cell-sub">${d.rotulo}</div>
                </td>
                <td>${escapeHtml(t.contraparte)}</td>
                <td style="white-space:nowrap;">${cupom}</td>
                <td class="right">${valorTransacaoHtml(t)}</td>
            </tr>`;
    }).join('');
}
