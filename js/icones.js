// Ícones de traço fino (no lugar dos emojis): grade 24×24, só contorno; "p" = pontinho cheio.
export const ICONES = {
  controle: '<path d="M6.5 8h11a4 4 0 0 1 3.9 4.9l-.8 3.6a2.4 2.4 0 0 1-4.2 1L15 16H9l-1.4 1.5a2.4 2.4 0 0 1-4.2-1l-.8-3.6A4 4 0 0 1 6.5 8z"/><path d="M8 10.8v3.4M6.3 12.5h3.4"/><circle class="p" cx="15.6" cy="11.4" r=".9"/><circle class="p" cx="17.6" cy="13.4" r=".9"/>',
  tela: '<rect x="3" y="4.5" width="18" height="12.5" rx="1.2"/><path d="M8.5 20.5h7M12 17v3.5"/><path d="M10.5 8.3v5l4-2.5z"/>',
  fones: '<path d="M4.5 15v-3a7.5 7.5 0 0 1 15 0v3"/><rect x="3" y="14" width="4" height="6.5" rx="1.2"/><rect x="17" y="14" width="4" height="6.5" rx="1.2"/>',
  lua: '<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z"/><path d="M16 4h3l-3 3.5h3"/>',
  brilho: '<path d="M12 3c.6 4.6 2 6.9 6.5 8-4.5 1.1-5.9 3.4-6.5 8-.6-4.6-2-6.9-6.5-8C10 9.9 11.4 7.6 12 3z"/><path d="M19 3.5v3M17.5 5h3"/>',
  raio: '<path d="M13.5 2.5 5.5 13.5h6l-1 8 8-11h-6z"/>',
  estresse: '<path d="M9.5 3.5c0 3.2-2.8 6-6 6M14.5 3.5c0 3.2 2.8 6 6 6M9.5 20.5c0-3.2-2.8-6-6-6M14.5 20.5c0-3.2 2.8-6 6-6"/>',
  diabinha: '<circle cx="12" cy="13.5" r="6.8"/><path d="M7 9 5.2 3.8 9.4 6.9M17 9l1.8-5.2-4.2 3.1M9.3 15.6c1.5 1.3 3.9 1.3 5.4 0"/><circle class="p" cx="9.6" cy="12.2" r=".9"/><circle class="p" cx="14.4" cy="12.2" r=".9"/>',
  // "fora": porta com batente no chão e maçaneta
  porta: '<path d="M6.5 20.5V4.2A1.2 1.2 0 0 1 7.7 3h8.6a1.2 1.2 0 0 1 1.2 1.2v16.3"/><path d="M4 20.5h16"/><circle class="p" cx="14.8" cy="12.2" r=".9"/>',
};

export function svg(nome) {
  return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ""}</svg>`;
}
