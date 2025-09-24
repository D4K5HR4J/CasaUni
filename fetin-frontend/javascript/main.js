// js/home.js
(function () {
  const attachBRLMask = (el) => {
    if (!el) return;

    // Formata a partir dos dígitos
    const formatDigitsToBRL = (digits) => {
      const d = String(digits || '').replace(/\D/g, '');
      if (!d) return ''; // deixa vazio para mostrar placeholder
      const cents = d.slice(-2).padStart(2, '0');
      const ints  = d.slice(0, -2) || '0';
      const intsFmt = Number(ints).toLocaleString('pt-BR'); // milhar
      return 'R$' + intsFmt + ',' + cents;                  // sem espaço
    };

    // Reaplica a máscara a cada digitação/colar/apagar
    const apply = () => {
      const digits = (el.value || '').replace(/\D/g, '');
      const masked = formatDigitsToBRL(digits);
      el.value = masked;
      // mantém o cursor no fim (UX melhor em máscaras de moeda)
      const len = el.value.length;
      requestAnimationFrame(() => el.setSelectionRange(len, len));
    };

    el.addEventListener('input', apply);
    el.addEventListener('blur', apply);
    el.addEventListener('focus', () => {
      const len = el.value.length;
      requestAnimationFrame(() => el.setSelectionRange(len, len));
    });

    // inicializa se vier com valor
    if (el.value && /\d/.test(el.value)) apply();
  };

  // aplica máscara (somente se não for type="number")
  const minEl = document.querySelector('input[name="precoMin"]');
  const maxEl = document.querySelector('input[name="precoMax"]');
  if (minEl && minEl.type !== 'number') attachBRLMask(minEl);
  if (maxEl && maxEl.type !== 'number') attachBRLMask(maxEl);

  /* ===== Submit do formulário ===== */
  const form = document.getElementById('filtro-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const bairro = (fd.get('bairro') || '').trim();

    // Converte "R$1.234,56" para número em REAIS (inteiro): 1234
    // (pega os dígitos, divide por 100 e trunca)
    const parseMaskedToReaisInt = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return Math.floor(Number(digits) / 100);
    };

    let precoMin = parseMaskedToReaisInt(fd.get('precoMin'));
    let precoMax = parseMaskedToReaisInt(fd.get('precoMax'));

    // corrige inversão se ambos preenchidos
    if (precoMin !== '' && precoMax !== '' && precoMin > precoMax) {
      [precoMin, precoMax] = [precoMax, precoMin];
    }

    const qs = new URLSearchParams();
    if (bairro) qs.set('bairro', bairro);
    if (precoMin !== '') qs.set('precoMin', String(precoMin));
    if (precoMax !== '') qs.set('precoMax', String(precoMax));

    try { sessionStorage.setItem('casauni:filtro', JSON.stringify({ bairro, precoMin, precoMax })); } catch {}

    const url = './imoveis.html' + (qs.toString() ? `?${qs}` : '');
    window.location.assign(url);
  });
   
  // ===== Envio do "Seja parceiro" + toast =====
    (function(){
      const form  = document.getElementById('partner-form');
      const toast = document.getElementById('toast');
      if (!form || !toast) return;

      const showToast = (msg, isError=false) => {
        toast.textContent = msg;
        toast.className = isError ? 'error show' : 'show';
        setTimeout(() => toast.classList.remove('show','error'), 3200);
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault(); // impede navegação para a página do Formspree

        const fd = new FormData(form);

        // honeypot: se preenchido é bot
        if (fd.get('website')) { showToast('Erro ao enviar.', true); return; }

        const endpoint = form.getAttribute('action') || '';
        if (!/^https?:\/\/formspree\.io\/f\//i.test(endpoint)) {
          showToast('Endpoint do Formspree inválido.', true);
          return;
        }

        const btn = form.querySelector('input[type="submit"], button[type="submit"]');
        const prevLabel = btn ? (btn.value || btn.textContent) : null;
        if (btn) { btn.disabled = true; if ('value' in btn) btn.value = 'Enviando...'; }

        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: fd
          });

          if (res.ok) {
            form.reset();
            showToast('Contato enviado! Em breve falamos com você.');
          } else {
            // Tenta ler a mensagem do Formspree
            let msg = 'Não foi possível enviar. Tente novamente.';
            try {
              const data = await res.json();
              if (data?.error) msg = data.error;
              if (data?.message) msg = data.message;
            } catch {}
            showToast(msg, true);
          }
        } catch (err) {
          showToast('Falha de conexão. Tente novamente.', true);
        } finally {
          if (btn) { btn.disabled = false; if ('value' in btn && prevLabel != null) btn.value = prevLabel; }
        }
      });
})();


})();
