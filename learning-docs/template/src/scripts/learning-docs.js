(function () {
  const MARGIN = 8;
  let popover = null;
  let activeTok = null;

  function ensurePopover() {
    if (popover) return popover;
    popover = document.createElement('div');
    popover.className = 'tip';
    popover.setAttribute('role', 'tooltip');
    popover.style.display = 'none';
    document.body.appendChild(popover);
    return popover;
  }

  function close() {
    if (popover) popover.style.display = 'none';
    if (activeTok) activeTok.setAttribute('aria-expanded', 'false');
    activeTok = null;
  }

  function buildContent(anno) {
    const clone = anno.cloneNode(true);
    const pres = clone.querySelectorAll('pre');

    if (pres.length === 0) {
      return clone.innerHTML;
    }

    const examplePre = pres[0];
    examplePre.parentNode.removeChild(examplePre);

    return (
      '<div class="tip-tabs">' +
        '<button class="tip-tab active" data-tab="explain">Explanation</button>' +
        '<button class="tip-tab" data-tab="example">Example</button>' +
      '</div>' +
      '<div class="tip-page tip-page-explain active">' + clone.innerHTML + '</div>' +
      '<div class="tip-page tip-page-example">' + examplePre.outerHTML + '</div>'
    );
  }

  function position(tip, tok) {
    tip.style.left = '0px';
    tip.style.top = '0px';

    const tokRect = tok.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tipRect = tip.getBoundingClientRect();
    const tipW = tipRect.width;
    const tipH = tipRect.height;

    let left = tokRect.left + tokRect.width / 2 - tipW / 2;
    let top = tokRect.bottom + 8;

    if (left < MARGIN) left = MARGIN;
    if (left + tipW > vw - MARGIN) left = vw - tipW - MARGIN;

    if (top + tipH > vh - MARGIN) {
      top = tokRect.top - tipH - 8;
      if (top < MARGIN) top = MARGIN;
    }

    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function openFor(tok) {
    const id = tok.dataset.tip;
    if (!id) return;
    const anno = document.querySelector('[data-anno="' + CSS.escape(id) + '"]');
    if (!anno) return;

    const tip = ensurePopover();
    tip.innerHTML = buildContent(anno);
    tip.dataset.kind = anno.dataset.kind || 'ident';
    tip.style.display = 'block';

    position(tip, tok);
    activeTok = tok;
    tok.setAttribute('aria-expanded', 'true');
  }

  function switchTab(tab) {
    const tip = tab.closest('.tip');
    if (!tip) return;
    const target = tab.dataset.tab;
    tip.querySelectorAll('.tip-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === target);
    });
    tip.querySelectorAll('.tip-page').forEach(p => {
      p.classList.toggle('active', p.classList.contains('tip-page-' + target));
    });
    if (activeTok) position(tip, activeTok);
  }

  document.addEventListener('click', e => {
    const tab = e.target.closest('.tip-tab');
    if (tab) {
      switchTab(tab);
      return;
    }

    if (e.target.closest('.tip')) return;

    const tok = e.target.closest('[data-tip]');
    if (!tok) {
      close();
      return;
    }

    if (tok === activeTok) {
      close();
      return;
    }

    openFor(tok);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // ----- Copy buttons -----------------------------------------------------

  const COPY_ICON_SVG =
    '<svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
  const CHECK_ICON_SVG =
    '<svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

  function injectCodeCopyButtons() {
    const pres = document.querySelectorAll('main pre.astro-code, main pre.shiki');
    pres.forEach(pre => {
      if (pre.closest('.annotations')) return;
      if (pre.querySelector('.copy-code-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn copy-code-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = COPY_ICON_SVG + CHECK_ICON_SVG;
      pre.appendChild(btn);
    });
  }

  function getCopyText(btn) {
    if (btn.dataset.copyText) return btn.dataset.copyText;
    if (btn.classList.contains('copy-code-btn')) {
      const pre = btn.closest('pre');
      if (!pre) return '';
      const code = pre.querySelector('code') || pre;
      return code.innerText.replace(/\s+$/, '');
    }
    return '';
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch {}
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
    return ok;
  }

  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    e.stopPropagation();
    const text = getCopyText(btn);
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (!ok) return;
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1400);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCodeCopyButtons);
  } else {
    injectCodeCopyButtons();
  }

  function reposition() {
    if (activeTok && popover && popover.style.display !== 'none') {
      position(popover, activeTok);
    }
  }

  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, { passive: true });
})();
