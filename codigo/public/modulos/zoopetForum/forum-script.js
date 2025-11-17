// ==================== VARIÁVEIS GLOBAIS ====================
let allTopics = [];
let currentTopic = null;

// ==================== CARREGAR TÓPICOS ====================
function loadTopics() {
    const saved = localStorage.getItem('zoopet_forum_topics');
    if (saved) {
        allTopics = JSON.parse(saved);
    }
    renderTopics(allTopics);
    updateForumStats();
}

// ==================== SALVAR TÓPICOS ====================
function saveTopics() {
    localStorage.setItem('zoopet_forum_topics', JSON.stringify(allTopics));
}

// ==================== RENDERIZAR TÓPICOS ====================
function renderTopics(topics) {
    const container = document.getElementById('forumTopics');
    
    if (topics.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span style="font-size: 48px;">💬</span>
                <p>Nenhum tópico publicado ainda.</p>
                <p style="color: #999;">Seja o primeiro a compartilhar!</p>
            </div>
        `;
        return;
    }

    const tipoLabels = {
        avistamento: '🔍 Avistamento',
        denuncia: '⚠️ Denúncia',
        ajuda: '🆘 Pedido de Ajuda',
        dica: '💡 Dica/Orientação'
    };

    container.innerHTML = topics.map(topic => {
        const preview = topic.mensagem.length > 150 
            ? topic.mensagem.substring(0, 150) + '...' 
            : topic.mensagem;

        const replyCount = topic.respostas ? topic.respostas.length : 0;
        const dataFormatada = new Date(topic.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="topic-card" onclick="showTopicDetail(${topic.id})">
                <div class="topic-type ${topic.tipo}">${tipoLabels[topic.tipo] || topic.tipo}</div>
                <h3>${topic.titulo}</h3>
                <div class="topic-preview">${preview}</div>
                <div class="topic-meta">
                    <span class="topic-author">👤 ${topic.autor}</span>
                    <span class="topic-date">📅 ${dataFormatada}</span>
                    <span class="topic-location">📍 ${topic.localizacao.bairro}, ${topic.localizacao.cidade}/${topic.localizacao.estado}</span>
                    <span class="reply-count">💬 ${replyCount} respostas</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ATUALIZAR ESTATÍSTICAS ====================
function updateForumStats() {
    document.getElementById('totalTopics').textContent = allTopics.length;
    
    const totalReplies = allTopics.reduce((sum, topic) => {
        return sum + (topic.respostas ? topic.respostas.length : 0);
    }, 0);
    
    document.getElementById('totalReplies').textContent = totalReplies;
}

// ==================== MOSTRAR DETALHES DO TÓPICO ====================
function showTopicDetail(topicId) {
    currentTopic = allTopics.find(t => t.id === topicId);
    if (!currentTopic) return;

    const tipoLabels = {
        avistamento: '🔍 Avistamento',
        denuncia: '⚠️ Denúncia',
        ajuda: '🆘 Pedido de Ajuda',
        dica: '💡 Dica/Orientação'
    };

    const dataFormatada = new Date(currentTopic.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('modalTopicTitle').textContent = 
        `${tipoLabels[currentTopic.tipo]} - ${currentTopic.titulo}`;
    document.getElementById('modalAutor').textContent = `👤 ${currentTopic.autor}`;
    document.getElementById('modalData').textContent = `📅 ${dataFormatada}`;
    document.getElementById('modalLocation').textContent = 
        `📍 ${currentTopic.localizacao.bairro}, ${currentTopic.localizacao.cidade}/${currentTopic.localizacao.estado}`;
    document.getElementById('modalMensagem').textContent = currentTopic.mensagem;

    // Renderizar respostas
    const repliesList = document.getElementById('repliesList');
    const replyCount = document.getElementById('replyCount');
    
    replyCount.textContent = currentTopic.respostas ? currentTopic.respostas.length : 0;
    repliesList.innerHTML = '';

    if (currentTopic.respostas && currentTopic.respostas.length > 0) {
        currentTopic.respostas.forEach(reply => {
            const dataReply = new Date(reply.data).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const replyDiv = document.createElement('div');
            replyDiv.className = 'reply-item';
            replyDiv.innerHTML = `
                <div class="reply-author">👤 ${reply.autor}</div>
                <div class="reply-text">${reply.mensagem}</div>
                <div class="reply-date">📅 ${dataReply}</div>
            `;
            repliesList.appendChild(replyDiv);
        });
    } else {
        repliesList.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Nenhuma resposta ainda. Seja o primeiro a responder!</div>';
    }

    // Limpar campos de resposta
    document.getElementById('replyAutor').value = '';
    document.getElementById('replyMensagem').value = '';

    // Mostrar modal
    document.getElementById('topicModal').classList.add('active');
}

// ==================== FECHAR MODAL ====================
function closeTopicModal() {
    document.getElementById('topicModal').classList.remove('active');
    currentTopic = null;
}

// ==================== ADICIONAR RESPOSTA ====================
function addReply() {
    if (!currentTopic) return;

    const autor = document.getElementById('replyAutor').value.trim();
    const mensagem = document.getElementById('replyMensagem').value.trim();

    if (!autor || !mensagem) {
        alert('❌ Por favor, preencha seu nome e mensagem.');
        return;
    }

    const novaResposta = {
        id: Date.now(),
        autor: autor,
        mensagem: mensagem,
        data: new Date().toISOString()
    };

    if (!currentTopic.respostas) {
        currentTopic.respostas = [];
    }
    
    currentTopic.respostas.push(novaResposta);
    
    // Atualizar no array principal
    const index = allTopics.findIndex(t => t.id === currentTopic.id);
    if (index !== -1) {
        allTopics[index] = currentTopic;
    }
    
    saveTopics();
    updateForumStats();
    
    alert('✅ Resposta enviada com sucesso!');
    
    // Recarregar view do tópico
    showTopicDetail(currentTopic.id);
}

// ==================== TOGGLE FORMULÁRIO ====================
function toggleNewTopicForm() {
    const form = document.getElementById('novoTopicoForm');
    const btn = document.getElementById('btnToggleForm');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.textContent = '❌ Cancelar';
    } else {
        form.style.display = 'none';
        btn.textContent = '➕ Criar Novo Tópico';
        resetForm();
    }
}

// ==================== CRIAR NOVO TÓPICO ====================
function createTopic(event) {
    event.preventDefault();

    const data = {
        id: Date.now(),
        autor: document.getElementById('autorForum').value.trim(),
        tipo: document.getElementById('tipoTopico').value,
        titulo: document.getElementById('tituloForum').value.trim(),
        mensagem: document.getElementById('mensagemForum').value.trim(),
        localizacao: {
            bairro: document.getElementById('bairroForum').value.trim(),
            cidade: document.getElementById('cidadeForum').value.trim(),
            estado: document.getElementById('estadoForum').value
        },
        data: new Date().toISOString(),
        respostas: [],
        status: 'ativo'
    };

    allTopics.unshift(data); // Adicionar no início
    saveTopics();
    renderTopics(allTopics);
    updateForumStats();

    alert('✅ Tópico publicado com sucesso!');
    
    toggleNewTopicForm();
    resetForm();
}

// ==================== RESET FORMULÁRIO ====================
function resetForm() {
    document.getElementById('forumForm').reset();
}

// ==================== APLICAR FILTROS ====================
function applyFilters() {
    const tipoFilter = document.getElementById('tipoFilter').value;

    const filtered = tipoFilter 
        ? allTopics.filter(topic => topic.tipo === tipoFilter)
        : allTopics;

    renderTopics(filtered);
}

// ==================== LIMPAR FILTROS ====================
function clearFilters() {
    document.getElementById('tipoFilter').value = '';
    renderTopics(allTopics);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ZooPet - Fórum Comunitário iniciado');
    
    // Carregar tópicos
    loadTopics();
    
    // Botões
    document.getElementById('btnToggleForm').addEventListener('click', toggleNewTopicForm);
    document.getElementById('btnCancelForm').addEventListener('click', toggleNewTopicForm);
    document.getElementById('btnCloseModal').addEventListener('click', closeTopicModal);
    document.getElementById('btnAddReply').addEventListener('click', addReply);
    document.getElementById('btnClearFilter').addEventListener('click', clearFilters);
    
    // Formulário
    document.getElementById('forumForm').addEventListener('submit', createTopic);
    
    // Filtros
    document.getElementById('tipoFilter').addEventListener('change', applyFilters);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('topicModal');
        if (event.target === modal) {
            closeTopicModal();
        }
    });
});

// Tornar funções globais para uso no HTML
window.showTopicDetail = showTopicDetail;// JS completo omitido aqui