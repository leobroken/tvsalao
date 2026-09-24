import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBoZ-MT_xyvnuV_-JEA9BP@vqpv-AgMJ3o",
    authDomain: "tv-salao-359c2.firebaseapp.com",
    projectId: "tv-salao-359c2",
    storageBucket: "tv-salao-359c2.firebasestorage.app",
    messagingSenderId: "675609854274",
    appId: "1:675609854274:web:c81a874cc6399ddb0848db"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "configuracoes", "tv_salao");

let dadosGlobais = {
    canais: [{ id: "jfKfPfyJRdk", nome: "Canal Padrão (Exemplo)" }],
    bibliotecaProps: [{ id: "jfKfPfyJRdk", nome: "Propaganda Padrão", comSom: false }],
    sequenciaProps: [{ id: "jfKfPfyJRdk", nome: "Propaganda Padrão", comSom: false }],
    ativoHorizontal: "jfKfPfyJRdk"
};

let playerTv = null;
let playerProp = null;
let indicePropAtual = 0;
let timerVerificacao = null;

// Ouve as alterações do Firebase em tempo real (Sincroniza celular e TV na hora)
onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
        dadosGlobais = docSnap.data();
        renderizarPainel();
    } else {
        salvarNoFirebase(dadosGlobais);
    }
});

async function salvarNoFirebase(dados) {
    try {
        await setDoc(docRef, dados);
    } catch (e) {
        console.error("Erro ao salvar no Firestore: ", e);
    }
}

// Expõe as funções globalmente para funcionarem nos botões HTML (onclick)
window.mudarAba = function(aba) {
    const viewPainel = document.getElementById('view-painel');
    const viewTv = document.getElementById('view-tv');
    const modalSom = document.getElementById('modal-ativar-som');

    if (aba === 'tv') {
        viewPainel.classList.add('hidden');
        viewTv.classList.remove('hidden');
        if (modalSom) modalSom.classList.remove('hidden');
    } else {
        viewTv.classList.add('hidden');
        viewPainel.classList.remove('hidden');
        if (timerVerificacao) clearInterval(timerVerificacao);
        if (playerTv && typeof playerTv.destroy === 'function') playerTv.destroy();
        if (playerProp && typeof playerProp.destroy === 'function') playerProp.destroy();
        renderizarPainel();
    }
};

window.iniciarTransmissaoComSom = function() {
    const modalSom = document.getElementById('modal-ativar-som');
    if (modalSom) modalSom.classList.add('hidden');

    // Ativa o Modo Tela Cheia Real (Oculta relógio, barra de status e botões de navegação)
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari/iOS */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    } catch (e) {
        console.log("Tela cheia não suportada ou bloqueada.", e);
    }

    iniciarPlayersAPI();
};

function extrairIdYoutube(urlOuId) {
    if (!urlOuId) return '';
    let id = urlOuId.trim();
    
    // Suporte a links de Shorts do YouTube (ex: youtube.com/shorts/ID)
    if (id.includes('/shorts/')) {
        const partes = id.split('/shorts/');
        if (partes[1]) {
            return partes[1].split('?')[0].split('/')[0];
        }
    }

    // Suporte a links de live do tipo youtube.com/live/ID_DO_VIDEO
    if (id.includes('/live/')) {
        const partes = id.split('/live/');
        if (partes[1]) {
            return partes[1].split('?')[0].split('/')[0];
        }
    }
    
    if (id.includes('youtube.com') || id.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = id.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
    }
    return id;
}

// Funções de manipulação vinculadas ao window para salvar no Firebase
window.adicionarCanal = function() {
    const nome = document.getElementById('input-nome-canal').value.trim();
    const link = document.getElementById('input-link-canal').value.trim();

    if (!nome || !link) {
        alert('Preencha o nome e o link do canal.');
        return;
    }

    dadosGlobais.canais.push({ id: extrairIdYoutube(link), nome: nome });
    salvarNoFirebase(dadosGlobais);

    document.getElementById('input-nome-canal').value = '';
    document.getElementById('input-link-canal').value = '';
};

window.removerCanal = function(index) {
    dadosGlobais.canais.splice(index, 1);
    salvarNoFirebase(dadosGlobais);
};

window.selecionarCanalAtivo = function(id) {
    dadosGlobais.ativoHorizontal = id;
    salvarNoFirebase(dadosGlobais);
    alert('Canal definido na TV!');
};

window.adicionarPropaganda = function() {
    const nome = document.getElementById('input-nome-prop').value.trim();
    const link = document.getElementById('input-link-prop').value.trim();
    const comSom = document.getElementById('input-com-som-prop').checked;

    if (!nome || !link) {
        alert('Preencha o nome e o link da propaganda.');
        return;
    }

    dadosGlobais.bibliotecaProps.push({ id: extrairIdYoutube(link), nome: nome, comSom: comSom });
    salvarNoFirebase(dadosGlobais);

    document.getElementById('input-nome-prop').value = '';
    document.getElementById('input-link-prop').value = '';
    document.getElementById('input-com-som-prop').checked = false;
};

window.removerPropagandaBiblioteca = function(index) {
    dadosGlobais.bibliotecaProps.splice(index, 1);
    salvarNoFirebase(dadosGlobais);
};

window.adicionarNaSequencia = function(id, nome, comSom) {
    dadosGlobais.sequenciaProps.push({ id: id, nome: nome, comSom: comSom });
    salvarNoFirebase(dadosGlobais);
};

window.removerDaSequencia = function(index) {
    dadosGlobais.sequenciaProps.splice(index, 1);
    salvarNoFirebase(dadosGlobais);
};

window.salvarSequencia = function() {
    if (dadosGlobais.sequenciaProps.length === 0) {
        alert('A sequência está vazia!');
        return;
    }
    salvarNoFirebase(dadosGlobais);
    alert('Sequência salva no Firebase com sucesso!');
};

function renderizarPainel() {
    // Canais
    const containerCanais = document.getElementById('lista-canais');
    if (containerCanais) {
        containerCanais.innerHTML = dadosGlobais.canais.length === 0 ? '<p class="text-xs text-gray-500 italic">Nenhum canal.</p>' : '';
        dadosGlobais.canais.forEach((canal, index) => {
            const ativo = dadosGlobais.ativoHorizontal === canal.id;
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
    }

    // Biblioteca de Propagandas
    const containerBib = document.getElementById('lista-biblioteca-props');
    if (containerBib) {
        containerBib.innerHTML = dadosGlobais.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Nenhuma propaganda.</p>' : '';
        dadosGlobais.bibliotecaProps.forEach((prop, index) => {
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
    }

    // Seletor Sequência
    const containerSeletor = document.getElementById('seletor-adicionar-sequencia');
    if (containerSeletor) {
        containerSeletor.innerHTML = dadosGlobais.bibliotecaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Cadastre propagandas acima.</p>' : '';
        dadosGlobais.bibliotecaProps.forEach((prop) => {
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
    }

    // Sequência Atual
    const containerSeq = document.getElementById('lista-sequencia-atual');
    if (containerSeq) {
        containerSeq.innerHTML = dadosGlobais.sequenciaProps.length === 0 ? '<p class="text-xs text-gray-500 italic">Sequência vazia.</p>' : '';
        dadosGlobais.sequenciaProps.forEach((prop, index) => {
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
}

// Inicialização dos Players via API do YouTube com suporte a Shorts
function iniciarPlayersAPI() {
    if (playerTv) playerTv.destroy();
    if (playerProp) playerProp.destroy();

    const containerTv = document.getElementById('player-horizontal-container');
    if (containerTv) containerTv.innerHTML = '<div id="yt-player-tv"></div>';

    const containerProp = document.getElementById('player-vertical-container');
    if (containerProp) containerProp.innerHTML = '<div id="yt-player-prop"></div>';

    // 1. Player TV ao Vivo (Horizontal)
    playerTv = new YT.Player('yt-player-tv', {
        height: '100%',
        width: '100%',
        videoId: dadosGlobais.ativoHorizontal,
        playerVars: {
            'autoplay': 1,
            'mute': 0,
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'loop': 1,
            'playlist': dadosGlobais.ativoHorizontal
        },
        events: {
            'onReady': (event) => {
                event.target.unMute();
                event.target.playVideo();
            }
        }
    });

    // 2. Player Propagandas (Vertical)
    if (dadosGlobais.sequenciaProps.length > 0) {
        const idsPlaylist = dadosGlobais.sequenciaProps.map(p => p.id);
        indicePropAtual = 0;

        playerProp = new YT.Player('yt-player-prop', {
            height: '100%',
            width: '100%',
            videoId: idsPlaylist[0],
            playerVars: {
                'autoplay': 1,
                'mute': 1,
                'controls': 0,
                'disablekb': 1,
                'modestbranding': 1,
                'playsinline': 1
            },
            events: {
                'onReady': (event) => {
                    event.target.playVideo();
                    aplicarRegraDeSomAtual();
                },
                'onStateChange': (event) => {
                    if (event.data === YT.PlayerState.ENDED) {
                        indicePropAtual = (indicePropAtual + 1) % idsPlaylist.length;
                        playerProp.loadVideoById(idsPlaylist[indicePropAtual]);
                        aplicarRegraDeSomAtual();
                    }
                }
            }
        });
    }

    if (timerVerificacao) clearInterval(timerVerificacao);
    timerVerificacao = setInterval(() => {
        if (playerTv && playerTv.getPlayerState && playerTv.getPlayerState() !== YT.PlayerState.PLAYING) {
            playerTv.playVideo();
        }
    }, 1000);
}

function aplicarRegraDeSomAtual() {
    if (!dadosGlobais.sequenciaProps || dadosGlobais.sequenciaProps.length === 0) return;

    const propAtual = dadosGlobais.sequenciaProps[indicePropAtual];
    const indicador = document.getElementById('status-audio-tv');

    if (propAtual && propAtual.comSom) {
        if (playerTv && typeof playerTv.mute === 'function') playerTv.mute();
        if (playerProp && typeof playerProp.unMute === 'function') playerProp.unMute();
        if (indicador) {
            indicador.innerText = `🎬 Propaganda com Som: ${propAtual.nome}`;
            indicador.classList.remove('hidden');
        }
    } else {
        if (playerTv && typeof playerTv.unMute === 'function') playerTv.unMute();
        if (playerProp && typeof playerProp.mute === 'function') playerProp.mute();
        if (indicador) {
            indicador.classList.add('hidden');
        }
    }
}
