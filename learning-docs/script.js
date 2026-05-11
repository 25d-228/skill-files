(function () {
  function deactivateAll() {
    document.querySelectorAll('.tok.active').forEach(function (t) {
      t.classList.remove('active');
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.tip')) return;

    var tok = e.target.closest('.tok');
    if (!tok) {
      deactivateAll();
      return;
    }

    var wasActive = tok.classList.contains('active');
    deactivateAll();
    if (!wasActive) tok.classList.add('active');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') deactivateAll();
  });
})();
