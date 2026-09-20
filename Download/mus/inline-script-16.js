(function () {
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });
  // Failsafe timer to hide splash screen if anything delays
  setTimeout(function() {
      var sp = document.getElementById('splash-screen');
      if (sp && !sp.classList.contains('hide')) {
          sp.classList.add('hide');
          setTimeout(function() { if (sp && sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
      }
  }, 2200);
})();