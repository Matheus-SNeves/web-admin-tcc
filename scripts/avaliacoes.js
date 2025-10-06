const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/avaliacoes';
const contentContainer = document.getElementById('avaliacoes-content');

const getToken = () => localStorage.getItem('authToken');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
    } else {
        fetchRecords();
    }
});

// Listener de Logout (seguro com encadeamento opcional)
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

// Função para buscar os registros na API
async function fetchRecords() {
    try {
        const response = await fetch(BASE_URL + endpoint, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const records = await response.json();
            renderTable(records);
        } else if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
        } else {
            // Exibe o status de erro para facilitar o debug (ex: 404, 500, 403)
            const errorMessage = `Erro ao carregar avaliacoes. Status: ${response.status} (${response.statusText})`;
            
            // Tenta logar a mensagem completa e o corpo da resposta (se houver) no console
            console.error(errorMessage, await response.json().catch(() => ({ message: 'Sem corpo de erro' })));
            
            contentContainer.innerHTML = `<p>${errorMessage}</p>`;
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar avaliacoes.</p>';
        console.error("Erro de rede:", error);
    }
}

// Função para renderizar a tabela com os dados das avaliações
function renderTable(records) {
    if (!contentContainer) return; // Checagem de segurança

    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhuma avaliação cadastrada.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuário ID</th>
                    <th>Produto ID</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        // CORREÇÃO: Mapeamento correto dos campos da avaliação
        const id = record?.id ?? '';
        const id_usuario = record?.id_usuario ?? ''; 
        const id_produto = record?.id_produto ?? '';
        const nota = record?.nota ?? '';
        const comentario = record?.comentario ?? '';

        tableHTML += `
            <tr data-id="${id}">
                <td data-label="ID:">${id}</td>
                <td data-label="Usuário ID:">${id_usuario}</td>
                <td data-label="Produto ID:">${id_produto}</td>
                <td data-label="Nota:">${nota}</td>
                <td data-label="Comentário:">${comentario}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}
