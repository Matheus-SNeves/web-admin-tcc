const cadastro = document.getElementById('cadastro');
cadastro.addEventListener('submit', (event) => {
    event.preventDefault();
    const corpo = {
        nome: cadastro.nome.value,
        preco: cadastro.preco.value,
        quantidade: cadastro.quantidade.value,
        descricao: cadastro.descricao.value,
        id_supermercado: cadastro.id_supermercado.value,
        img: cadastro.img.value
    }
    fetch('https://tcc-senai-nine.vercel.app/produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(corpo)
    })
        .then(response => response.status)
        .then(status => {
            if (status === 201) {
                alert('produto cadastrado com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao cadastrar produto');
            }
        });
});

console.log('testando')

fetch('https://tcc-senai-nine.vercel.app/produtos')
    .then(response => response.json())
    .then(produtos => {
        const tabela = document.getElementById('produtos');
        produtos.forEach((produto) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
            <td data-label="Id:">${produto.id_produto}</td>
            <td data-label="Nome:" contenteditable="true">${produto.nome}</td>
            <td data-label="Preco:" contenteditable="true">${produto.preco}</td>
            <td data-label="Descricao:" contenteditable="true">${produto.descricao}</td>
            <td data-label="Quantidade:" contenteditable="true">${produto.quantidade}</td>
            <td data-label="Id_supermercado:" contenteditable="true">${produto.id_supermercado}</td>
            <td data-label="Imagem:" contenteditable="true">${produto.img}</td>
            <td><button onclick="alterar(this)">*</button><button onclick="excluir(${produto.id_produto})">-</button></td>
        `;
            tabela.appendChild(linha);
        });
    });

function alterar(e) {
    const id = e.parentNode.parentNode.children[0].textContent
    const corpo = {
        nome: e.parentNode.parentNode.children[1].textContent,
        preco: e.parentNode.parentNode.children[2].textContent,
        descricao: e.parentNode.parentNode.children[3].textContent,
        quantidade: e.parentNode.parentNode.children[4].textContent,
        id_supermercado: e.parentNode.parentNode.children[5].textContent,
        img: e.parentNode.children[6].textContent
    }
    fetch(`https://tcc-senai-nine.vercel.app/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    })
        .then(response => response.status)
        .then(status => {
            if (status === 202) {
                alert('produto alterado com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao alterar produto');
            }
        });
}

function excluir(id_produto) {
    fetch(`https://tcc-senai-nine.vercel.app/produtos/${id_produto}`, {
        method: 'DELETE'
    })
        .then(response => response.status)
        .then(status => {
            if (status === 204) {
                alert('produto excluído com sucesso');
                window.location.reload();
            } else {
                alert('Erro ao excluir produto');
            }
        });
}
