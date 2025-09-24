// js/imoveis.js
const API_URL = '/api/imoveis';

// containers
const listaEl = document.getElementById('resultado') || document.querySelector('.house-gallery');
const titleEl = document.querySelector('.houses-found h1') || document.querySelector('h1');

// utils
const norm = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc  = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
// "R$1000,00" (sem espaço) com 2 casas
const formatBRL = (n) => {
  if (n == null) return null;
  const s = Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return 'R$ ' + s; // sem espaço
};

// Title Case pt-BR com UFs em MAIÚSCULO após "/", "-", "–", "—" ou ","
const titleCasePt = (str = '') => {
  const STOP = new Set(['de','da','das','do','dos','e','em','no','nos','na','nas','para','pra','por','a','o','as','os','ao','aos','à','às','com','sem','sob','sobre','entre']);
  const UFs = new Set(['CCI','MG', 'BR', 'II']);

  // inclui hífen normal "-", en-dash "–" e em-dash "—"
  const parts = str.toLowerCase().split(/(\s+|[-/(),\u2013\u2014])/);

  return parts.map((tok, i, arr) => {
    if (/^\s+$/.test(tok) || /[-/(),\u2013\u2014]/.test(tok)) return tok;

    let j = i - 1, prev = '';
    while (j >= 0) { const t = arr[j]; if (!/^\s+$/.test(t)) { prev = t; break; } j--; }

    if (UFs.has(tok.toUpperCase()) && /[-/,\u2013\u2014]/.test(prev)) return tok.toUpperCase();
    if (STOP.has(tok) && i !== 0 && !/[-/\(\u2013\u2014]/.test(prev)) return tok;

    return tok.charAt(0).toUpperCase() + tok.slice(1);
  }).join('');
};

// aceita "R$ 1.200,00", "1200", 1200, etc.
const parsePrecoBR = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  // remove tudo que não for dígito, vírgula ou ponto; trata milhar/ponto e decimal/vírgula
  const cleaned = p.toString().trim();
  // se tiver vírgula, considera como decimal BR; se não tiver, trata só dígitos
  if (cleaned.includes(',')) {
    return Number(cleaned.replace(/[^\d,]/g,'').replace(/\./g,'').replace(',', '.')) || 0;
  }
  return Number(cleaned.replace(/[^\d]/g,'')) || 0;
};

// completa https:// e bloqueia "javascript:"
const toAbsoluteHttps = (u = '') => {
  const s = String(u).trim();
  if (!s || /^javascript:/i.test(s)) return '';
  return /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
};


// lê filtros da URL (?bairro=&precoMin=&precoMax=)
function getFiltros() {
  const params = new URLSearchParams(location.search);
  const bairroRaw = (params.get('bairro') || '').trim();
  const minStr = (params.get('precoMin') || '').trim();
  const maxStr = (params.get('precoMax') || '').trim();

  const toNumOrNull = (s) => s === '' ? null : (isFinite(Number(s)) ? Number(s) : null);

  let precoMin = toNumOrNull(minStr);
  let precoMax = toNumOrNull(maxStr);

  // corrige inversão
  if (precoMin != null && precoMax != null && precoMin > precoMax) {
    [precoMin, precoMax] = [precoMax, precoMin];
  }

  return { bairroRaw, precoMin, precoMax };
}

// Constrói URL segura a partir do "id":
// - bloqueia javascript:
// - se parecer URL -> garante https://
// - se não parecer URL -> fallback p/ página interna
const buildListingUrlFromId = (id) => {
  const s = String(id || '').trim();
  if (!s || /^javascript:/i.test(s)) return '';
  const looksLikeUrl =
    /^https?:\/\//i.test(s) || /^www\./i.test(s) || /\.[a-z]{2,}(?:\/|$)/i.test(s);
  if (looksLikeUrl) return /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
  return `./imovel.html?id=${encodeURIComponent(s)}`;
};


function atualizarTitulo({ bairroRaw, precoMin, precoMax }) {
  if (!titleEl) return;

  // --- helpers locais (não quebram se nada mais existir) ---
  const STOP = new Set([
    'de','da','das','do','dos','e','em','no','nos','na','nas',
    'para','pra','por','a','o','as','os','ao','aos','à','às',
    'com','sem','sob','sobre','entre'
  ]);

  const titleCaseLocal = (str = '') => {
    const parts = str.toLowerCase().split(/(\s+|[-/(),\u2013\u2014])/);
    return parts.map((tok, i, arr) => {
      if (/^\s+$/.test(tok) || /[-/(),\u2013\u2014]/.test(tok)) return tok;
      let j = i - 1, prev = '';
      while (j >= 0) { const t = arr[j]; if (!/^\s+$/.test(t)) { prev = t; break; } j--; }
      if (STOP.has(tok) && i !== 0 && !/[-/\(\u2013\u2014]/.test(prev)) return tok;
      return tok.charAt(0).toUpperCase() + tok.slice(1);
    }).join('');
  };

  const forceUpperAllowlist = (s = '') =>
    s.replace(/\b(cci|mg|br)\b/gi, m => m.toUpperCase());

  const fmtBRL =
    (typeof formatBRL === 'function')
      ? formatBRL
      : (n) => 'R$' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // --- formatação do título ---
  const bairroFmt = bairroRaw ? forceUpperAllowlist(titleCaseLocal(bairroRaw)) : '';

  const partes = ['Imóveis encontrados'];
  if (bairroFmt) partes.push(`em <span class="hl">${esc(bairroFmt)}</span>`);
  if (precoMin != null && precoMax != null) {
    partes.push(`de <span class="hl">${esc(fmtBRL(precoMin))}</span> a <span class="hl">${esc(fmtBRL(precoMax))}</span>`);
  } else if (precoMin != null) {
    partes.push(`a partir de <span class="hl">${esc(fmtBRL(precoMin))}</span>`);
  } else if (precoMax != null) {
    partes.push(`até <span class="hl">${esc(fmtBRL(precoMax))}</span>`);
  }

  titleEl.innerHTML = partes.join(' ');
}


// filtro (tenta usar r.bairro; se não existir, cai para r.titulo)
function aplicaFiltro(rows, { bairroRaw, precoMin, precoMax }) {
  const b = norm(bairroRaw);
  return rows
    .filter(r => {
      const bairroFonte = r.bairro ?? r.titulo ?? '';
      const bOk = !b || norm(bairroFonte).includes(b);

      const preco = parsePrecoBR(r.preco);
      const minOk = precoMin == null || preco >= precoMin;
      const maxOk = precoMax == null || preco <= precoMax;

      return bOk && minOk && maxOk;
    })
    .sort((a,b) => parsePrecoBR(a.preco) - parsePrecoBR(b.preco));
}

// render

function cardHTML(r) {
  const img = r.imagem || 'img/placeholder.jpg';

  const tituloRaw = r.titulo || r.bairro || 'Imóvel';
  const tituloFmt = titleCasePt ? titleCasePt(tituloRaw) : tituloRaw;

  // >>> preço com "Valor sob consulta" quando 0/indefinido
  const precoNum = parsePrecoBR(r.preco);
  let precoFmt;
  if (!precoNum || precoNum === 0) {
    precoFmt = 'Valor sob consulta';
  } else {
    precoFmt = formatBRL(precoNum);
  }

  const imobRaw = r.imobiliaria || '-';
  const imobiliariaFmt = titleCasePt ? titleCasePt(imobRaw) : imobRaw;

  // Usa o ID como URL do anúncio (https://... ou fallback ./imovel.html?id=123)
  const url = buildListingUrlFromId(r.id);
  const hasUrl = !!url;
  const isExternal = /^https?:\/\//i.test(url);

  // Card inteiro vira UM ÚNICO link (sem âncora interna)
  const openTag  = hasUrl
    ? `<a class="house-card" href="${esc(url)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${esc(tituloFmt)}">`
    : `<div class="house-card" role="group" aria-label="${esc(tituloFmt)}">`;
  const closeTag = hasUrl ? `</a>` : `</div>`;

  const extIcon = isExternal ? ' <span aria-hidden="true">↗</span>' : '';

  return `
    ${openTag}
      <div class="img-wrapper">
        <img src="${img}" alt="${esc(tituloFmt)}">
      </div>
      <div class="house-info">
        <p class="titulo">${esc(tituloFmt)}</p>
        <p class="meta">${esc(precoFmt)}</p>
        <p class="fonte">Disponível em: ${esc(imobiliariaFmt)}${extIcon}</p>
      </div>
    ${closeTag}
  `;
}


function render(list) {
  if (!listaEl) return;
  if (!list.length) {
    listaEl.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px">Nenhum imóvel encontrado.</div>`;
    return;
  }
  listaEl.innerHTML = list.map(cardHTML).join('');
}

// fluxo principal
async function main() {
  const filtros = getFiltros();
  atualizarTitulo(filtros);

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Falha ao carregar imóveis');

  const todos = await res.json();
  const filtrados = aplicaFiltro(todos, filtros);
  render(filtrados);
}

// aguarda DOM
document.addEventListener('DOMContentLoaded', () => {
  main().catch(err => {
    console.error(err);
    if (listaEl) {
      listaEl.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px;color:#900">
        Erro ao carregar os imóveis.
      </div>`;
    }
  });
});
