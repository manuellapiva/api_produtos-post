// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let produtoEmEdicao = null;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Mostra uma mensagem modal
function mostrarMensagem(mensagem, tipo = 'info') {
    const modal = document.getElementById('modalMessage');
    const modalText = document.getElementById('modalText');
    
    modalText.textContent = mensagem;
    modal.style.display = 'flex';
    
    // Define a cor baseado no tipo
    if (tipo === 'sucesso') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    } else if (tipo === 'erro') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    }
}

// Fecha o modal de mensagens
function fecharModal() {
    document.getElementById('modalMessage').style.display = 'none';
}

// Limpa o formulário
function limparFormulario() {
    document.getElementById('productsForm').reset();
    produtoEmEdicao = null;
    document.querySelector('.form-section h2').textContent = 'Adicionar ou Editar Produto';
}

// Formata CPF para exibição
function formatarPreco(preco) {
    if (!preco) return '';
    // (\d{3}) - Grupo de captura que captura exatamente 3 dígitos
    // A regex divide o CPF em 4 grupos: 3 dígitos, 3 dígitos, 3 dígitos e 2 dígitos
    // O padrão $1.$2.$3-$4 reconstrói como: XXX.XXX.XXX-XX
    return preco.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formata telefone para exibição
function formatarEstoque(estoque) {
    if (!estoque) return '';
    return estoque.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

// ========================================
// OPERAÇÕES COM A API
// ========================================

async function carregarProdutos() {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const productsList = document.getElementById('productsList');
    
    loadingMessage.style.display = 'block';
    productsList.innerHTML = '';
    
    try {
        const resposta = await fetch('/produtos');
        
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        
        const produtos = await resposta.json();
        loadingMessage.style.display = 'none';
        
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
            productsList.innerHTML = '';
        } else {
            emptyMessage.style.display = 'none';
            exibirTabela(produtos);
        }
    } catch (erro) {
        loadingMessage.style.display = 'none';
        emptyMessage.style.display = 'block';
        console.error('Erro:', erro);
        mostrarMensagem('Erro ao carregegar os produtos. Tente novamente.', 'erro');
    }
}

async function criarProduto(dados) {
    try {
        const resposta = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao criar produto');
        }
        
        const novoProduto = await resposta.json();
        mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso');
        limparFormulario();
        carregarProdutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

async function atualizarProduto(id, dados) {
    try {
        const resposta = await fetch(`/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao atualizar produto');
        }
        
        const produtoAtualizado = await resposta.json();
        mostrarMensagem('Produto atualizado com sucesso!', 'sucesso');
        limparFormulario();
        carregarProdutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

async function deletarProduto(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
        return;
    }
    
    try {
        const resposta = await fetch(`/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao deletar produto');
        }
        
        mostrarMensagem('Produto removido com sucesso!', 'sucesso');
        carregarProdutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// ========================================
// EXIBIÇÃO DE DADOS
// ========================================

function exibirTabela(produtos) {
    const productsList = document.getElementById('productsList');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Categoria</th>
                    <th>Acoes</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    produtos.forEach(produto => {
        html += `
            <tr>
                <td>#${produto.id}</td>
                <td>${produto.nome}</td>
                <td>${formatarPreco(produto.preco)}</td>
                <td>${produto.estoque}</td>
                <td>${produto.categoria}</td>
                <td class="acoes">
                    <button class="btn btn-edit" onclick="editarProduto(${produto.id}, '${produto.nome}', '${produto.preco}', '${produto.estoque}', '${produto.categoria}')">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deletarProduto(${produto.id})">🗑️ Deletar</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    productsList.innerHTML = html;
}

function editarProduto(id, nome, preco, estoque, categoria) {
    produtoEmEdicao = id;
    
    document.getElementById('nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('estoque').value = estoque;
    document.getElementById('categoria').value = categoria;
    
    document.querySelector('.form-section h2').textContent = `Editando Produto #${id}`;
    
    // Scroll até o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// BUSCA E FILTRO
// ========================================

async function buscarProdutos(tipo, valor) {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const productsList = document.getElementById('productsList');
   
    loadingMessage.style.display = 'block';
    productsList.innerHTML = '';
   
    try {
        let url = '';

        if (tipo === 'categoria') {
            url = `/produtos/buscar/categoria/${encodeURIComponent(valor)}`;
        } else if (tipo === 'id') {
            url = `/produtos/buscar/id/${valor}`;
        }

        const resposta = await fetch(url);
       
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos');
        }
       
        let produtos = await resposta.json();

        if (!Array.isArray(produtos)) {
            produtos = produtos ? [produtos] : [];
        }

        loadingMessage.style.display = 'none';
       
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
            productsList.innerHTML = '';
        } else {
            emptyMessage.style.display = 'none';
            exibirTabela(produtos);
        }
    } catch (erro) {
        loadingMessage.style.display = 'none';
        emptyMessage.style.display = 'block';
        console.error('Erro:', erro);
        mostrarMensagem('Erro ao buscar os produtos. Tente novamente.', 'erro');
    }
}

function filtrarProdutos() {
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const valor = searchInput.value.trim();
    
    if (valor === '') {
        // Se vazio, carrega todos
        carregarProdutos();
    } else {
        // Busca no backend
        buscarProdutos(searchType.value, valor);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    
    // Formulário de envio
    document.getElementById('productsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const preco = document.getElementById('preco').value.trim();
        const estoque = document.getElementById('estoque').value.trim();
        const categoria = document.getElementById('categoria').value.trim();
        
        // Validação básica
        if (!nome || !preco || !estoque || !categoria) {
            mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
            return;
        }
        
        const dados = { nome, preco, estoque, categoria };
        
        if (produtoEmEdicao) {
            atualizarProduto(produtoEmEdicao, dados);
        } else {
            criarProduto(dados);
        }
    });
    
    // Botão Limpar Formulário
    document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
    
    // Botão Recarregar Lista
    document.getElementById('btnRecarregar').addEventListener('click', carregarProdutos);
    
    // Botão Buscar
    document.getElementById('btnBuscar').addEventListener('click', filtrarProdutos);
    
    // Busca em tempo real (opcional, pode ser removido se quiser apenas botão)
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filtrarProdutos();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('modalMessage').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModal();
        }
    });
});
