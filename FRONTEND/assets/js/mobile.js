/* EFM Portal — Mobile sidebar toggle */
(function () {
  function init() {
    var sidebar  = document.querySelector('.sidebar');
    var header   = document.querySelector('.header');
    if (!sidebar || !header) return;

    /* ── Sidebar overlay ── */
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);

    /* ── Close button inside sidebar ── */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'sidebar-close';
    closeBtn.title = 'Tutup menu';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', closeSidebar);
    sidebar.style.position = 'fixed';
    sidebar.insertBefore(closeBtn, sidebar.firstChild);

    /* ── Hamburger button in header ── */
    var ham = document.createElement('button');
    ham.className = 'hamburger';
    ham.title = 'Buka menu';
    ham.setAttribute('aria-label', 'Toggle sidebar');
    ham.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    ham.addEventListener('click', openSidebar);
    header.insertBefore(ham, header.firstChild);

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    /* Close sidebar when a nav link is clicked (mobile navigation) */
    sidebar.querySelectorAll('a.nav-sub-item, a.nav-item').forEach(function (a) {
      if (a.getAttribute('href') && a.getAttribute('href') !== '#') {
        a.addEventListener('click', function () {
          if (window.innerWidth <= 1024) closeSidebar();
        });
      }
    });

    /* Handle resize: reset body overflow if sidebar remains open on desktop */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
