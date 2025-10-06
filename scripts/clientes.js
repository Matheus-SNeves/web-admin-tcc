const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/usuarios';
// Aplica o encadeamento opcional logo na declaração para maior segurança
const contentContainer = document.getElementById('clientes-content'); 

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

// Este listener já está correto e seguro com o '?'
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});
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
            // CÓDIGO ALTERADO AQUI PARA MOSTRAR O STATUS
            const errorMessage = `Erro ao carregar clientes. Status: ${response.status} (${response.statusText})`;
            
            // Tenta logar a mensagem completa e o corpo da resposta (se houver)
            console.error(errorMessage, await response.json().catch(() => ({ message: 'Sem corpo de erro' })));
            
            contentContainer.innerHTML = `<p>${errorMessage}</p>`;
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar clientes.</p>';
        console.error("Erro de rede:", error);
    }
}

function renderTable(records) {
    if (!contentContainer) return;

    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
        return;
    }
    // Monta tabela com cabeçalho consistente
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Empresa ID</th>
                    <th>Cargo ID</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        const id = record?.id ?? '';
        const nome = record?.nome ?? '';
        const cpf = record?.cpf ?? '';
        const telefone = record?.telefone ?? '';
        const email = record?.email ?? '';
        const idEmpresa = record?.id_empresa ?? '';
        const idTipoEmprego = record?.id_tipo_emprego ?? '';

        tableHTML += `
            <tr data-id="${id}">
                <td data-label="ID:">${id}</td>
                <td data-label="Nome:" >${nome}</td>
                <td data-label="CPF:" >${cpf}</td>
                <td data-label="Telefone:" >${telefone}</td>
                <td data-label="Email:" >${email}</td>
                <td data-label="Empresa ID:" >${idEmpresa}</td>
                <td data-label="Cargo ID:" >${idTipoEmprego}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}