// Liga a página ao status que o bot publica no Firebase (leitura pública, só o nó "status").
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { exibicao, chamada } from "./status.js";
import { svg } from "./icones.js";

// site.js só move as barras; se ele quebrar, o status ao vivo continua sem ele
let redesenhar = () => {};
try {
  ({ redesenhar } = await import("./site.js"));
} catch (e) {
  console.warn("Efeitos de rolagem indisponíveis", e);
  document.documentElement.classList.remove("js"); // nada vai revelar os blocos: mostra já
}

const CONFIG = {
  apiKey: "AIzaSyAuZjjWgzUutPkLvC4RPCcWM9_jGO3I8sc",
  authDomain: "nixy-site.firebaseapp.com",
  databaseURL: "https://nixy-site-default-rtdb.firebaseio.com",
  projectId: "nixy-site",
  appId: "1:622680485050:web:3d6052411f2ba850af6683",
};
const REVERIFICAR_MS = 30000; // o batimento pode parar sem aviso: reavalia de tempos em tempos
const TROCA_MS = 350;         // mesma duração da transição em .vivo / .chamada

const vivo = n => document.querySelector(`[data-vivo="${n}"]`);
const blocoVivo = vivo("rotulo")?.closest(".vivo");
const blocoChamada = vivo("chamada-etiqueta")?.closest(".chamada");

let assinatura = null; // o que está na tela agora; só mexe no DOM se mudar
let ultimo = null;
let timerTroca = null;

function horaLocal(seg) {
  const n = Number(seg);
  if (!Number.isFinite(n)) return "";
  return new Date(n * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function pintar(ex, cham) {
  const set = (n, t) => { const el = vivo(n); if (el) el.textContent = t; };
  set("rotulo", ex.rotulo);
  set("humor", ex.humor);
  set("chamada-etiqueta", cham[0]);
  set("chamada-frase", cham[1]);
  set("indicador", ex.dormindo ? "dormindo" : "ao vivo");

  const at = vivo("atividade");
  if (at) {
    const desde = ex.dormindo && ex.desde != null ? horaLocal(ex.desde) : "";
    const texto = ex.dormindo ? (desde ? `Dormindo desde ${desde}` : "Dormindo") : ex.texto;
    const span = document.createElement("span");
    span.textContent = texto; // texto vem de fora: nunca como HTML
    at.innerHTML = svg(ex.icone);
    at.append(" ", span);
  }

  for (const [nome, v] of Object.entries(ex.medidores)) {
    const caixa = document.querySelector(`[data-medidor="${nome}"]`);
    if (!caixa) continue;
    const n = Math.round(Math.max(0, Math.min(100, Number(v) || 0)));
    const em = caixa.querySelector("em"), b = caixa.querySelector("i b");
    if (em) em.textContent = String(n);
    if (b) b.dataset.v = String(n);
  }
  redesenhar(); // as barras seguem o novo data-v
}

export function desenhar(status, agoraSeg) {
  let ex, cham;
  try {
    ex = exibicao(status, agoraSeg);
    cham = chamada(status, agoraSeg);
  } catch (e) {
    return; // dado estranho: mantém o último desenho
  }
  const chave = JSON.stringify([ex, cham, ex.dormindo && ex.desde != null ? horaLocal(ex.desde) : ""]);
  if (chave === assinatura) return;
  const primeira = assinatura === null;
  assinatura = chave;

  const trocar = [blocoVivo, blocoChamada].filter(Boolean);
  clearTimeout(timerTroca);
  const tirarTroca = () => trocar.forEach(el => el.classList.remove("troca-estado"));
  if (primeira || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    tirarTroca(); // um timer cancelado acima pode ter deixado o bloco invisível
    pintar(ex, cham);
    return;
  }
  // some, troca o conteúdo, volta
  trocar.forEach(el => el.classList.add("troca-estado"));
  timerTroca = setTimeout(() => {
    // mesmo se pintar quebrar, o bloco não pode ficar invisível
    try { pintar(ex, cham); } finally { tirarTroca(); }
  }, TROCA_MS);
}

const agora = () => Date.now() / 1000;

try {
  const db = getDatabase(initializeApp(CONFIG));
  onValue(ref(db, "status"), snap => {
    ultimo = snap.val();
    desenhar(ultimo, agora());
  }, () => { /* sem conexão: segue com o último desenho */ });
} catch (e) {
  console.warn("Firebase indisponível", e);
}
setInterval(() => desenhar(ultimo, agora()), REVERIFICAR_MS);
