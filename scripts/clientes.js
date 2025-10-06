document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://tcc-senai-tawny.vercel.app'; 
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Redirecionamento de segurança
    // if (!token || !user) {
    //     window.location.href = 'login.html';
    //     return;
    // }
    
    // --- Elementos da UI ---
    const addressModal = document.getElementById('address-modal');
    const addAddressBtn = document.getElementById('add-new-address-btn');
    const closeAddressModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');
    const addressListDiv = document.getElementById('address-list');
    const modalTitle = document.getElementById('modal-title');
    const addressIdInput = document.getElementById('address-id');
    const editDataBtn = document.getElementById('edit-data-btn');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone'); 
    const cpfInput = document.getElementById('cpf');     
    const zipcode_input = document.getElementById('zipcode');
    const logoutButton = document.querySelector('.action-btn-danger');

    let isEditingData = false;

    // --- Funções de Acesso à API ---

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
                alert('Sessão expirada. Faça login novamente.');
                localStorage.clear();
                window.location.href = 'login.html';
                return null;
            }

            if (options.method === 'DELETE' || options.method === 'PUT') {
                 if (response.ok || response.status === 202 || response.status === 204) {
                    return { success: true, status: response.status };
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha na operação.');
            }
            // Retorna vazio para POST/PUT/DELETE que podem não ter corpo
            return response.status !== 204 ? await response.json() : { success: true, status: response.status };
        } catch (error) {
            console.error(`Erro em ${endpoint}:`, error);
            alert(`Erro: ${error.message}`);
            return null;
        }
    };

    // --- Funções de Dados do Usuário ---

    const fetchUserData = async () => {
        const userData = await fetchData(`usuarios/${user.id}`);
        if (userData) {
            nameInput.value = userData.nome || '';
            emailInput.value = userData.email || '';
            cpfInput.value = userData.cpf || '';
            phoneInput.value = userData.telefone || '';
            // Salva dados atualizados no localStorage
            localStorage.setItem('user', JSON.stringify({ ...user, ...userData })); 
        } else {
            alert('Não foi possível carregar os dados do usuário.');
        }
    };

    const toggleEditData = async () => {
        if (isEditingData) {
            // Tenta salvar as alterações
            const success = await editUserData();
            if (!success) {
                // Se o salvamento falhar, não desativa a edição
                return; 
            }
        }
        isEditingData = !isEditingData;
        nameInput.disabled = !isEditingData;
        emailInput.disabled = !isEditingData;
        phoneInput.disabled = !isEditingData;
        cpfInput.disabled = !isEditingData;

        editDataBtn.textContent = isEditingData ? 'Salvar Alterações' : 'Editar Dados';
        if (isEditingData) {
            nameInput.focus();
        }
    };

    const editUserData = async () => {
        const updatedUser = {
            nome: nameInput.value,
            email: emailInput.value,
            cpf: cpfInput.value,
            telefone: phoneInput.value,
            // A role deve ser mantida, mas a API deve garantir isso
            role: user.role, 
        };

        const resultado = await fetchData(`usuarios/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedUser)
        });

        if (resultado?.success) {
            alert('Dados atualizados com sucesso!');
            // Atualiza o localStorage com os novos dados
            localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser })); 
            return true;
        }
        return false;
    };


    // --- Funções de Endereço ---

    const renderAddresses = (addresses) => {
        const selectedAddressId = localStorage.getItem('selectedAddressId');
        addressListDiv.innerHTML = addresses.map(addr => `
            <div class="address-card ${selectedAddressId == addr.id ? 'primary' : ''}" data-address-id="${addr.id}">
                <p><strong>${addr.nickname || 'Endereço'}</strong></p>
                <p>${addr.street}, ${addr.number}</p>
                <p>${addr.neighborhood}, ${addr.city} - ${addr.state}</p>
                <p>${addr.zipcode}</p>
                <div class="address-actions">
                    <button class="action-btn" onclick="openAddressModal(${addr.id})">Editar</button>
                    <button class="action-btn action-btn-danger" onclick="deleteAddress(${addr.id})">Excluir</button>
                    ${selectedAddressId != addr.id ? `<button class="action-btn action-btn-secondary" onclick="setPrimaryAddress(${addr.id})">Definir como Principal</button>` : '<span>(Principal)</span>'}
                </div>
            </div>
        `).join('');
    };

    const fetchAddresses = async () => {
        // Assume que a rota /usuarios/:id/enderecos existe ou que /enderecos retorna todos os endereços do usuário autenticado
        const addresses = await fetchData(`enderecos`);
        if (addresses) {
            // Filtra os endereços para garantir que são do usuário logado (boa prática)
            const userAddresses = addresses.filter(addr => addr.usuario_id == user.id); 
            localStorage.setItem('userAddresses', JSON.stringify(userAddresses));
            renderAddresses(userAddresses);

            // Garante que um endereço principal esteja selecionado (se houver)
            let selectedAddressId = localStorage.getItem('selectedAddressId');
            if (!selectedAddressId && userAddresses.length > 0) {
                localStorage.setItem('selectedAddressId', userAddresses[0].id);
            }
        }
    };

    const openAddressModal = (addressId = null) => {
        addressForm.reset();
        addressIdInput.value = '';
        modalTitle.textContent = 'Adicionar Novo Endereço';
        
        if (addressId) {
            const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
            const address = addresses.find(a => a.id == addressId);
            if (address) {
                modalTitle.textContent = 'Editar Endereço';
                addressIdInput.value = address.id;
                // Preenche o formulário com os dados do endereço
                document.getElementById('nickname').value = address.nickname || '';
                document.getElementById('zipcode').value = address.zipcode || '';
                document.getElementById('street').value = address.street || '';
                document.getElementById('number').value = address.number || '';
                document.getElementById('complement').value = address.complement || '';
                document.getElementById('neighborhood').value = address.neighborhood || '';
                document.getElementById('city').value = address.city || '';
                document.getElementById('state').value = address.state || '';
            }
        }
        addressModal.classList.remove('hidden');
    };

    const closeModal = () => {
        addressModal.classList.add('hidden');
    };

    const saveAddress = async (event) => {
        event.preventDefault();
        
        const isUpdate = addressIdInput.value;
        const method = isUpdate ? 'PUT' : 'POST';
        const endpoint = isUpdate ? `enderecos/${isUpdate}` : 'enderecos';
        
        const addressData = {
            zipcode: document.getElementById('zipcode').value,
            street: document.getElementById('street').value,
            number: document.getElementById('number').value,
            complement: document.getElementById('complement').value,
            neighborhood: document.getElementById('neighborhood').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            nickname: document.getElementById('nickname').value || 'Meu Endereço',
            // O backend deve usar o ID do usuário do token, mas para segurança, inclua se necessário.
            usuario_id: user.id 
        };

        const resultado = await fetchData(endpoint, {
            method: method,
            body: JSON.stringify(addressData)
        });

        if (resultado?.success || resultado?.id) {
            alert(`Endereço ${isUpdate ? 'atualizado' : 'adicionado'} com sucesso!`);
            closeModal();
            fetchAddresses(); // Recarrega a lista de endereços
        }
    };

    window.deleteAddress = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
        
        const resultado = await fetchData(`enderecos/${id}`, { method: 'DELETE' });

        if (resultado?.success) {
            alert('Endereço excluído com sucesso!');
            // Remove o ID principal se for o excluído
            if (localStorage.getItem('selectedAddressId') == id) {
                localStorage.removeItem('selectedAddressId');
            }
            fetchAddresses(); // Recarrega a lista
        }
    };

    window.setPrimaryAddress = (id) => {
        localStorage.setItem('selectedAddressId', id);
        alert('Endereço principal atualizado.');
        fetchAddresses(); // Recarrega a lista para atualizar a UI
    };

    const fetchAddressFromCEP = async (cep) => {
        if (!cep) return;
        // Remove tudo que não for dígito
        const cleaned = String(cep).replace(/\D/g, '');

        // Validação simples: CEP brasileiro tem 8 dígitos
        if (cleaned.length !== 8) {
            // Não faz nada se o CEP estiver incompleto
            return;
        }

        try {
            const resp = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
            if (!resp.ok) throw new Error('Falha na requisição do CEP');
            const data = await resp.json();

            if (data.erro) {
                alert('CEP não encontrado.');
                return;
            }

            // Preenche os campos do formulário com os dados retornados
            document.getElementById('street').value = data.logradouro || '';
            document.getElementById('neighborhood').value = data.bairro || '';
            document.getElementById('city').value = data.localidade || '';
            document.getElementById('state').value = data.uf || '';
            document.getElementById('complement').value = data.complemento || '';

            // Move o foco para o número do endereço para facilitar o fluxo
            const numberEl = document.getElementById('number');
            if (numberEl) numberEl.focus();
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            // Mensagem amigável ao usuário
            alert('Não foi possível buscar o endereço a partir do CEP. Verifique sua conexão e tente novamente.');
        }
    };
    
    // Expõe funções globais
    window.openAddressModal = openAddressModal;
    window.deleteAddress = window.deleteAddress; // Já estão expostas
    window.setPrimaryAddress = window.setPrimaryAddress;

    // --- Inicialização e Event Listeners ---
    logoutButton.addEventListener('click', () => {
        localStorage.clear(); 
        window.location.href = 'login.html';
    });
    
    addAddressBtn.addEventListener('click', () => openAddressModal());
    closeAddressModalBtn.addEventListener('click', closeModal);
    addressForm.addEventListener('submit', saveAddress);
    editDataBtn.addEventListener('click', toggleEditData);
    zipcode_input.addEventListener('blur', (e) => fetchAddressFromCEP(e.target.value));

    // Inicializa carregamento de dados
    fetchUserData();
    fetchAddresses();
});