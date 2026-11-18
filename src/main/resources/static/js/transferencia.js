let saldoProfessor = 0;
let alunos = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({ pagina: 'transferencia', perfis: ['PROFESSOR'] });
    if (!user) return;

    document.getElementById('transferenciaForm').addEventListener('submit', enviarMoedas);
    document.querySelectorAll('#atalhosValor [data-valor]').forEach(chip =>
        chip.addEventListener('click', () => { document.getElementById('valor').value = chip.dataset.valor; }));

    await Promise.all([carregarAlunos(), carregarExtrato()]);
});

async function carregarAlunos() {
    const select = document.getElementById('alunoId');
    try {
        alunos = (await apiRequest('/api/alunos') || []).sort((a, b) => a.nome.localeCompare(b.nome));
        select.innerHTML = alunos.length
            ? '<option value="">Selecione o aluno</option>'
            : '<option value="">Nenhum aluno cadastrado</option>';
        alunos.forEach(a => select.add(new Option(
            `${a.nome} — ${a.curso}, ${a.instituicaoEnsino ? a.instituicaoEnsino.nome : '-'}`, a.id)));

        const preSelecionado = new URLSearchParams(location.search).get('aluno');
        if (preSelecionado) select.value = preSelecionado;
    } catch (err) {
        mostrarAlerta(null, 'Não foi possível carregar os alunos: ' + err.message, 'error');
    }
}

async function carregarExtrato() {
    try {
        const extrato = await apiRequest('/api/transacoes/extrato');
        saldoProfessor = extrato.saldoAtual;
        document.getElementById('saldoProfessor').textContent = formatarNumero(saldoProfessor);
        document.getElementById('saldoMeta').textContent =
            `Semestre ${semestreDe(new Date())} · próximo crédito de 1.000 em ${formatarData(inicioProximoSemestre())}`;
        document.getElementById('valor').max = saldoProfessor;

        const envios = extrato.transacoes.slice(0, 5);
        document.getElementById('ultimosEnvios').innerHTML = envios.length
            ? envios.map(itemTransacaoHtml).join('')
            : `<li>${estadoVazioHtml('Nenhum envio ainda')}</li>`;
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

async function enviarMoedas(e) {
    e.preventDefault();
    const alunoId = Number(document.getElementById('alunoId').value);
    const valor = Number(document.getElementById('valor').value);
    const motivo = document.getElementById('motivo').value.trim();
    const aluno = alunos.find(a => a.id === alunoId);

    if (!aluno || !valor || !motivo) {
        mostrarAlerta(null, 'Preencha o aluno, a quantidade de moedas e o motivo.', 'error');
        return;
    }
    if (valor > saldoProfessor) {
        mostrarAlerta(null, `Saldo insuficiente: você tem ${formatarMoedas(saldoProfessor)}.`, 'error');
        return;
    }

    const confirmado = await abrirDialogo({
        titulo: 'Confirmar envio',
        corpoHtml: `<div class="summary">
                ${linhaResumo('Aluno', aluno.nome)}
                ${linhaResumo('Quantidade', formatarMoedas(valor))}
                ${linhaResumo('Seu saldo após o envio', formatarMoedas(saldoProfessor - valor))}
            </div>
            <p style="margin-top:12px;"><strong style="color:var(--text);">Motivo:</strong> ${escapeHtml(motivo)}</p>`,
        confirmarTexto: 'Enviar moedas'
    });
    if (!confirmado) return;

    const botao = e.target.querySelector('button[type="submit"]');
    definirCarregando(botao, true, 'Enviando...');
    try {
        await apiRequest('/api/transacoes/transferencias', {
            method: 'POST',
            body: JSON.stringify({ alunoId, valor, motivo })
        });
        mostrarAlerta(null, `${formatarMoedas(valor)} enviadas para ${aluno.nome}. O aluno foi avisado por e-mail.`);
        e.target.reset();
        await carregarExtrato();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    } finally {
        definirCarregando(botao, false);
    }
}
