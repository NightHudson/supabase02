document.addEventListener('DOMContentLoaded', function () {

    const URL_DO_SUPABASE = 'https://cfvmakkjdplefnldepuv.supabase.co';
    const CHAVE_ANONIMA =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdm1ha2tqZHBsZWZubGRlcHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTcyNTIsImV4cCI6MjA2MTk3MzI1Mn0.1CmehzRdgeoog4QiHhETBb5uJQfliboAPizdEbJpsG8';
  
    const supabase = window.supabase.createClient(URL_DO_SUPABASE, CHAVE_ANONIMA);
  
    const produtosAlterados = {};
  

    function formatarData(textoData) {
        if (!textoData) return '-';
  
        const data = new Date(textoData);
  
        return data.toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
      });
    }
  
    function formatarPreco(preco) {
        return 'R$ ' + Number(preco).toFixed(2).replace('.', ',');
    }
  

    async function buscarEMostrarProdutos() {
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .order('id');
  
            if (error) {
                throw new Error('Erro ao buscar produtos: ' + error.message);
            }
  
            document.getElementById('mensagemCarregando').style.display = 'none';
  
            if (!data || data.length === 0) {
                document.getElementById('mensagemErro').style.display = 'block';
                document.getElementById('mensagemErro').textContent = 'Nenhum produto encontrado na tabela.';
                return;
            }
  
            const corpoTabela = document.getElementById('corpoDaTabela');
            corpoTabela.innerHTML = '';
  
            data.forEach(produto => {
                const linha = document.createElement('tr');
  
                linha.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome || '-'}</td>
                <td>${produto.descricao || '-'}</td>
                <td>${formatarPreco(produto.preco)}</td>
                <td style="position: relative;">
                    <span id="estoque-${produto.id}" class="estoque-numero">${produto.estoque}</span>
                    <span class="setas-fixas">
                          <button class="up" data-id="${produto.id}">▲</button>
                          <button class="down" data-id="${produto.id}">▼</button>
                    </span>
                </td>
                <td>${formatarData(produto.created_at)}</td>
                `;
                corpoTabela.appendChild(linha);
            });
  
            document.getElementById('tabelaProdutos').style.display = 'table';
  
        } catch (erro) {
            document.getElementById('mensagemCarregando').style.display = 'none';
            document.getElementById('mensagemErro').style.display = 'block';
            document.getElementById('mensagemErro').textContent = erro.message;
            console.log('Erro: ', erro);
        }
    }
  

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('up') || e.target.classList.contains('down')) {
            const id = e.target.dataset.id;
            const span = document.querySelector(`#estoque-${id}`);
            let estoqueAtual = parseInt(span.textContent);
  
            const novoEstoque = e.target.classList.contains('up')
                ? estoqueAtual + 1
                : Math.max(0, estoqueAtual - 1);
  
            span.textContent = novoEstoque;
            produtosAlterados[id] = novoEstoque;
        }
    });
  

    document.getElementById('salvarAlteracoes').addEventListener('click', async () => {
        const updates = Object.entries(produtosAlterados);
  
        if (updates.length === 0) {
            alert('Nenhuma alteração feita.');
            return;
        }
  
        for (const [id, novoEstoque] of updates) {
            const { error } = await supabase
                .from('produtos')
                .update({ estoque: novoEstoque })
                .eq('id', id);
  
            if (error) {
                console.error('Erro ao atualizar estoque: ', error);
                alert('Erro ao salvar alterações!');
            }
        }
  
        alert('Estoque atualizado com sucesso!');
        produtosAlterados = {};
        buscarEMostrarProdutos();
    });
    

    document.getElementById('adicionarProduto').addEventListener('click', async () => {
        const nome = prompt('Nome do produto:');
        const descricao = prompt('Descrição do produto:');
        const preco = parseFloat(prompt('Preço do produto (use ponto para decimais):'));
        const estoque = parseInt(prompt('Quantidade em estoque:'), 10);
    
        if (!nome || isNaN(preco) || isNaN(estoque)) {
            alert('Dados inválidos. Produto não adicionado.');
            return;
        }
    
        const { error } = await supabase
            .from('produtos')
            .insert([{ nome, descricao, preco, estoque }]);
    
        if (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Erro ao adicionar produto.');
            return;
        }
    
        alert('Produto adicionado com sucesso!');
        buscarEMostrarProdutos();
    });


    document.getElementById('excluirProduto').addEventListener('click', async () => {
        const id = prompt('Digite o ID do produto a ser excluído:');
    
        if (!id || isNaN(id)) {
            alert('ID inválido.');
            return;
        }
    
        const confirmacao = confirm(`Tem certeza que deseja excluir o produto com ID ${id}?`);
    
        if (!confirmacao) return;
    
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);
    
        if (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir produto.');
            return;
        }
    
        alert('Produto excluído com sucesso!');
        buscarEMostrarProdutos();
    });
  
    buscarEMostrarProdutos();
  
  });
  