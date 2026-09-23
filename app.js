const dadosPadrao = {
    canais: [
        { id: "jfKfPfyJRdk", nome: "Canal Padrão (Exemplo)" }
    ],
    bibliotecaProps: [
        { id: "jfKfPfyJRdk", nome: "Propaganda Padrão", comSom: false }
    ],
    sequenciaProps: [
        { id: "jfKfPfyJRdk", nome: "Propaganda Padrão", comSom: false }
    ],
    ativoHorizontal: "jfKfPfyJRdk"
};

let playerTv = null;
let playerProp = null;
let indicePropAtual = 0;
let timerVerificacao = null;

function carregarDados() {
    const salvo = localStorage.getItem('tv_salao_dados_v5');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return dadosPadrao;
}

function salvarDados(dados) {
    localStorage.setItem('tv_salao_dados_v5', JSON.stringify(dados));
}

function mudarAba(aba) {
    const viewPainel = document.getElementById('view-painel');
    const viewTv = document.getElementById('view-tv');

    if (aba === 'tv') {
        viewPainel.classList.add('hidden');
        viewTv.classList.remove('hidden');
        
        // Pequeno atraso para garantir que o container visível carregou os players do YouTube
        setTimeout(() => {
            iniciarPlayersAPI();
        }, 300);
    } else {
        viewTv.classList.add('hidden');
        viewPainel.classList.remove('hidden');
        if (timerVerificacao) clearInterval(timerVerificacao);
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
    const comSom = document.getElementById('input-com-som-prop').checked;

    if (!nome || !link) {
        alert('Preencha o nome e o link da propaganda.');
        return;
    }

    const dados = carregarDados();
    dados.bibliotecaProps.push({ id: extrairIdYoutube(link), nome: nome, comSom: comSom });
    salvarDados(dados);

    document.getElementById('input-nome-prop').value = '';
    document.getElementById('input-link-prop').value = '';
    document.getElementById('input-com-som-prop').checked = false;
    renderizarPainel();
}

function removerPropagandaBiblioteca(index) {
    const dados = carregarDados();
    dados.bibliotecaProps.splice(index, 1);
    salvarDados(dados);
    renderizarPainel();
}

// Sequência
function adicionarNaSequencia(id, nome, comSom) {
    const dados = carregarDados();
    dados.sequenciaProps.push({ id: id, nome: nome, comSom: comSom });
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
                <div class="truncate mr-2">
                    <span class="font-medium">${prop.nome}</span>
                    <span class="ml-1 text-[10px] px-1.5 py-0.5 rounded ${prop.comSom ? 'bg-pink-900/60 text-pink-300' : 'bg-gray-800 text-gray-400'}">${prop.comSom ? '🔊 Com Som' : '🔇 Mudo'}</span>
                </div>
                <button onclick="removerPropagandaBiblioteca(${index})" class="text-red-400 hover:text-red-300 p-1 shrink-0">🗑️</button>
            </div>
        `;
    });

    // Seletor Sequência
    const containerSeletor = document.getElementById('seletor-adicionar-sequencia');
    containerSeletor.innerHTML = dados.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Cadastre propagandas acima.</p>' : '';
    dados.bibliotecaProps.forEach((prop) => {
        // Passa o parâmetro de som corretamente ao botão
        const comSomStr = prop.comSom ? 'true' : 'false';
        containerSeletor.innerHTML += `
            <div class="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-xl text-xs">
                <div class="truncate mr-2">
                    <span class="truncate">${prop.nome}</span>
                    <span class="text-[10px] text-gray-400">(${prop.comSom ? 'Com Som' : 'Mudo'})</span>
                </div>
                <button onclick="adicionarNaSequencia('${prop.id}', '${prop.nome.replace(/'/g, "\\'")}', ${comSomStr})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold shrink-0">➕ Adicionar</button>
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
                    <span class="text-[10px] text-gray-400">(${prop.comSom ? 'Com Som' : 'Mudo'})</span>
                </div>
                <button onclick="removerDaSequencia(${index})" class="text-red-400 hover:text-red-300 p-1 shrink-0">❌</button>
            </div>
        `;
    });
}

// Inicialização dos Players via API do YouTube
function iniciarPlayersAPI() {
    const dados = carregarDados();

    // Se já existirem players, destrói para recriar limpo
    if (playerTv) playerTv.destroy();
    if (playerProp) playerProp.destroy();

    // 1. Player TV ao Vivo (Horizontal)
    playerTv = new YT.Player('yt-player-tv', {
        height: '100%',
        width: '100%',
        videoId: dados.ativoHorizontal,
        playerVars: {
            'autoplay': 1,
            'mute': 0, // TV começa com som normal de fundo
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'loop': 1,
            'playlist': dados.ativoHorizontal
        },
        events: {
            'onReady': (event) => event.target.playVideo()
        }
    });

    // Se houver itens na sequência de propagandas
    if (dados.sequenciaProps.length > 0) {
        const idsPlaylist = dados.sequenciaProps.map(p => p.id);
        indicePropAtual = 0;

        // 2. Player Propagandas (Vertical)
        playerProp = new YT.Player('yt-player-prop', {
            height: '100%',
            width: '100%',
            videoId: idsPlaylist[0],
            playerVars: {
                'autoplay': 1,
                'mute': 1, // Começa mudo por segurança ou conforme o primeiro item
                'controls': 0,
                'disablekb': 1,
                'modestbranding': 1
            },
            events: {
                'onReady': (event) => {
                    event.target.playVideo();
                    aplicarRegraDeSomAtual();
                },
                'onStateChange': (event) => {
                    // Quando o vídeo da propaganda termina (Estado 0), passa para o próximo da lista
                    if (event.data === YT.PlayerState.ENDED) {
                        indicePropAtual = (indicePropAtual + 1) % idsPlaylist.length;
                        playerProp.loadVideoById(idsPlaylist[indicePropAtual]);
                        aplicarRegraDeSomAtual();
                    }
                }
            }
        });
    }

    // Monitora o status de áudio na tela para feedback visual
    if (timerVerificacao) clearInterval(timerVerificacao);
    timerVerificacao = setInterval(() => {
        atualizarIndicadorTela();
    }, 1000);
}

// Aplica a regra: Se a propaganda atual tem som, silencia a TV ao vivo e liga o som dela. Caso contrário, som na TV e mudo na prop.
function aplicarRegraDeSomAtual() {
    const dados = carregarDados();
    if (!dados.sequenciaProps || dados.sequenciaProps.length === 0) return;

    const propAtual = dados.sequenciaProps[indicePropAtual];
    const indicador = document.getElementById('status-audio-tv');

    if (propAtual && propAtual.comSom) {
        // Propaganda tem som: Silencia a TV e dá som na propaganda
        if (playerTv && typeof playerTv.mute === 'function') playerTv.mute();
        if (playerProp && typeof playerProp.unMute === 'function') playerProp.unMute();
        if (indicador) {
            indicador.innerText = `🎬 Propaganda com Som: ${propAtual.nome}`;
            indicador.classList.remove('hidden');
        }
    } else {
        // Propaganda é muda: TV ao vivo com som de fundo normal
        if (playerTv && typeof playerTv.unMute === 'function') playerTv.unMute();
        if (playerProp && typeof playerProp.mute === 'function') playerProp.mute();
        if (indicador) {
            indicador.classList.add('hidden');
        }
    }
}

function atualizarIndicadorTela() {
    // Garante que o player continue tocando caso haja bloqueio do navegador
    if (playerTv && playerTv.getPlayerState && playerTv.getPlayerState() !== YT.PlayerState.PLAYING) {
        playerTv.playVideo();
    }
}

// Chamado automaticamente pela API do YouTube quando ela carrega na página
function onYouTubeIframeAPIReady() {
    // Pronto para uso
}

window.addEventListener('DOMContentLoaded', () => {
    renderizarPainel();
});
