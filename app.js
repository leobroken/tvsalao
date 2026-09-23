const dadosPadrao = {
    canais: [
        { id: "jfKfPfyJRdk", nome: "Canal Padrão (Exemplo)" }
    ],
    propagandas: [
        { id: "jfKfPfyJRdk", nome: "Propaganda Padrão (Exemplo)" }
    ],
    ativoHorizontal: "jfKfPfyJRdk",
    ativoVertical: "jfKfPfyJRdk"
};

function carregarDados() {
    const salvo = localStorage.getItem('tv_salao_dados_v2');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return dadosPadrao;
}

function salvarDados(dados) {
    localStorage.setItem('tv_salao_dados_v2', JSON.stringify(dados));
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
        renderizarListas();
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

function adicionarCanal() {
    const nome = document.getElementById('input-nome-canal').value.trim();
    const link = document.getElementById('input-link-canal').value.trim();

    if (!nome || !link) {
        alert('Por favor, preencha o nome e o link do canal.');
        return;
    }

    const dados = carregarDados();
    const idYoutube = extrairIdYoutube(link);

    dados.canais.push({ id: idYoutube, nome: nome });
    salvarDados(dados);

    document.getElementById('input-nome-canal').value = '';
    document.getElementById('input-link-canal').value = '';
    renderizarListas();
}

function adicionarPropaganda() {
    const nome = document.getElementById('input-nome-prop').value.trim();
    const link = document.getElementById('input-link-prop').value.trim();

    if (!nome || !link) {
        alert('Por favor, preencha o nome e o link da propaganda.');
        return;
    }

    const dados = carregarDados();
    const idYoutube = extrairIdYoutube(link);

    dados.propagandas.push({ id: idYoutube, nome: nome });
    salvarDados(dados);

    document.getElementById('input-nome-prop').value = '';
    document.getElementById('input-link-prop').value = '';
    renderizarListas();
}

function removerCanal(index) {
    const dados = carregarDados();
    dados.canais.splice(index, 1);
    salvarDados(dados);
    renderizarListas();
}

function removerPropaganda(index) {
    const dados = carregarDados();
    dados.propagandas.splice(index, 1);
    salvarDados(dados);
    renderizarListas();
}

function selecionarCanalAtivo(id) {
    const dados = carregarDados();
    dados.ativoHorizontal = id;
    salvarDados(dados);
    renderizarListas();
    alert('Canal selecionado como ativo na TV!');
}

function selecionarPropAtiva(id) {
    const dados = carregarDados();
    dados.ativoVertical = id;
    salvarDados(dados);
    renderizarListas();
    alert('Propaganda selecionada como ativa na TV!');
}

function renderizarListas() {
    const dados = carregarDados();

    // Canais
    const containerCanais = document.getElementById('lista-canais');
    containerCanais.innerHTML = '';
    if (dados.canais.length === 0) {
        containerCanais.innerHTML = `<p class="text-xs text-gray-500 italic">Nenhum canal cadastrado ainda.</p>`;
    }
    dados.canais.forEach((canal, index) => {
        const ativo = dados.ativoHorizontal === canal.id;
        containerCanais.innerHTML += `
            <div class="flex items-center justify-between bg-gray-950 border ${ativo ? 'border-blue-500 bg-blue-950/30' : 'border-gray-800'} p-3 rounded-xl transition">
                <div class="flex items-center space-x-3 overflow-hidden">
                    <span class="text-lg">${ativo ? '📺' : '⚪'}</span>
                    <div class="truncate">
                        <p class="font-semibold text-sm truncate">${canal.nome}</p>
                        <p class="text-xs text-gray-500 truncate">ID: ${canal.id}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 shrink-0">
                    <button onclick="selecionarCanalAtivo('${canal.id}')" class="px-3 py-1.5 text-xs font-bold rounded-lg ${ativo ? 'bg-blue-600 text-white shadow' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} transition">
                        ${ativo ? 'Transmitindo' : 'Usar na TV'}
                    </button>
                    <button onclick="removerCanal(${index})" class="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950 p-2 rounded-lg text-xs transition">🗑️</button>
                </div>
            </div>
        `;
    });

    // Propagandas
    const containerProps = document.getElementById('lista-propagandas');
    containerProps.innerHTML = '';
    if (dados.propagandas.length === 0) {
        containerProps.innerHTML = `<p class="text-xs text-gray-500 italic">Nenhuma propaganda cadastrada ainda.</p>`;
    }
    dados.propagandas.forEach((prop, index) => {
        const ativo = dados.ativoVertical === prop.id;
        containerProps.innerHTML += `
            <div class="flex items-center justify-between bg-gray-950 border ${ativo ? 'border-pink-500 bg-pink-950/30' : 'border-gray-800'} p-3 rounded-xl transition">
                <div class="flex items-center space-x-3 overflow-hidden">
                    <span class="text-lg">${ativo ? '🎬' : '⚪'}</span>
                    <div class="truncate">
                        <p class="font-semibold text-sm truncate">${prop.nome}</p>
                        <p class="text-xs text-gray-500 truncate">ID: ${prop.id}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 shrink-0">
                    <button onclick="selecionarPropAtiva('${prop.id}')" class="px-3 py-1.5 text-xs font-bold rounded-lg ${ativo ? 'bg-pink-600 text-white shadow' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} transition">
                        ${ativo ? 'Transmitindo' : 'Usar na TV'}
                    </button>
                    <button onclick="removerPropaganda(${index})" class="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950 p-2 rounded-lg text-xs transition">🗑️</button>
                </div>
            </div>
        `;
    });
}

// Iniciar players preenchendo perfeitamente o layout
function iniciarPlayers() {
    const dados = carregarDados();

    const containerH = document.getElementById('player-horizontal-container');
    containerH.innerHTML = `
        <iframe class="w-full h-full pointer-events-none rounded-xl" 
            src="https://www.youtube.com/embed/${dados.ativoHorizontal}?autoplay=1&mute=1&loop=1&playlist=${dados.ativoHorizontal}&controls=0&disablekb=1&modestbranding=1" 
            title="TV ao Vivo" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    const containerV = document.getElementById('player-vertical-container');
    containerV.innerHTML = `
        <iframe class="w-full h-full pointer-events-none rounded-xl" 
            src="https://www.youtube.com/embed/${dados.ativoVertical}?autoplay=1&mute=1&loop=1&playlist=${dados.ativoVertical}&controls=0&disablekb=1&modestbranding=1" 
            title="Propagandas" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

window.addEventListener('DOMContentLoaded', () => {
    renderizarListas();
});
