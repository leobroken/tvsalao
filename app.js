// Valores padrão iniciais caso não tenha nada salvo
const configPadrao = {
    horizontal: "jfKfPfyJRdk", // Exemplo de vídeo horizontal
    vertical: "jfKfPfyJRdk"     // Exemplo de vídeo vertical
};

// Carrega configurações salvas ou padrão
function carregarConfig() {
    const salvo = localStorage.getItem('tv_salao_config');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return configPadrao;
}

// Alterna entre o Painel de Controle e a Tela da TV
function mudarAba(aba) {
    const viewPainel = document.getElementById('view-painel');
    const viewTv = document.getElementById('view-tv');
    const btnPainel = document.getElementById('btn-painel');
    const btnTv = document.getElementById('btn-tv');

    if (aba === 'tv') {
        viewPainel.classList.add('hidden');
        viewTv.classList.remove('hidden');
        btnPainel.className = "px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition";
        btnTv.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition";
        
        // Inicia os players ao abrir a tela da TV
        iniciarPlayers();
    } else {
        viewTv.classList.add('hidden');
        viewPainel.classList.remove('hidden');
        btnTv.className = "px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition";
        btnPainel.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition";
        
        // Preenche os inputs com os valores atuais
        const config = carregarConfig();
        document.getElementById('input-horizontal').value = config.horizontal;
        document.getElementById('input-vertical').value = config.vertical;
    }
}

// Extrai o ID do YouTube caso o usuário cole a URL completa
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
    return id; // Retorna o próprio texto se já for o ID
}

// Salva as configurações no navegador
function salvarConfiguracoes() {
    const rawH = document.getElementById('input-horizontal').value;
    const rawV = document.getElementById('input-vertical').value;

    const config = {
        horizontal: extrairIdYoutube(rawH),
        vertical: extrairIdYoutube(rawV)
    };

    localStorage.setItem('tv_salao_config', JSON.stringify(config));
    alert('Configurações salvas com sucesso!');
}

// Renderiza os iframes do YouTube na tela da TV
function iniciarPlayers() {
    const config = carregarConfig();

    // Container Horizontal (autoplay=1, mute=0 ou 1 se preferir som - na TV é bom considerar som ou mudo)
    const containerH = document.getElementById('player-horizontal-container');
    containerH.innerHTML = `
        <iframe class="w-full h-full" 
            src="https://www.youtube.com/embed/${config.horizontal}?autoplay=1&mute=1&loop=1&playlist=${config.horizontal}" 
            title="TV ao Vivo" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    // Container Vertical (Propagandas / Shorts)
    const containerV = document.getElementById('player-vertical-container');
    containerV.innerHTML = `
        <iframe class="w-full h-full" 
            src="https://www.youtube.com/embed/${config.vertical}?autoplay=1&mute=1&loop=1&playlist=${config.vertical}" 
            title="Propagandas" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

// Inicializa os inputs ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const config = carregarConfig();
    document.getElementById('input-horizontal').value = config.horizontal;
    document.getElementById('input-vertical').value = config.vertical;
});

