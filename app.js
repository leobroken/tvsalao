const dadosPadrao = {
    canais: [
        { id: "jfKfPfyJRdk", nome: "Canal Padrão (Exemplo)" }
    ],
    bibliotecaProps: [
        { id: "jfKfPfyJRdk", nome: "Propaganda Padrão (Exemplo)" }
    ],
    sequenciaProps: [
        { id: "jfKfPfyJRdk", nome: "Propaganda Padrão (Exemplo)" }
    ],
    ativoHorizontal: "jfKfPfyJRdk",
    comSom: false // Por padrão inicia mudo para evitar bloqueio do navegador
};

function carregarDados() {
    const salvo = localStorage.getItem('tv_salao_dados_v4');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return dadosPadrao;
}

function salvarDados(dados) {
    localStorage.setItem('tv_salao_dados_v4', JSON.stringify(dados));
}

function mudarAba(aba) {
    const viewPainel = document.getElementById('view-painel');
    const viewTv = document.getElementById('view-tv');

    if (aba === 'tv') {
        viewPainel.classList.add('hidden');
        viewTv.classList.remove('hidden');
        iniciarPlayers();
    } else {
        viewTv.classList.add('hidden');
        viewPainel.classList.remove('hidden');
        renderizarPainel();
    }
}

function extrairIdYoutube(urlOuId) {
    if (!urlOuId) return '';
    let id = urlOuId.trim();
    if (id.includes('youtube.com') || id.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = id.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
    }
    return id;
}

// Controle de Som
function alternarSomPainel() {
    const dados = carregarDados();
    dados.comSom = !dados.comSom;
    salvarDados(dados);
    atualizarBotaoSom();
}

function alternarSomNaTela() {
    const dados = carregarDados();
    dados.comSom = !dados.comSom;
    salvarDados(dados);
    atualizarBotaoSom();
    iniciarPlayers(); // Recarrega o player aplicando o novo estado de som
}

function atualizarBotaoSom() {
    const dados = carregarDados();
    const btnPainel = document.getElementById('btn-toggle-som');
    const btnTela = document.getElementById('btn-som-tela');

    if (dados.comSom) {
        if (btnPainel) {
            btnPainel.className = "px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition shadow";
            btnPainel.innerText = "🔊 Som Ligado";
        }
        if (btnTela) {
            btnTela.innerText = "🔊 Som: Ligado";
        }
    } else {
        if (btnPainel) {
            btnPainel.className = "px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition shadow";
            btnPainel.innerText = "🔇 Som Mudo";
        }
        if (btnTela) {
            btnTela.innerText = "🔇 Som: Mudo";
        }
    }
}

// Canais
function adicionarCanal() {
    const nome = document.getElementById('input-nome-canal').value.trim();
    const link = document.getElementById('input-link-canal').value.trim();

    if (!nome || !link) {
        alert('Preencha o nome e o link do canal.');
        return;
    }

    const dados = carregarDados();
    dados.canais.push({ id: extrairIdYoutube(link), nome: nome });
    salvarDados(dados);

    document.getElementById('input-nome-canal').value = '';
    document.getElementById('input-link-canal').value = '';
    renderizarPainel();
}

function removerCanal(index) {
    const dados = carregarDados();
    dados.canais.splice(index, 1);
    salvarDados(dados);
    renderizarPainel();
}

function selecionarCanalAtivo(id) {
    const dados = carregarDados();
    dados.ativoHorizontal = id;
    salvarDados(dados);
    renderizarPainel();
    alert('Canal definido na TV!');
}

// Biblioteca de Propagandas
function adicionarPropaganda() {
    const nome = document.getElementById('input-nome-prop').value.trim();
    const link = document.getElementById('input-link-prop').value.trim();

    if (!nome || !link) {
        alert('Preencha o nome e o link da propaganda.');
        return;
    }

    const dados = carregarDados();
    dados.bibliotecaProps.push({ id: extrairIdYoutube(link), nome: nome });
    salvarDados(dados);

    document.getElementById('input-nome-prop').value = '';
    document.getElementById('input-link-prop').value = '';
    renderizarPainel();
}

function removerPropagandaBiblioteca(index) {
    const dados = carregarDados();
    dados.bibliotecaProps.splice(index, 1);
    salvarDados(dados);
    renderizarPainel();
}

// Sequência
function adicionarNaSequencia(id, nome) {
    const dados = carregarDados();
    dados.sequenciaProps.push({ id: id, nome: nome });
    salvarDados(dados);
    renderizarPainel();
}

function removerDaSequencia(index) {
    const dados = carregarDados();
    dados.sequenciaProps.splice(index, 1);
    salvarDados(dados);
    renderizarPainel();
}

function salvarSequencia() {
    const dados = carregarDados();
    if (dados.sequenciaProps.length === 0) {
        alert('A sequência está vazia!');
        return;
    }
    salvarDados(dados);
    alert('Sequência salva com sucesso!');
}

function renderizarPainel() {
    atualizarBotaoSom();
    const dados = carregarDados();

    // Canais
    const containerCanais = document.getElementById('lista-canais');
    containerCanais.innerHTML = dados.canais.length === 0 ? '<p class="text-xs text-gray-500 italic">Nenhum canal.</p>' : '';
    dados.canais.forEach((canal, index) => {
        const ativo = dados.ativoHorizontal === canal.id;
        containerCanais.innerHTML += `
            <div class="flex items-center justify-between bg-gray-950 border ${ativo ? 'border-blue-500 bg-blue-950/20' : 'border-gray-800'} p-2.5 rounded-xl text-xs">
                <span class="font-medium truncate mr-2">${canal.nome}</span>
                <div class="flex items-center space-x-1 shrink-0">
                    <button onclick="selecionarCanalAtivo('${canal.id}')" class="px-2 py-1 font-bold rounded ${ativo ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}">
                        ${ativo ? 'Transmitindo' : 'Usar'}
                    </button>
                    <button onclick="removerCanal(${index})" class="text-red-400 hover:text-red-300 p-1">🗑️</button>
                </div>
            </div>
        `;
    });

    // Biblioteca de Propagandas
    const containerBib = document.getElementById('lista-biblioteca-props');
    containerBib.innerHTML = dados.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Nenhuma propaganda.</p>' : '';
    dados.bibliotecaProps.forEach((prop, index) => {
        containerBib.innerHTML += `
            <div class="flex items-center justify-between bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-xs">
                <span class="font-medium truncate mr-2">${prop.nome}</span>
                <button onclick="removerPropagandaBiblioteca(${index})" class="text-red-400 hover:text-red-300 p-1 shrink-0">🗑️ Excluir</button>
            </div>
        `;
    });

    // Seletor Sequência
    const containerSeletor = document.getElementById('seletor-adicionar-sequencia');
    containerSeletor.innerHTML = dados.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Cadastre propagandas acima.</p>' : '';
    dados.bibliotecaProps.forEach((prop) => {
        containerSeletor.innerHTML += `
            <div class="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-xl text-xs">
                <span class="truncate mr-2">${prop.nome}</span>
                <button onclick="adicionarNaSequencia('${prop.id}', '${prop.nome}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold shrink-0">➕ Adicionar</button>
            </div>
        `;
    });

    // Sequência Atual
    const containerSeq = document.getElementById('lista-sequencia-atual');
    containerSeq.innerHTML = dados.sequenciaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Sequência vazia.</p>' : '';
    dados.sequenciaProps.forEach((prop, index) => {
        containerSeq.innerHTML += `
            <div class="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-xl text-xs">
                <div class="flex items-center space-x-2 truncate mr-2">
                    <span class="text-gray-500 font-bold">${index + 1}.</span>
                    <span class="truncate">${prop.nome}</span>
                </div>
                <button onclick="removerDaSequencia(${index})" class="text-red-400 hover:text-red-300 p-1 shrink-0">❌ Remover</button>
            </div>
        `;
    });
}

// Iniciar Players respeitando o estado do som (mute=0 ou mute=1)
function iniciarPlayers() {
    const dados = carregarDados();
    const muteParam = dados.comSom ? "0" : "1";

    // Player Horizontal (TV ao Vivo) - As propagandas verticais sempre entram mudas (`mute=1`) para não embolar o áudio do salão
    const containerH = document.getElementById('player-horizontal-container');
    containerH.innerHTML = `
        <iframe class="w-full h-full pointer-events-none rounded-xl" 
            src="https://www.youtube.com/embed/${dados.ativoHorizontal}?autoplay=1&mute=${muteParam}&loop=1&playlist=${dados.ativoHorizontal}&controls=0&disablekb=1&modestbranding=1" 
            title="TV ao Vivo" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    const idsPlaylist = dados.sequenciaProps.map(p => p.id).join(',');
    const primeiroId = dados.sequenciaProps.length > 0 ? dados.sequenciaProps[0].id : "jfKfPfyJRdk";

    const containerV = document.getElementById('player-vertical-container');
    containerV.innerHTML = `
        <iframe class="w-full h-full pointer-events-none rounded-xl" 
            src="https://www.youtube.com/embed/${primeiroId}?autoplay=1&mute=1&playlist=${idsPlaylist}&loop=1&controls=0&disablekb=1&modestbranding=1" 
            title="Propagandas" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

window.addEventListener('DOMContentLoaded', () => {
    renderizarPainel();
});
