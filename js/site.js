// Efeitos de rolagem da página (versão Vogue). Os dados ao vivo ficam para outro módulo.
import { svg } from "./icones.js";

const $ = (s, r = document) => [...r.querySelectorAll(s)];
const lim = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const suave = t => t * t * (3 - 2 * t);

const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
const celular = matchMedia("(max-width: 760px)"); // mesmo corte do CSS

// ícones no lugar dos marcadores <i data-ic="...">
$("[data-ic]").forEach(el => { el.outerHTML = svg(el.dataset.ic); });

// edição do mês corrente, em português e caixa alta
const mes = document.querySelector("[data-mes]");
if (mes) mes.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date()).toUpperCase();

// selo: estrela de 26 pontas alternando raio cheio e recolhido, como adesivo
const estrela = (n, dentro) => "polygon(" + Array.from({ length: n * 2 }, (_, i) => {
  const a = Math.PI * i / n, r = i % 2 ? dentro : 50;
  return `${(50 + r * Math.sin(a)).toFixed(2)}% ${(50 - r * Math.cos(a)).toFixed(2)}%`;
}).join(",") + ")";
document.documentElement.style.setProperty("--estrela", estrela(26, 43));

const capa = document.querySelector(".capa");
const titulo = capa.querySelector(".titulo");
const foto = capa.querySelector(".foto");
const linhas = $(".linhas", capa);
const selo = capa.querySelector(".selo");
const citacao = capa.querySelector(".citacao");
const edicao = capa.querySelector(".edicao");
const topo = document.querySelector(".topo");
const dica = document.querySelector(".dica");
const carrosselSec = document.querySelector(".carrossel");
const trilho = carrosselSec.querySelector(".trilho");
const posts = [...trilho.children];
const contador = carrosselSec.querySelector(".contador");
const barra = carrosselSec.querySelector(".barra-prog i");
const jogo = document.querySelector(".jogo");
const quadroJogo = jogo.querySelector(".quadro");
const textoJogo = $(".texto > *", jogo);
const cols = $(".agora .col");
const bio = document.querySelector(".bio");
const retrato = bio.querySelector(".retrato");
const textoBio = $(".texto > *", bio);
const itens = $(".sumario .item");

// quanto o elemento já entrou na tela (0 = abaixo, 1 = bem dentro)
function entrada(el) { return lim((innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.55)); }
// progresso da rolagem dentro de uma seção alta com conteúdo preso
function prog(sec) { return lim(-sec.getBoundingClientRect().top / (sec.offsetHeight - innerHeight)); }

function quadroCapa() {
  const p = prog(capa);
  const t1 = suave(lim(p / 0.6)), t2 = suave(lim((p - 0.55) / 0.3));
  if (reduzido.matches) {
    // só esmaece: sem zoom, sem rotação, sem deslocamento
    titulo.style.transform = foto.style.transform = selo.style.transform = "";
    linhas.forEach(el => { el.style.transform = ""; el.style.opacity = 1 - t1 * 1.4; });
    titulo.style.opacity = 1 - t1 * .7;
    selo.style.opacity = 1 - t1;
    citacao.querySelector("q").style.transform = "";
  } else {
    titulo.style.transform = `translateY(${mix(0, -18, t1)}vh) scale(${mix(1, 1.25, t1)})`;
    titulo.style.opacity = 1 - t1 * .7;
    foto.style.transform = `translateX(-50%) scale(${mix(1, 1.9, t1)})`;
    linhas.forEach((el, i) => { el.style.transform = `translateX(${(i ? 1 : -1) * t1 * 30}vw)`; el.style.opacity = 1 - t1 * 1.4; });
    selo.style.transform = `rotate(${12 + t1 * 90}deg) scale(${1 - t1})`;
    selo.style.opacity = "";
    citacao.querySelector("q").style.transform = `translateY(${mix(40, 0, t2)}px)`;
  }
  citacao.style.opacity = t2;
  topo.classList.toggle("ver", p > .9);
  edicao.style.opacity = 1 - lim(scrollY / (innerHeight * .4));
}

function quadroAgora() {
  cols.forEach((el, i) => {
    const k = suave(lim(entrada(el) - i * .1));
    el.style.opacity = k;
    el.style.transform = reduzido.matches ? "none" : `translateY(${mix(30, 0, k)}px)`;
    // a barra enche até o valor atual (data-v), que o ao vivo pode trocar
    $(".m b", el).forEach(b => { b.style.width = (k * Number(b.dataset.v || 0)) + "%"; });
  });
}

// bio: a foto sobe primeiro e o texto vem atrás, linha por linha
function quadroBio() {
  const k = suave(entrada(retrato));
  retrato.style.opacity = k;
  retrato.style.transform = reduzido.matches ? "none" : `translateY(${mix(24, 0, k)}px)`;
  textoBio.forEach((el, i) => {
    const t = suave(lim(entrada(el) * 1.3 - i * .05));
    el.style.opacity = t;
    el.style.transform = reduzido.matches ? "none" : `translateY(${mix(24, 0, t)}px)`;
  });
}

function quadroCarrossel() {
  if (reduzido.matches) {
    // vira lista que rola de lado: o CSS cuida do layout, aqui só limpa o coverflow
    trilho.style.transform = "";
    posts.forEach(c => { c.style.transform = c.style.opacity = c.style.zIndex = ""; c.querySelector("p").style.opacity = ""; });
    return;
  }
  const n = posts.length, p = prog(carrosselSec);
  const passo = posts[0].offsetWidth + parseFloat(getComputedStyle(trilho).columnGap || 28), pos = p * (n - 1);
  trilho.style.transform = `translateX(${-pos * passo}px)`;
  posts.forEach((c, i) => {
    const d = i - pos, a = Math.abs(d);
    c.style.transform = `perspective(1200px) translateX(${-lim(d, -2, 2) * 40}px) rotateY(${lim(d, -1, 1) * -38}deg) scale(${mix(1, .82, lim(a))})`;
    c.style.opacity = mix(1, .25, lim(a / 2.5));
    c.style.zIndex = 10 - Math.round(a);
    c.querySelector("p").style.opacity = lim(1 - a * 1.6);
  });
  contador.textContent = `${String(Math.round(pos) + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
  barra.style.width = (p * 100) + "%";
}

function quadroJogoEspecial() {
  if (reduzido.matches) {
    quadroJogo.style.clipPath = "";
    $("img", quadroJogo).forEach(im => { im.style.scale = ""; });
  } else {
    // o quadro abre a partir do centro e a cena dá um leve zoom pra fora
    const k = suave(entrada(quadroJogo));
    quadroJogo.style.clipPath = `inset(${mix(18, 0, k)}% ${mix(26, 0, k)}% ${mix(18, 0, k)}% ${mix(26, 0, k)}%)`;
    $("img", quadroJogo).forEach(im => { im.style.scale = mix(1.35, 1, k); });
  }
  textoJogo.forEach((el, i) => {
    const t = suave(lim(entrada(jogo) * 1.2 - i * .1));
    el.style.opacity = t;
    el.style.transform = reduzido.matches ? "none" : `translateY(${mix(24, 0, t)}px)`;
  });
}

// o comando no meio da tela fica maior; no celular não passa de 1 para não cortar a descrição
function quadroComandos() {
  const [maior, menor] = celular.matches ? [1, .88] : [1.08, .82];
  itens.forEach(el => {
    // mede só a linha do título: abrir a explicação não pode mudar o zoom do comando
    const r = (el.querySelector("summary") || el).getBoundingClientRect();
    const d = lim(Math.abs(r.top + r.height / 2 - innerHeight / 2) / (innerHeight * .5));
    el.style.transform = reduzido.matches ? "" : `scale(${mix(maior, menor, d)})`;
    el.style.opacity = mix(1, .3, d);
  });
}

// a dica "role pra baixo" some no fim da página e volta se a pessoa subir
function quadroDica() {
  dica.classList.toggle("sumiu",scrollY + innerHeight >= document.documentElement.scrollHeight - 80);
}

let pedido = false;
function quadro() {
  pedido = false;
  quadroCapa(); quadroAgora(); quadroBio(); quadroCarrossel(); quadroJogoEspecial(); quadroComandos(); quadroDica();
}
function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }

// especial do jogo: as artes passam sozinhas, com legenda e barrinhas de progresso
const artes = $("img", quadroJogo), pontos = $(".pontos i", quadroJogo), legenda = quadroJogo.querySelector(".legenda");
let arte = 0, relogioArtes = null;
// fora da tela ou com a aba escondida o relógio para: no celular não gasta bateria à toa
let jogoNaTela = !("IntersectionObserver" in window);
function passarArte() {
  artes[arte].classList.remove("on"); pontos[arte].classList.remove("on");
  arte = (arte + 1) % artes.length;
  artes[arte].classList.add("on"); void pontos[arte].offsetWidth; pontos[arte].classList.add("on");
  legenda.textContent = "HELL SURVIVOR · " + artes[arte].dataset.leg;
}
function ajustarArtes() {
  clearInterval(relogioArtes); relogioArtes = null;
  if (!reduzido.matches && jogoNaTela && !document.hidden) relogioArtes = setInterval(passarArte, 4500);
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { jogoNaTela = e.isIntersecting; ajustarArtes(); }).observe(jogo);
}
document.addEventListener("visibilitychange", ajustarArtes);

// comandos: a explicação cresce ao abrir e encolhe ao fechar; abrir um fecha o que estava aberto.
// O name="comandos" do HTML já faz isso sem JS, mas fecha seco: aqui ele sai pra dar tempo da animação.
const detalhes = $(".sumario details");
const alvo = new Map();      // pra onde cada um está indo (aberto/fechado), mesmo no meio da animação
const animacoes = new Map();
function animarComando(det, abrir) {
  const exp = det.querySelector(".exp");
  // offsetHeight (e não getBoundingClientRect): o item tem o zoom da rolagem, e a altura na tela vem escalada.
  // Medida escalada faz a animação parar antes da altura real e o resto da lista dar um tranco no fim.
  const antes = det.open ? exp.offsetHeight : 0;  // de onde parou, se já estava animando
  animacoes.get(det)?.cancel();
  alvo.set(det, abrir);
  if (reduzido.matches || !exp.animate) { det.open = abrir; pedir(); return; }
  det.open = true;
  const cheia = exp.offsetHeight;
  const a = exp.animate(
    [{ height: `${antes}px`, opacity: abrir ? 0 : 1 }, { height: `${abrir ? cheia : 0}px`, opacity: abrir ? 1 : 0 }],
    { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
  animacoes.set(det, a);
  a.onfinish = () => { animacoes.delete(det); if (!abrir) det.open = false; pedir(); };
  acompanhar();
}
// enquanto uma explicação cresce ou encolhe, os comandos de baixo andam: o zoom deles segue quadro a quadro
let acompanhando = false;
function acompanhar() {
  if (acompanhando) return;
  acompanhando = true;
  const passo = () => {
    quadroComandos();
    if (animacoes.size) requestAnimationFrame(passo); else acompanhando = false;
  };
  requestAnimationFrame(passo);
}
detalhes.forEach(det => {
  det.removeAttribute("name");
  det.querySelector("summary").addEventListener("click", ev => {
    ev.preventDefault();
    const abrir = !(alvo.get(det) ?? det.open);
    if (abrir) detalhes.forEach(o => { if (o !== det && (alvo.get(o) ?? o.open)) animarComando(o, false); });
    animarComando(det, abrir);
  });
});

// Safari antigo só tem addListener em MediaQueryList
function aoMudar(mq, fn) {
  if (mq.addEventListener) mq.addEventListener("change", fn); else mq.addListener(fn);
}

// quem trocar valores ao vivo chama isto para as barras seguirem o novo data-v
export { quadro as redesenhar };

addEventListener("scroll", pedir, { passive: true });
addEventListener("resize", pedir);
// abrir/fechar um comando muda a altura da lista: recalcula o zoom dos itens
document.addEventListener("toggle", pedir, true);
addEventListener("load", quadro);
aoMudar(reduzido, () => { ajustarArtes(); quadro(); });
ajustarArtes();
quadro();
