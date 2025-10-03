const BASE_URL = 'https://tcc-senai-tawny.vercel.app';
const endpoint = '/usuarios';
const cadastroForm = document.getElementById('cadastro');
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

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

cadastroForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const corpo = {
        nome: cadastroForm.nome.value,
        cpf: cadastroForm.cpf.value,
        telefone: cadastroForm.telefone.value,
        email: cadastroForm.email.value,
        senha: cadastroForm.senha.value,
        role: cadastroForm.role.value
    };

    try {
        const response = await fetch(BASE_URL + endpoint, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 201) {
            alert('Usuário cadastrado com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar usuário: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao cadastrar usuário.');
    }
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
            contentContainer.innerHTML = '<p>Erro ao carregar usuários.</p>';
        }
    } catch (error) {
        contentContainer.innerHTML = '<p>Erro de rede ao carregar usuários.</p>';
    }
}

function renderTable(records) {
    if (!contentContainer) return;
    
    if (records.length === 0) {
        contentContainer.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    records.forEach(record => {
        tableHTML += `
            <tr data-id="${record.id}">
                <td data-label="ID:">${record.id}</td>
                <td data-label="Nome:" contenteditable="true">${record.nome}</td>
                <td data-label="CPF:" contenteditable="true">${record.cpf}</td>
                <td data-label="Telefone:" contenteditable="true">${record.telefone}</td>
                <td data-label="Email:" contenteditable="true">${record.email}</td>
                <td data-label="Role:" contenteditable="true">${record.role}</td>
                <td>
                    <button onclick="alterar(${record.id}, this)">Alterar</button>
                    <button onclick="excluir(${record.id})">Excluir</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    contentContainer.innerHTML = tableHTML;
}

window.alterar = async (id, button) => {
    const row = button.closest('tr');
    const corpo = {
        nome: row.cells[1].textContent,
        cpf: row.cells[2].textContent,
        telefone: row.cells[3].textContent,
        email: row.cells[4].textContent,
        role: row.cells[5].textContent,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(corpo)
        });

        if (response.status === 202) {
            alert('Usuário alterado com sucesso');
            // Opcional: window.location.reload(); para garantir atualização completa
        } else {
            const errorData = await response.json();
            alert(`Erro ao alterar usuário: ${errorData.message}`);
        }
    } catch (error) {
        alert('Erro de rede ao alterar usuário.');
    }
}

window.excluir = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ID: ${id}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 204) {
            alert('Usuário excluído com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir usuário: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Erro de rede ao excluir usuário.');
    }
}