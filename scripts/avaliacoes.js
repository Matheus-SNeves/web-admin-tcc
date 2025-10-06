document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    // URL CORRIGIDA
    const API_URL = 'https://tcc-senai-tawny.vercel.app'; 

    if (!token || !user || user.role !== 'ADMIN') {
        alert('Acesso negado. Faça login como administrador.');
        window.location.href = '../pages/login.html';
        return;
    }

    const currentPage = 'avaliacoes';
    document.querySelector(`.nav-item[data-page=${currentPage}]`)?.classList.add('active');

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../pages/login.html';
        });
    }

    const fetchData = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                ...options,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers 
                }
            });

            if (response.status === 401 || response.status === 403) {
                alert('Sessão expirada ou acesso negado. Faça login novamente.');
                localStorage.clear();
                window.location.href = '../pages/login.html';
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao buscar dados.');
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro em ${endpoint}:`, error);
            alert(`Erro: ${error.message}`);
            return null;
        }
    };

    const renderAvaliacoes = async () => {
        const tabelaBody = document.getElementById('avaliacoes-lista');
        if (!tabelaBody) return;

        tabelaBody.innerHTML = '<tr><td colspan="6">Carregando avaliações...</td></tr>';
        const avaliacoes = await fetchData('avaliacoes');
        
        if (avaliacoes && avaliacoes.length > 0) {
            tabelaBody.innerHTML = avaliacoes.map(a => {
                // Assume que as relações 'usuario' e 'produto' são carregadas pelo backend
                const dataFormatada = new Date(a.createdAt).toLocaleDateString('pt-BR');
                const nomeCliente = a.usuario?.nome || 'N/A';
                const nomeProduto = a.produto?.nome || 'N/A';

                return `
                <tr>
                    <td data-label="ID:">${a.id}</td>
                    <td data-label="Cliente:">${nomeCliente}</td>
                    <td data-label="Produto:">${nomeProduto}</td>
                    <td data-label="Nota:">${a.nota}</td>
                    <td data-label="Comentário:">${a.comentario}</td>
                    <td data-label="Data:">${dataFormatada}</td>
                </tr>
                `;
            }).join('');
        } else {
            tabelaBody.innerHTML = '<tr><td colspan="6">Nenhuma avaliação encontrada.</td></tr>';
        }
    };

    renderAvaliacoes();
});