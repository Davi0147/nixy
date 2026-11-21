// Lógica pura do status ao vivo: sem DOM e sem Firebase, para testar com node.

// Sem batimento por mais de 3 min = a Nixy caiu sem avisar; tratamos como dormindo.
export const SILENCIO_MAX = 180;

// Fim da frase por humor. As etiquetas ficam minúsculas; a página põe em caixa alta via CSS.
export const FIM = {
  "furiosa": "e alguém vai pagar",
  "irritada": "de mau humor",
  "pra baixo": "pra esquecer a vida",
  "morta de sono": "caindo de sono",
  "radiante (mas finge que não)": "e, milagre, feliz",
  "entediada": "por puro tédio",
  "de bom humor": "de bom humor, aproveita",
  "de boa": "na paz, por enquanto",
};
const FIM_PADRAO = "do jeito dela";

const ROTULOS = {
  jogando: ["jogando", "controle"],
  assistindo: ["assistindo", "tela"],
  ouvindo: ["ouvindo", "fones"],
  fora: ["fora", "porta"],
  dormindo: ["dormindo", "lua"],
};
const ROTULO_PADRAO = ["fazendo", "brilho"];

// tipo e humor vêm de fora: "constructor" ou "toString" não podem achar coisa herdada de Object
const proprio = (tabela, chave) => (Object.hasOwn(tabela, chave) ? tabela[chave] : undefined);

function maiuscula(s) {
  const t = String(s ?? "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function formatarHumor(rotulo) {
  return maiuscula(rotulo);
}

export function estaDormindo(status, agoraSeg) {
  if (!status || status.online === false) return true;
  if (status.atividade?.tipo === "dormindo") return true;
  // carimbo que não é número não prova que ela está viva
  const atualizado = Number(status.atualizado);
  if (!Number.isFinite(atualizado)) return true;
  return agoraSeg - atualizado > SILENCIO_MAX;
}

export function exibicao(status, agoraSeg) {
  const dormindo = estaDormindo(status, agoraSeg);
  const tipo = status?.atividade?.tipo;
  const [rotulo, icone] = dormindo ? ROTULOS.dormindo : (proprio(ROTULOS, tipo) ?? ROTULO_PADRAO);
  const m = status?.medidores ?? {};
  return {
    dormindo,
    rotulo,
    icone,
    texto: dormindo ? "" : (status?.atividade?.texto ?? ""),
    humor: dormindo ? "não perturbe" : "Humor: " + formatarHumor(status?.humor ?? ""),
    // Se avisou que ia dormir usa esse instante; senão, o último batimento conhecido.
    desde: dormindo ? (status?.dormiu_em ?? status?.atualizado ?? null) : null,
    medidores: {
      energia: m.energia ?? 50,
      estresse: m.estresse ?? 50,
      felicidade: m.felicidade ?? 50,
    },
  };
}

export function chamada(status, agoraSeg) {
  if (estaDormindo(status, agoraSeg)) return ["plantão", "Dormindo. Não insista."];
  const tipo = status.atividade?.tipo;
  const texto = status.atividade?.texto ?? "";
  const fim = proprio(FIM, status.humor) ?? FIM_PADRAO;
  switch (tipo) {
    case "jogando":
      return ["games", `Zerando ${texto} ${fim}`];
    case "assistindo":
      return ["tv", `Maratonando ${texto} ${fim}`];
    case "ouvindo":
      return ["música", `${texto} no repeat, ${fim}`];
    case "fora":
      return ["rua", "Saiu. Volta quando quiser."];
    default:
      return ["agora", `${maiuscula(texto)} ${fim}`];
  }
}
