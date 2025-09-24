// js/destaques.js
const API_URL = '/api/imoveis';

const track   = document.getElementById('dest-track');
const view    = document.getElementById('dest-viewport');
const btnL    = document.querySelector('#destaques .dest-left');
const btnR    = document.querySelector('#destaques .dest-right');

const esc = s => (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const parsePrecoBR = p => (typeof p==='number'?p:Number((p||'').replace(/[^\d,]/g,'').replace(/\./g,'').replace(',','.'))||0);
const formatBRL = n => 'R$' + Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});

// Title Case pt-BR (preposições minúsculas)
const titleCasePt = (str='')=>{
  const STOP=new Set(['de','da','das','do','dos','e','em','no','nos','na','nas','para','pra','por','a','o','as','os','ao','aos','à','às','com','sem','sob','sobre','entre']);
  const parts=str.toLowerCase().split(/(\s+|[-/(),\u2013\u2014])/);
  return parts.map((tok,i,arr)=>{
    if(/^\s+$/.test(tok)||/[-/(),\u2013\u2014]/.test(tok)) return tok;
    let j=i-1,prev=''; while(j>=0){const t=arr[j]; if(!/^\s+$/.test(t)){prev=t; break;} j--;}
    if(STOP.has(tok)&&i!==0&&!/[-/\(\u2013\u2014]/.test(prev)) return tok;
    return tok.charAt(0).toUpperCase()+tok.slice(1);
  }).join('');
};

// força maiúsculo 
const forceUpperAllowlist = s => (s||'').replace(/\b(cci|mg|br)\b/gi, m=>m.toUpperCase());

// completa https:// e bloqueia javascript:
const toAbsoluteHttps = (u='')=>{
  const s=String(u).trim();
  if(!s || /^javascript:/i.test(s)) return '';
  return /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
};

// function cardHTML(r){
//   const img   = r.imagem || 'img/placeholder.jpg';

//   const titRaw = r.titulo || r.bairro || 'Imóvel';
//   const titulo = forceUpperAllowlist(titleCasePt(titRaw));

//   const imobRaw = r.imobiliaria || '-';
//   const imobiliaria = forceUpperAllowlist(titleCasePt(imobRaw));

//   const precoFmt = formatBRL(parsePrecoBR(r.preco));

//   // PRIORIDADE: usa r.id como URL; se faltar, tenta outros campos
//   const url = buildListingUrlFromId(r.anuncioUrl || r.url || r.link || r.href || r.id);

//   const hasUrl = !!url;
//   const isExternal = /^https?:\/\//i.test(url);

//   const open = hasUrl
//     ? `<a class="house-card" href="${esc(url)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${esc(titulo)}">`
//     : `<div class="house-card" role="group" aria-label="${esc(titulo)}">`;
//   const close = hasUrl ? `</a>` : `</div>`;

//   const extIcon = isExternal ? ' <span aria-hidden="true">↗</span>' : '';

//   return `
//     ${open}
//       <div class="img-wrapper"><img src="${img}" alt="${esc(titulo)}"></div>
//       <div class="house-info">
//         <p class="titulo">${esc(titulo)}</p>
//         <p class="meta">${esc(precoFmt)} · ${esc(imobiliaria)}</p>
//       </div>
//     ${close}
//   `;
// }

function cardHTML(r){
  const img   = r.imagem || 'img/placeholder.jpg';

  const titRaw = r.titulo || r.bairro || 'Imóvel';
  const titulo = forceUpperAllowlist(titleCasePt(titRaw));

  const imobRaw = r.imobiliaria || '-';
  const imobiliaria = forceUpperAllowlist(titleCasePt(imobRaw));

  let precoFmt;
  const precoNum = parsePrecoBR(r.preco);
  if (!precoNum || precoNum === 0) {
    precoFmt = "Valor sob consulta";
  } else {
    precoFmt = formatBRL(precoNum);
  }

  // PRIORIDADE: usa r.id como URL; se faltar, tenta outros campos
  const url = buildListingUrlFromId(r.anuncioUrl || r.url || r.link || r.href || r.id);

  const hasUrl = !!url;
  const isExternal = /^https?:\/\//i.test(url);

  const open = hasUrl
    ? `<a class="house-card" href="${esc(url)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${esc(titulo)}">`
    : `<div class="house-card" role="group" aria-label="${esc(titulo)}">`;
  const close = hasUrl ? `</a>` : `</div>`;

  const extIcon = isExternal ? ' <span aria-hidden="true">↗</span>' : '';

  return `
    ${open}
      <div class="img-wrapper"><img src="${img}" alt="${esc(titulo)}"></div>
      <div class="house-info">
        <p class="titulo">${esc(titulo)}</p>
        <p class="meta">${esc(precoFmt)} · ${esc(imobiliaria)}</p>
      </div>
    ${close}
  `;
}



async function load(){
  try{
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error('Falha ao carregar imóveis');
    const data = await res.json();

    const itens = data
      .sort((a,b)=> parsePrecoBR(a.preco) - parsePrecoBR(b.preco))
      .slice(0, 12);

    track.innerHTML = itens.map(cardHTML).join('');
    updateArrows();
    startAuto();
  }catch(e){
    console.error(e);
    track.innerHTML = '<div style="background:#fff;border-radius:12px;padding:18px">Não foi possível carregar os destaques.</div>';
  }
}

// util: largura de 1 “passo” (um card + gap)
function stepSize(){
  const card = track.querySelector('.house-card');
  if(!card) return 300;
  const gap = parseFloat(getComputedStyle(track).gap || 16);
  return card.getBoundingClientRect().width + gap;
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

// setas
function updateArrows(){
  const max = view.scrollWidth - view.clientWidth - 1;
  btnL.disabled = view.scrollLeft <= 0;
  btnR.disabled = view.scrollLeft >= max;
}
btnL.addEventListener('click', ()=> view.scrollBy({left: -stepSize(), behavior:'smooth'}));
btnR.addEventListener('click', ()=> view.scrollBy({left:  stepSize(), behavior:'smooth'}));
view.addEventListener('scroll', ()=> updateArrows());

// arraste com mouse/touch (opcional)
let isDown=false, startX=0, startLeft=0;
view.addEventListener('pointerdown', e => {
  if (e.target.closest('a')) return; // não captura se clicou num link
  isDown = true;
  startX = e.clientX;
  startLeft = view.scrollLeft;
  view.setPointerCapture(e.pointerId);
  stopAuto();
});

view.addEventListener('pointermove', e=>{ if(!isDown) return; view.scrollLeft = startLeft - (e.clientX-startX); });
view.addEventListener('pointerup',   ()=>{ isDown=false; startAuto(); });
view.addEventListener('pointercancel',()=>{ isDown=false; });

// auto-scroll
let timer=null;
function startAuto(){
  stopAuto();
  timer = setInterval(()=>{
    const max = view.scrollWidth - view.clientWidth - 1;
    if(view.scrollLeft >= max){ view.scrollTo({left:0, behavior:'smooth'}); }
    else { view.scrollBy({left: stepSize(), behavior:'smooth'}); }
  }, 3500);
}
function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }

// pausa autoplay quando fora de vista/hover
view.addEventListener('mouseenter', stopAuto);
view.addEventListener('mouseleave', startAuto);
document.addEventListener('visibilitychange', ()=> document.hidden ? stopAuto() : startAuto());

// start
document.addEventListener('DOMContentLoaded', load);
