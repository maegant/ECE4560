// Operating-system selector tabs.
// Markup: <div class="os-tabs"> containing buttons [role="tab"][data-os] and
// matching .os-tab-panel[data-os] blocks. Without JavaScript every panel stays visible.
(function () {
  function detectOS() {
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform || navigator.userAgent || '';
    if (/mac/i.test(platform)) return 'macos';
    if (/^win|windows/i.test(platform)) return 'windows';
    if (/linux|x11/i.test(platform)) return 'linux';
    return null;
  }

  // Keep every tab group on the page showing the same operating system.
  function select(os) {
    document.querySelectorAll('.os-tabs').forEach(function (group) {
      group.querySelectorAll('[role="tab"]').forEach(function (tab) {
        var active = tab.dataset.os === os;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });
      group.querySelectorAll('.os-tab-panel').forEach(function (panel) {
        panel.hidden = panel.dataset.os !== os;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var groups = document.querySelectorAll('.os-tabs');
    if (!groups.length) return;

    groups.forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
      group.classList.add('is-ready');

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          select(tab.dataset.os);
        });
        tab.addEventListener('keydown', function (event) {
          var step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!step) return;
          var next = tabs[(i + step + tabs.length) % tabs.length];
          select(next.dataset.os);
          next.focus();
        });
      });
    });

    var detected = detectOS();
    var hasDetected = detected && groups[0].querySelector('[role="tab"][data-os="' + detected + '"]');
    select(hasDetected ? detected : groups[0].querySelector('[role="tab"]').dataset.os);
  });
})();
