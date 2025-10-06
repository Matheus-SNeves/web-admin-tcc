document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    // URL CORRIGIDA
    const API_URL = 'https://tcc-senai-tawny.vercel.app'; 

    // 1. Verificação de Acesso (Segurança)
    if (!token || !user || user.role !== 'ADMIN') {
        alert('Acesso negado. Faça login como administrador.');
        window.location.href = '../pages/login.html';
        return;
    }

    const currentPage = 'clientes';
    document.querySelector(`.nav-item[data-page=${currentPage}]`)?.classList.add('active'); 

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../pages/login.html';
        });
    }

    // Função de Fetch Genérica com Autorização e Tratamento de Erro
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

            // Para DELETE e PUT que retornam status 204 (No Content) ou 202 (Accepted)
            if (options.method === 'DELETE' || options.method === 'PUT') {
                 if (response.ok || response.status === 202 || response.status === 204) {
                    return { success: true, status: response.status };
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha na operação.');
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro em ${endpoint}:`, error);
            alert(`Erro: ${error.message}`);
            return null;
        }
    };

    const renderClientes = async () => {
        const tabelaBody = document.getElementById('clientes-lista');
        if (!tabelaBody) return;
        
        tabelaBody.innerHTML = '<tr><td colspan="6">Carregando clientes...</td></tr>';
        // Buscamos todos os usuários e filtramos na UI (melhor buscar apenas clientes se o backend permitir)
        const todosUsuarios = await fetchData('usuarios'); 
        
        if (todosUsuarios) {
            // Filtra os usuários que são clientes (role === 'CLIENTE')
            const clientes = todosUsuarios.filter(u => u.role === 'CLIENTE');

            if (clientes.length === 0) {
                tabelaBody.innerHTML = '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>';
                return;
            }

            tabelaBody.innerHTML = clientes.map(c => {
                // Certifica-se de que o id é passado como atributo para a função alterar
                return `
                <tr data-cliente-id="${c.id}">
                    <td data-label="Id:">${c.id}</td>
                    <td data-label="Nome:" contenteditable="true" data-field="nome">${c.nome}</td>
                    <td data-label="Email:" contenteditable="true" data-field="email">${c.email}</td>
                    <td data-label="CPF:" contenteditable="true" data-field="cpf">${c.cpf || 'N/A'}</td>
                    <td data-label="Telefone:" contenteditable="true" data-field="telefone">${c.telefone || 'N/A'}</td>
                    <td data-label="Ações">
                        <button onclick="alterar(this)" class="action-btn">Alterar</button>
                        <button onclick="excluir(${c.id})" class="action-btn action-btn-danger">Excluir</button>
                    </td>
                </tr>
                `;
            }).join('');
        } else {
            tabelaBody.innerHTML = '<tr><td colspan="6">Erro ao carregar clientes.</td></tr>';
        }
    };

    // --- FUNÇÕES GLOBAIS PARA CRUD ---

    window.alterar = async (buttonElement) => {
        const linha = buttonElement.closest('tr');
        const id = linha.getAttribute('data-cliente-id');
        
        const nome = linha.querySelector('[data-field="nome"]').textContent;
        const email = linha.querySelector('[data-field="email"]').textContent;
        const cpf = linha.querySelector('[data-field="cpf"]').textContent;
        const telefone = linha.querySelector('[data-field="telefone"]').textContent;

        const corpo = { nome, email, cpf, telefone };

        const resultado = await fetchData(`usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(corpo),
        });

        if (resultado?.success) {
            alert('Cliente alterado com sucesso!');
        }
        // De qualquer forma, recarrega para refletir a mudança ou erro
        renderClientes();
    };

    window.excluir = async (id) => {
        if (!confirm(`Tem certeza que deseja excluir o cliente com ID: ${id}?`)) {
            return;
        }

        const resultado = await fetchData(`usuarios/${id}`, {
            method: 'DELETE',
        });

        if (resultado?.success) {
            alert('Cliente excluído com sucesso!');
        }
        // De qualquer forma, recarrega para refletir a mudança ou erro
        renderClientes();
    };

    // --- INICIALIZAÇÃO ---
    renderClientes();
});