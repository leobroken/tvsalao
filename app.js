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
    ativoHorizontal: "jfKfPfyJRdk"
};

function carregarDados() {
    const salvo = localStorage.getItem('tv_salao_dados_v3');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return dadosPadrao;
}

function salvarDados(dados) {
    localStorage.setItem('tv_salao_dados_v3', JSON.stringify(dados));
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

// Montagem da Sequência
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
        alert('A sequência está vazia! Adicione ao menos um vídeo.');
        return;
    }
    salvarDados(dados);
    alert('Sequência de propagandas salva com sucesso!');
}

// Renderização do Painel de Controle
function renderizarPainel() {
    const dados = carregarDados();

    // 1. Lista de Canais
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

    // 2. Biblioteca de Propagandas
    const containerBib = document.getElementById('lista-biblioteca-props');
    containerBib.innerHTML = dados.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Nenhuma propaganda cadastrada.</p>' : '';
    dados.bibliotecaProps.forEach((prop, index) => {
        containerBib.innerHTML += `
            <div class="flex items-center justify-between bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-xs">
                <span class="font-medium truncate mr-2">${prop.nome}</span>
                <button onclick="removerPropagandaBiblioteca(${index})" class="text-red-400 hover:text-red-300 p-1 shrink-0">🗑️ Excluir</button>
            </div>
        `;
    });

    // 3. Seletor para adicionar na Sequência
    const containerSeletor = document.getElementById('seletor-adicionar-sequencia');
    containerSeletor.innerHTML = dados.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Cadastre propagandas acima primeiro.</p>' : '';
    dados.bibliotecaProps.forEach((prop) => {
        containerSeletor.innerHTML += `
            <div class="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-xl text-xs">
                <span class="truncate mr-2">${prop.nome}</span>
                <button onclick="adicionarNaSequencia('${prop.id}', '${prop.nome}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold shrink-0">
                    ➕ Adicionar
                </button>
            </div>
        `;
    });

    // 4. Sequência Atual
    const containerSeq = document.getElementById('lista-sequencia-atual');
    containerSeq.innerHTML = dados.sequenciaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Sequência vazia. Adicione itens ao lado.</p>' : '';
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

// Iniciar players na Tela da TV com rotação automática via Playlist do YouTube
function iniciarPlayers() {
    const dados = carregarDados();

    // Player Horizontal (TV ao Vivo)
    const containerH = document.getElementById('player-horizontal-container');
    containerH.innerHTML = `
        <iframe class="w-full h-full pointer-events-none rounded-xl" 
            src="https://www.youtube.com/embed/${dados.ativoHorizontal}?autoplay=1&mute=1&loop=1&playlist=${dados.ativoHorizontal}&controls=0&disablekb=1&modestbranding=1" 
            title="TV ao Vivo" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    // Player Vertical (Propagandas em Playlist Rotativa)
    // Extrai todos os IDs da sequência salva e junta por vírgulas para o YouTube rodar em loop sequencial
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
