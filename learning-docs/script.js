(function () {
  var MARGIN = 8;

  function clearInlinePositioning(tip) {
    tip.style.left = '';
    tip.style.right = '';
    tip.style.transform = '';
  }

  function resetTabs(tip) {
    tip.querySelectorAll('.tip-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-target') === 'explain');
    });
    tip.querySelectorAll('.tip-page').forEach(function (p) {
      p.classList.toggle('active', p.classList.contains('tip-page-explain'));
    });
  }

  function deactivateAll() {
    document.querySelectorAll('.tok.active').forEach(function (t) {
      t.classList.remove('active');
      var tip = t.querySelector('.tip');
      if (tip) {
        clearInlinePositioning(tip);
        resetTabs(tip);
      }
    });
  }

  function positionTip(tok) {
    var tip = tok.querySelector('.tip');
    if (!tip) return;

    clearInlinePositioning(tip);
    var rect = tip.getBoundingClientRect();
    var vw = window.innerWidth;
    var shift = 0;

    if (rect.left < MARGIN) {
      shift = MARGIN - rect.left;
    } else if (rect.right > vw - MARGIN) {
      shift = (vw - MARGIN) - rect.right;
    }

    if (shift !== 0) {
      var base = window.getComputedStyle(tip).transform;
      if (base && base !== 'none') {
        tip.style.transform = 'translateX(' + shift + 'px) ' + base;
      } else {
        tip.style.transform = 'translateX(' + shift + 'px)';
      }
    }
  }

  function switchTab(tab) {
    var tip = tab.closest('.tip');
    var target = tab.getAttribute('data-target');
    if (!tip || !target) return;

    tip.querySelectorAll('.tip-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-target') === target);
    });
    tip.querySelectorAll('.tip-page').forEach(function (p) {
      p.classList.toggle('active', p.classList.contains('tip-page-' + target));
    });

    var tok = tip.closest('.tok');
    if (tok) positionTip(tok);
  }

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.tip-tab');
    if (tab) {
      switchTab(tab);
      return;
    }

    if (e.target.closest('.tip')) return;

    var tok = e.target.closest('.tok');
    if (!tok) {
      deactivateAll();
      return;
    }

    var wasActive = tok.classList.contains('active');
    deactivateAll();
    if (!wasActive) {
      tok.classList.add('active');
      positionTip(tok);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') deactivateAll();
  });

  window.addEventListener('resize', function () {
    var active = document.querySelector('.tok.active');
    if (active) positionTip(active);
  });
})();
