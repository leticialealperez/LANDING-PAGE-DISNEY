// CONFIGURACAO DO CLIENT HTTP AXIOS
const api = axios.create({
    baseURL: 'https://rickandmortyapi.com/api'
});

// CAPTURAR OS ELEMENTOS DA DOM QUE SERÃO MODIFICADOS PELO JS
const espacoCardsRow = document.getElementById('espaco-cards')
const botaoPrev = document.getElementById('botao-prev')
const botaoAtual = document.getElementById('botao-atual')
const botaoNext = document.getElementById('botao-next')
const qtdPersonagensSpan = document.getElementById('qtd-personagens')

let paginaAtual = 1
let totalPaginas = 0

// 1 BUSCA DEVE OCORRER QUANDO A PAGINA CARREGA
document.addEventListener('DOMContentLoaded', async () => {
    const dadosRetornados = await buscarPersonagens(paginaAtual);

    qtdPersonagensSpan.innerText = dadosRetornados.totalPersonagens

    montarColunasCards(dadosRetornados.personagens)
    mudarBotoes(dadosRetornados.paginaAnterior, dadosRetornados.proximaPagina)

});

botaoNext.addEventListener('click', proximaPagina)
botaoPrev.addEventListener('click', paginaAnterior)


function montarColunasCards(listaPersonagens) {
    espacoCardsRow.innerHTML = ""

    listaPersonagens.forEach(async (personagem) => {
        /*
            <div class="col-12 col-md-6 col-lg-4">
                    <div class="card w-100">
                        <img src="https://rickandmortyapi.com/api/character/avatar/1.jpeg" class="card-img-top"
                            alt="Avatar">
                        <div class="card-body px-4">
                            <h5 class="card-title">
                                Nome Personagem
                            </h5>

                            <p class="card-text">
                                <span class="text-danger">
                                    <i class="bi bi-caret-right-fill"></i>
                                </span>
                                Vivo - Humano
                            </p>

                            <dl>
                                <dt>Última localização conhecida:</dt>
                                <dd>Planeta XPTO</dd>

                                <dt>Visto a última vez em:</dt>
                                <dd>Nome do Capitulo</dd>
                            </dl>

                        </div>
                    </div>
                </div>
        */

        // CRIA COLUNA
        const divCol = document.createElement('div')
        divCol.setAttribute('class', 'col-12 col-md-6 col-lg-4 espaco-card')

        // CRIA CARD
        const divCard = document.createElement('div')
        divCard.setAttribute('class', 'card w-100')

        // CRIA IMAGEM
        const imgCard = document.createElement('img')
        imgCard.setAttribute('src', `${personagem.image}`)
        imgCard.setAttribute('class', 'card-img-top')
        imgCard.setAttribute('alt', `${personagem.name}`)

        // CRIA CARD BODY
        const divCardBody = document.createElement('div')
        divCardBody.setAttribute('class', 'card-body px-4')

        // CRIA TITULO CARD
        const tituloCard = document.createElement('h5')
        tituloCard.setAttribute('class', 'card-title')
        tituloCard.innerText = personagem.name

        // CRIA PARAGRAFO
        const descricaoPersonagem = document.createElement('p')
        descricaoPersonagem.setAttribute('class', 'card-text')

        switch (personagem.status) {
            case 'Alive':
                descricaoPersonagem.innerHTML = `
                    <span class="text-success">
                        <i class="bi bi-caret-right-fill"></i>
                    </span>
                    Vivo - ${personagem.species}
                `
                break;

            case 'Dead':
                descricaoPersonagem.innerHTML = `
                    <span class="text-danger">
                        <i class="bi bi-caret-right-fill"></i>
                    </span>
                    Morto - ${personagem.species}
                `
                break;

            default:
                descricaoPersonagem.innerHTML = `
                    <span class="text-secondary">
                        <i class="bi bi-caret-right-fill"></i>
                    </span>
                    Desconhecido - ${personagem.species}
                `
        }



        const dadosEpisodio = await buscarDadosEpisodio(personagem.episode[personagem.episode.length - 1])

        // CRIA DL
        const detalhamentoPersonagem = document.createElement('dl');
        detalhamentoPersonagem.innerHTML = `
            <dt>Última localização conhecida:</dt>
            <dd>${personagem.location.name}</dd>

            <dt>Visto a última vez em:</dt>
            <dd>${dadosEpisodio.nomeEpisodio}</dd>

            <dt>Foi ao ar em:</dt>
            <dd>${dadosEpisodio.dataLancamento}</dd>
        `

        // APPENDS - criar os filhos dentros dos respectivos elementos pais
        divCardBody.appendChild(tituloCard)
        divCardBody.appendChild(descricaoPersonagem)
        divCardBody.appendChild(detalhamentoPersonagem)

        divCard.appendChild(imgCard)
        divCard.appendChild(divCardBody)

        divCol.appendChild(divCard)

        espacoCardsRow.appendChild(divCol)

    })
}

function mudarBotoes(prev, next) {
    botaoAtual.children[0].innerText = paginaAtual

    // !null => !false => true
    if (!prev) {
        botaoPrev.classList.remove('cursor-pointer')
        botaoPrev.classList.add('disabled')
    } else {
        botaoPrev.classList.add('cursor-pointer')
        botaoPrev.classList.remove('disabled')
    }

    if (!next) {
        botaoNext.classList.remove('cursor-pointer')
        botaoNext.classList.add('disabled')
    } else {
        botaoNext.classList.add('cursor-pointer')
        botaoNext.classList.remove('disabled')
    }
}


async function buscarPersonagens(pagina) {
    try {
        const resposta = await api.get('/character', {
            params: {
                page: pagina,
            }
        });

        const dadosApi = {
            totalPaginas: resposta.data.info.pages,
            totalPersonagens: resposta.data.info.count,
            personagens: resposta.data.results,
            proximaPagina: resposta.data.info.next,
            paginaAnterior: resposta.data.info.prev
        }

        return dadosApi

    } catch (erro) {
        console.log(erro) // debug (erros de requisicao e erros de sintaxe - 400, 401, 500 ...
        alert('Erro na busca de personagens.')
        // aqui é momento de mostrar uma mensagem se der erro na requisicao
    }
}

async function buscarDadosEpisodio(url) {
    try {
        const resposta = await axios.get(url)

        // resposta.data
        return {
            id: resposta.data.id,
            nomeEpisodio: resposta.data.name,
            dataLancamento: resposta.data.air_date
        }
    } catch {
        alert("Deu algo errado na busca do episódio")
    }
}

async function proximaPagina() {
    // verificar se o botão esta desabilitado
    if (!botaoNext.classList.contains('disabled')) {
        // só dispara a requisição pra API se o botão estiver habilitado
        ++paginaAtual

        const dadosAPI = await buscarPersonagens(paginaAtual)

        montarColunasCards(dadosAPI.personagens)
        mudarBotoes(dadosAPI.paginaAnterior, dadosAPI.proximaPagina)
    }
}

async function paginaAnterior() {
    // verificar se o botão esta desabilitado
    if (!botaoPrev.classList.contains('disabled')) {
        // só dispara a requisição pra API se o botão estiver habilitado
        --paginaAtual

        const dadosAPI = await buscarPersonagens(paginaAtual)

        montarColunasCards(dadosAPI.personagens)
        mudarBotoes(dadosAPI.paginaAnterior, dadosAPI.proximaPagina)
    }
}

