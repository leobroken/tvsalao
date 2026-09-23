const configPadrao = {
    horizontal: "jfKfPfyJRdk",
    vertical: "jfKfPfyJRdk"
};

function carregarConfig() {
    const salvo = localStorage.getItem('tv_salao_config');
    if (salvo) {
        return JSON.parse(salvo);
    }
    return configPadrao;
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
        
        const config = carregarConfig();
        document.getElementById('input-horizontal').value = config.horizontal;
        document.getElementById('input-vertical').value = config.vertical;
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

function iniciarPlayers() {
    const config = carregarConfig();

    const containerH = document.getElementById('player-horizontal-container');
    containerH.innerHTML = `
        <iframe class="w-full h-full pointer-events-none" 
            src="https://www.youtube.com/embed/${config.horizontal}?autoplay=1&mute=1&loop=1&playlist=${config.horizontal}&controls=0&disablekb=1&modestbranding=1" 
            title="TV ao Vivo" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    const containerV = document.getElementById('player-vertical-container');
    containerV.innerHTML = `
        <iframe class="w-full h-full pointer-events-none" 
            src="https://www.youtube.com/embed/${config.vertical}?autoplay=1&mute=1&loop=1&playlist=${config.vertical}&controls=0&disablekb=1&modestbranding=1" 
            title="Propagandas" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

window.addEventListener('DOMContentLoaded', () => {
    const config = carregarConfig();
    document.getElementById('input-horizontal').value = config.horizontal;
    document.getElementById('input-vertical').value = config.vertical;
});
