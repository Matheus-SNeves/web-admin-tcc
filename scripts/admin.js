// admin.js (Versão Revisada/Simplificada)

const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const getToken = () => localStorage.getItem('authToken');

// 1. Checagem de autenticação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        // Redireciona se não houver token
        window.location.href = 'login.html';
    } else {
        // Se houver token, tenta buscar dados do dashboard
        fetchDashboardData();
    }
});

// 2. Função para buscar dados do dashboard (Exemplo: apenas contando pedidos)
async function fetchDashboardData() {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        };

        // EX: Busca de Pedidos para contagem (a rota /pedidos precisa retornar todos para o admin)
        const pedidosResponse = await fetch(`${BASE_URL}/pedidos`, { headers });
        
        if (pedidosResponse.ok) {
            const pedidos = await pedidosResponse.json();
            document.getElementById('total-pedidos').textContent = pedidos.length;
        }

        // TODO: Implementar chamadas para Clientes e Faturamento do mês.

    } catch (error) {
        console.error('Erro ao buscar dados do Dashboard. A API pode estar offline ou o token expirou.', error);
        // O logout.js garante a função do botão, mas o redirecionamento em caso de 401 deve ser tratado em cada requisição.
    }
}