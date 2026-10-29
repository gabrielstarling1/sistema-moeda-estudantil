document.addEventListener('DOMContentLoaded', async () => {
    const user = iniciarPagina({ pagina: 'inicio' });
    if (!user) return;

    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('inicioEyebrow').textContent = `${rotuloPerfil(user.tipoUsuario)} · ${hoje}`;
    document.getElementById('inicioTitulo').textContent =
        `Olá, ${user.tipoUsuario === 'EMPRESA' ? user.nome : primeiroNome(user.nome)}`;

    try {
        if (user.tipoUsuario === 'ALUNO') await montarInicioAluno(user);
        else if (user.tipoUsuario === 'PROFESSOR') await montarInicioProfessor(user);
        else await montarInicioEmpresa(user);
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
});

function indicadorHtml({ rotulo, valor, unidade = '', meta = '', destaque = false }) {
    return `
        <div class="stat ${destaque ? 'stat-primary' : ''}">
            <p class="stat-label">${escapeHtml(rotulo)}</p>
            <p class="stat-value">${escapeHtml(valor)}${unidade ? `<span class="stat-unit">${escapeHtml(unidade)}</span>` : ''}</p>
            ${meta ? `<p class="stat-meta">${escapeHtml(meta)}</p>` : ''}
        </div>`;
}

function cardListaHtml({ titulo, subtitulo = '', itensHtml, vazio, link }) {
    return `
        <section class="card">
            <div class="card-header">
                <div>
                    <h2 class="card-title">${escapeHtml(titulo)}</h2>
                    ${subtitulo ? `<p class="card-subtitle">${escapeHtml(subtitulo)}</p>` : ''}
                </div>
            </div>
            ${itensHtml ? `<ul class="list">${itensHtml}</ul>` : vazio}
            ${link ? `<div class="card-footer"><a class="card-link" href="${link.href}">${escapeHtml(link.texto)} ${icone('seta', 'icon-sm')}</a></div>` : ''}
        </section>`;
}

function itemVantagemHtml(v) {
    return `
        <li class="list-item">
            <img class="thumb" src="${escapeHtml(v.foto)}" alt="">
            <span class="list-main">
                <span class="list-title" title="${escapeHtml(v.nome)}">${escapeHtml(v.nome)}</span>
                <span class="list-meta">${escapeHtml(v.empresaParceira ? v.empresaParceira.nome : '')}</span>
            </span>
            <span class="coin">${formatarNumero(v.custoMoedas)}</span>
        </li>`;
}

async function montarInicioAluno() {
    document.getElementById('inicioDescricao').textContent = 'Seu saldo de moedas e as vantagens que você já pode resgatar.';
    document.getElementById('inicioAcoes').innerHTML =
        `<a class="btn btn-primary" href="/vantagens.html">${icone('vantagem')} Ver vantagens</a>`;

    const [extrato, vantagens] = await Promise.all([
        apiRequest('/api/transacoes/extrato'),
        apiRequest('/api/vantagens')
    ]);
    const recebidas = extrato.transacoes.filter(t => t.tipo === 'RECEBIMENTO');
    const trocas = extrato.transacoes.filter(t => t.tipo === 'RESGATE');
    const soma = lista => lista.reduce((s, t) => s + t.valor, 0);

    document.getElementById('inicioIndicadores').innerHTML = [
        indicadorHtml({ rotulo: 'Saldo disponível', valor: formatarNumero(extrato.saldoAtual), unidade: 'moedas', destaque: true,
            meta: 'Para trocar por vantagens' }),
        indicadorHtml({ rotulo: 'Recebido dos professores', valor: formatarNumero(soma(recebidas)), unidade: 'moedas',
            meta: `${recebidas.length} ${recebidas.length === 1 ? 'reconhecimento' : 'reconhecimentos'}` }),
        indicadorHtml({ rotulo: 'Trocado em vantagens', valor: formatarNumero(soma(trocas)), unidade: 'moedas',
            meta: `${trocas.length} ${trocas.length === 1 ? 'cupom emitido' : 'cupons emitidos'}` })
    ].join('');

    const alcance = vantagens
        .filter(v => v.custoMoedas <= extrato.saldoAtual)
        .sort((a, b) => b.custoMoedas - a.custoMoedas)
        .slice(0, 4);

    document.getElementById('inicioConteudo').innerHTML =
        cardListaHtml({
            titulo: 'Últimas movimentações',
            itensHtml: extrato.transacoes.slice(0, 5).map(itemTransacaoHtml).join(''),
            vazio: estadoVazioHtml('Nenhuma movimentação ainda', 'As moedas enviadas pelos professores aparecem aqui.'),
            link: { href: '/extrato.html', texto: 'Ver extrato completo' }
        }) +
        cardListaHtml({
            titulo: 'Ao seu alcance',
            subtitulo: 'Vantagens que cabem no seu saldo',
            itensHtml: alcance.map(itemVantagemHtml).join(''),
            vazio: estadoVazioHtml('Nenhuma vantagem dentro do saldo', vantagens.length
                ? 'Continue acumulando moedas para resgatar as vantagens do catálogo.'
                : 'As empresas parceiras ainda não publicaram vantagens.'),
            link: { href: '/vantagens.html', texto: 'Ver catálogo de vantagens' }
        });
}

async function montarInicioProfessor(user) {
    document.getElementById('inicioDescricao').textContent = 'Reconheça o mérito dos seus alunos e acompanhe o seu saldo do semestre.';
    document.getElementById('inicioAcoes').innerHTML =
        `<a class="btn btn-primary" href="/transferencia.html">${icone('enviar')} Enviar moedas</a>`;

    const [extrato, professor] = await Promise.all([
        apiRequest('/api/transacoes/extrato'),
        apiRequest(`/api/professores/${user.id}`)
    ]);
    const semestre = semestreDe(new Date());
    const doSemestre = extrato.transacoes.filter(t => semestreDe(t.dataHora) === semestre);
    const enviadoSemestre = doSemestre.reduce((s, t) => s + t.valor, 0);

    document.getElementById('inicioIndicadores').innerHTML = [
        indicadorHtml({ rotulo: 'Saldo disponível', valor: formatarNumero(extrato.saldoAtual), unidade: 'moedas', destaque: true,
            meta: 'O saldo não distribuído é acumulado' }),
        indicadorHtml({ rotulo: `Enviado no semestre ${semestre}`, valor: formatarNumero(enviadoSemestre), unidade: 'moedas',
            meta: `${doSemestre.length} ${doSemestre.length === 1 ? 'reconhecimento' : 'reconhecimentos'}` }),
        indicadorHtml({ rotulo: 'Próximo crédito semestral', valor: '+1.000', unidade: 'moedas',
            meta: `Em ${formatarData(inicioProximoSemestre())}` })
    ].join('');

    document.getElementById('inicioConteudo').innerHTML =
        cardListaHtml({
            titulo: 'Últimos envios',
            itensHtml: extrato.transacoes.slice(0, 5).map(itemTransacaoHtml).join(''),
            vazio: estadoVazioHtml('Você ainda não enviou moedas', 'Use “Enviar moedas” para reconhecer um aluno.'),
            link: { href: '/extrato.html', texto: 'Ver extrato completo' }
        }) +
        `<section class="card">
            <div class="card-header"><h2 class="card-title">Vínculo institucional</h2></div>
            <div class="card-body">
                <dl class="dl">
                    <div class="dl-row"><dt>Instituição</dt><dd>${escapeHtml(professor.instituicaoEnsino ? professor.instituicaoEnsino.nome : '-')}</dd></div>
                    <div class="dl-row"><dt>Departamento</dt><dd>${escapeHtml(professor.departamento)}</dd></div>
                    <div class="dl-row"><dt>Semestre atual</dt><dd>${escapeHtml(semestre)}</dd></div>
                </dl>
            </div>
            <div class="card-footer"><a class="card-link" href="/alunos.html">Consultar alunos ${icone('seta', 'icon-sm')}</a></div>
        </section>`;
}

async function montarInicioEmpresa(user) {
    document.getElementById('inicioDescricao').textContent = 'Acompanhe os resgates das suas vantagens e confira os cupons apresentados pelos alunos.';
    document.getElementById('inicioAcoes').innerHTML =
        `<a class="btn btn-secondary" href="/cupons.html">${icone('cupom')} Conferir cupom</a>
         <a class="btn btn-primary" href="/vantagens.html?nova=1">${icone('mais')} Nova vantagem</a>`;

    const [vantagens, cupons] = await Promise.all([
        apiRequest(`/api/vantagens?empresaId=${user.id}`),
        apiRequest('/api/transacoes/cupons')
    ]);
    const pendentes = cupons.filter(c => c.status === 'EMITIDO');
    const totalMoedas = cupons.reduce((s, c) => s + c.custoMoedas, 0);

    document.getElementById('inicioIndicadores').innerHTML = [
        indicadorHtml({ rotulo: 'Cupons aguardando troca', valor: formatarNumero(pendentes.length), destaque: true,
            meta: 'Confira o código na troca presencial' }),
        indicadorHtml({ rotulo: 'Vantagens publicadas', valor: formatarNumero(vantagens.length),
            meta: 'Visíveis no catálogo dos alunos' }),
        indicadorHtml({ rotulo: 'Moedas resgatadas', valor: formatarNumero(totalMoedas), unidade: 'moedas',
            meta: `${cupons.length} ${cupons.length === 1 ? 'resgate' : 'resgates'} no total` })
    ].join('');

    const itensResgate = cupons.slice(0, 5).map(c => `
        <li class="list-item">
            <span class="list-main">
                <span class="list-title">${escapeHtml(c.vantagem)}</span>
                <span class="list-meta">${escapeHtml(c.alunoNome)} · ${formatarDataHora(c.emitidoEm)}</span>
            </span>
            ${c.status === 'UTILIZADO'
                ? '<span class="badge badge-success">Utilizado</span>'
                : '<span class="badge badge-warning">Aguardando</span>'}
        </li>`).join('');

    document.getElementById('inicioConteudo').innerHTML =
        cardListaHtml({
            titulo: 'Resgates recentes',
            itensHtml: itensResgate,
            vazio: estadoVazioHtml('Nenhum resgate ainda', 'Quando um aluno resgatar uma vantagem, o cupom aparece aqui.'),
            link: { href: '/cupons.html', texto: 'Ir para a conferência de cupons' }
        }) +
        cardListaHtml({
            titulo: 'Suas vantagens',
            itensHtml: vantagens.slice(0, 5).map(itemVantagemHtml).join(''),
            vazio: estadoVazioHtml('Nenhuma vantagem publicada', 'Cadastre produtos ou descontos para os alunos.'),
            link: { href: '/vantagens.html', texto: 'Gerenciar vantagens' }
        });
}
