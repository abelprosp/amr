function openTab(tabId) {
    // 1. Esconder todos os conteúdos de aba
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // 2. Remover a classe 'active' de todos os botões
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Mostrar o conteúdo selecionado
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    // 4. Ativar o botão clicado
    // Precisamos encontrar qual botão chamou essa função. 
    // Uma forma simples é procurar o botão que tem o onclick correspondente ou passar 'this' no HTML.
    // Mas como já temos o ID, vamos iterar para achar o botão certo para manter simples sem mudar o HTML.
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}

// Inicializar (opcional, caso o HTML já não tenha o active setado corretamente)
document.addEventListener('DOMContentLoaded', () => {
    // Garante que a primeira aba esteja ativa se nenhuma estiver
    if (!document.querySelector('.tab-content.active')) {
        openTab('dashboard');
    }
});