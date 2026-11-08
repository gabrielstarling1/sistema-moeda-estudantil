const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;

let usuario = null;
let vantagens = [];
let saldoAluno = 0;
let fotoSelecionada = null;

document.addEventListener('DOMContentLoaded', async () => {
    usuario = iniciarPagina({ pagina: 'vantagens' });
    if (!usuario) return;

    document.getElementById('buscaVantagemGrupo').insertAdjacentHTML('afterbegin', icone('buscar'));
    document.getElementById('buscaVantagem').addEventListener('input', renderizar);

    if (usuario.tipoUsuario === 'EMPRESA') {
        configurarEmpresa();
    } else if (usuario.tipoUsuario === 'ALUNO') {
        document.getElementById('vantagensDescricao').textContent =
            'Troque suas moedas por produtos e descontos. O cupom é enviado para o seu e-mail e para a empresa parceira.';
        document.getElementById('filtroSaldoRotulo').classList.remove('hidden');
        document.getElementById('filtroSaldo').addEventListener('change', renderizar);
        document.getElementById('catalogo').classList.remove('hidden');
        await atualizarSaldo();
    } else {
        document.getElementById('vantagensDescricao').textContent =
            'Vantagens que os alunos podem resgatar com as moedas recebidas.';
        document.getElementById('catalogo').classList.remove('hidden');
    }

    await carregarVantagens();

    if (usuario.tipoUsuario === 'EMPRESA' && new URLSearchParams(location.search).has('nova')) {
        abrirFormulario();
    }
});

async function carregarVantagens() {
    try {
        const url = usuario.tipoUsuario === 'EMPRESA' ? `/api/vantagens?empresaId=${usuario.id}` : '/api/vantagens';
        vantagens = await apiRequest(url) || [];
        renderizar();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

function filtrar() {
    const termo = document.getElementById('buscaVantagem').value.trim().toLowerCase();
    const somenteSaldo = usuario.tipoUsuario === 'ALUNO' && document.getElementById('filtroSaldo').checked;
    return vantagens.filter(v => {
        if (somenteSaldo && v.custoMoedas > saldoAluno) return false;
        if (!termo) return true;
        return [v.nome, v.descricao, v.empresaParceira && v.empresaParceira.nome]
            .some(t => t && t.toLowerCase().includes(termo));
    });
}

function renderizar() {
    const lista = filtrar();
    document.getElementById('contadorVantagens').textContent =
        `${lista.length} ${lista.length === 1 ? 'vantagem' : 'vantagens'}`;
    if (usuario.tipoUsuario === 'EMPRESA') renderizarGestao(lista);
    else renderizarCatalogo(lista);
}

// ---------------------------------------------------------------- Catalogo

function renderizarCatalogo(lista) {
    const catalogo = document.getElementById('catalogo');
    if (lista.length === 0) {
        catalogo.innerHTML = `<div style="grid-column:1/-1;">${vantagens.length
            ? estadoVazioHtml('Nenhuma vantagem encontrada', 'Ajuste a busca ou o filtro.')
            : estadoVazioHtml('Nenhuma vantagem publicada', 'As empresas parceiras ainda não cadastraram vantagens.')}</div>`;
        return;
    }
    catalogo.innerHTML = lista.map(v => {
        let acao = '';
        if (usuario.tipoUsuario === 'ALUNO') {
            const falta = v.custoMoedas - saldoAluno;
            acao = falta > 0
                ? `<span class="muted" style="font-size:12px;">Faltam ${formatarNumero(falta)}</span>`
                : `<button type="button" class="btn btn-primary btn-sm" data-resgatar="${v.id}">Resgatar</button>`;
        }
        return `
            <article class="offer">
                <img class="offer-media" src="${escapeHtml(v.foto)}" alt="${escapeHtml(v.nome)}" loading="lazy">
                <div class="offer-body">
                    <span class="offer-partner">${escapeHtml(v.empresaParceira ? v.empresaParceira.nome : '')}</span>
                    <h3 class="offer-title">${escapeHtml(v.nome)}</h3>
                    <p class="offer-desc">${escapeHtml(v.descricao)}</p>
                    <div class="offer-footer">
                        <span class="coin offer-price">${formatarNumero(v.custoMoedas)}<span class="stat-unit">moedas</span></span>
                        ${acao}
                    </div>
                </div>
            </article>`;
    }).join('');
    catalogo.querySelectorAll('[data-resgatar]').forEach(btn =>
        btn.addEventListener('click', () => resgatar(Number(btn.dataset.resgatar))));
}

async function atualizarSaldo() {
    try {
        const aluno = await apiRequest(`/api/alunos/${usuario.id}`);
        saldoAluno = aluno.saldoMoedas;
        document.getElementById('vantagensAcoes').innerHTML =
            `<span class="balance-pill">${icone('moeda')} Saldo <strong>${formatarMoedas(saldoAluno)}</strong></span>`;
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

async function resgatar(id) {
    const v = vantagens.find(item => item.id === id);
    if (!v) return;

    const confirmado = await abrirDialogo({
        titulo: 'Confirmar resgate',
        corpoHtml: `<p>O custo será descontado do seu saldo e um cupom será emitido.</p>
            <div class="summary">
                ${linhaResumo('Vantagem', v.nome)}
                ${linhaResumo('Empresa', v.empresaParceira ? v.empresaParceira.nome : '-')}
                ${linhaResumo('Custo', formatarMoedas(v.custoMoedas))}
                ${linhaResumo('Saldo após o resgate', formatarMoedas(saldoAluno - v.custoMoedas))}
            </div>`,
        confirmarTexto: 'Resgatar'
    });
    if (!confirmado) return;

    try {
        const resgate = await apiRequest('/api/transacoes/resgates', {
            method: 'POST',
            body: JSON.stringify({ vantagemId: id })
        });
        await atualizarSaldo();
        renderizar();
        await abrirDialogo({
            titulo: 'Resgate concluído',
            corpoHtml: `<p>Apresente este código na troca presencial. Ele também foi enviado para o seu e-mail e para ${escapeHtml(v.empresaParceira ? v.empresaParceira.nome : 'a empresa parceira')}.</p>
                <div class="coupon">
                    <p class="muted" style="font-size:12px;margin-bottom:4px;">Código do cupom</p>
                    <p class="coupon-code">${escapeHtml(resgate.codigoCupom)}</p>
                </div>`,
            confirmarTexto: 'Concluir',
            somenteOk: true
        });
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}

// ---------------------------------------------------------------- Gestao (empresa)

function configurarEmpresa() {
    document.title = 'Minhas vantagens | Moeda Estudantil';
    document.getElementById('vantagensEyebrow').textContent = 'Empresa parceira';
    document.getElementById('vantagensTitulo').textContent = 'Minhas vantagens';
    document.getElementById('vantagensDescricao').textContent =
        'Produtos e descontos que sua empresa oferece. Cada vantagem tem descrição, foto e custo em moedas.';
    document.getElementById('vantagensAcoes').innerHTML =
        `<button type="button" class="btn btn-primary" id="btnNovaVantagem">${icone('mais')} Nova vantagem</button>`;
    document.getElementById('gestao').classList.remove('hidden');

    document.getElementById('btnNovaVantagem').addEventListener('click', () => abrirFormulario());
    document.getElementById('btnFecharModal').innerHTML = icone('fechar');
    document.querySelectorAll('#modalVantagem [data-fechar]').forEach(b => b.addEventListener('click', fecharFormulario));
    document.getElementById('modalVantagem').addEventListener('click', e => {
        if (e.target.id === 'modalVantagem') fecharFormulario();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') fecharFormulario();
    });
    document.getElementById('vantagemFoto').addEventListener('change', selecionarFoto);
    document.getElementById('vantagemForm').addEventListener('submit', salvar);
}

function renderizarGestao(lista) {
    const tbody = document.getElementById('tabelaVantagens');
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">${vantagens.length
            ? estadoVazioHtml('Nenhuma vantagem encontrada', 'Tente outro termo de busca.')
            : estadoVazioHtml('Nenhuma vantagem publicada', 'Use “Nova vantagem” para oferecer o primeiro produto ou desconto.')}</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(v => `
        <tr>
            <td>
                <div class="cell-media">
                    <img class="thumb" src="${escapeHtml(v.foto)}" alt="">
                    <div>
                        <div class="cell-title">${escapeHtml(v.nome)}</div>
                        <div class="cell-sub" style="max-width:520px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.descricao)}</div>
                    </div>
                </div>
            </td>
            <td class="right"><span class="coin">${formatarNumero(v.custoMoedas)}</span></td>
            <td class="actions">
                <button type="button" class="btn btn-ghost btn-sm" data-editar="${v.id}">${icone('editar', 'icon-sm')} Editar</button>
                <button type="button" class="btn btn-ghost btn-sm" data-excluir="${v.id}" aria-label="Excluir ${escapeHtml(v.nome)}">${icone('excluir', 'icon-sm')}</button>
            </td>
        </tr>`).join('');
    tbody.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => abrirFormulario(Number(b.dataset.editar))));
    tbody.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', () => excluir(Number(b.dataset.excluir))));
}

function mostrarPreview(src) {
    const preview = document.getElementById('fotoPreview');
    preview.innerHTML = src
        ? `<img src="${escapeHtml(src)}" alt="Pré-visualização" style="width:100%;height:100%;object-fit:cover;">`
        : icone('imagem');
}

function abrirFormulario(id) {
    const v = id ? vantagens.find(item => item.id === id) : null;
    document.getElementById('vantagemForm').reset();
    fotoSelecionada = null;
    document.getElementById('vantagemId').value = v ? v.id : '';
    document.getElementById('vantagemNome').value = v ? v.nome : '';
    document.getElementById('vantagemDescricao').value = v ? v.descricao : '';
    document.getElementById('vantagemCusto').value = v ? v.custoMoedas : '';
    document.getElementById('modalVantagemTitulo').textContent = v ? 'Editar vantagem' : 'Nova vantagem';
    document.getElementById('btnSalvarVantagem').textContent = v ? 'Salvar alterações' : 'Publicar vantagem';
    document.getElementById('fotoHint').textContent = v
        ? 'Envie um arquivo apenas se quiser trocar a foto atual.'
        : 'PNG, JPG, WEBP ou GIF de até 2 MB.';
    mostrarPreview(v ? v.foto : null);
    document.getElementById('modalVantagem').classList.remove('hidden');
    document.getElementById('vantagemNome').focus();
}

function fecharFormulario() {
    document.getElementById('modalVantagem').classList.add('hidden');
}

function selecionarFoto(e) {
    const arquivo = e.target.files[0];
    fotoSelecionada = null;
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
        e.target.value = '';
        mostrarAlerta(null, 'A foto deve ter no máximo 2 MB.', 'error');
        return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
        fotoSelecionada = leitor.result;
        mostrarPreview(fotoSelecionada);
    };
    leitor.readAsDataURL(arquivo);
}

async function salvar(e) {
    e.preventDefault();
    const id = document.getElementById('vantagemId').value;
    if (!id && !fotoSelecionada) {
        mostrarAlerta(null, 'Selecione a foto do produto.', 'error');
        return;
    }
    const payload = {
        nome: document.getElementById('vantagemNome').value.trim(),
        descricao: document.getElementById('vantagemDescricao').value.trim(),
        custoMoedas: Number(document.getElementById('vantagemCusto').value),
        foto: fotoSelecionada
    };
    const botao = document.getElementById('btnSalvarVantagem');
    definirCarregando(botao, true);
    try {
        if (id) {
            await apiRequest(`/api/vantagens/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            mostrarAlerta(null, 'Vantagem atualizada.');
        } else {
            await apiRequest('/api/vantagens', { method: 'POST', body: JSON.stringify(payload) });
            mostrarAlerta(null, 'Vantagem publicada no catálogo dos alunos.');
        }
        fecharFormulario();
        await carregarVantagens();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    } finally {
        definirCarregando(botao, false);
    }
}

async function excluir(id) {
    const v = vantagens.find(item => item.id === id);
    const confirmado = await abrirDialogo({
        titulo: 'Excluir vantagem?',
        corpoHtml: `<p>“${escapeHtml(v ? v.nome : '')}” deixará de aparecer no catálogo. Vantagens que já foram resgatadas não podem ser excluídas.</p>`,
        confirmarTexto: 'Excluir',
        perigo: true
    });
    if (!confirmado) return;
    try {
        await apiRequest(`/api/vantagens/${id}`, { method: 'DELETE' });
        mostrarAlerta(null, 'Vantagem excluída.');
        await carregarVantagens();
    } catch (err) {
        mostrarAlerta(null, err.message, 'error');
    }
}
