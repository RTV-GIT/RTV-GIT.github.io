// ========================================
// RTV Blog — Explorer + Notepad popup
// ========================================

(function () {
  const recentContainer = document.getElementById('recent-posts');
  const allContainer = document.getElementById('all-posts');
  const overlay = document.getElementById('overlay');
  const notepad = document.getElementById('notepad');
  const notepadBody = document.getElementById('notepad-body');
  const notepadTitle = document.getElementById('notepad-title');
  const npStatus = document.getElementById('np-status');
  const addressPath = document.getElementById('address-path');
  const itemCount = document.getElementById('item-count');

  const EMPTY = '<p class="empty">( empty )</p>';

  // ── 태그 목록 렌더 ──
  function renderTags(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const tags = [...new Set(POSTS.map(p => p.tag))];
    container.innerHTML = tags.map(t =>
      `<span class="sidebar-item" style="cursor:default">📁 ${t}</span>`
    ).join('');
  }

  // ── Home: 파일 아이콘 그리드 ──
  function renderRecentPosts() {
    if (!POSTS.length) { recentContainer.innerHTML = EMPTY; return; }
    recentContainer.innerHTML = POSTS.slice(0, 12).map(post => `
      <div class="file-item" data-id="${post.id}">
        <span class="file-icon">📄</span>
        <span class="file-name">${post.title}.txt</span>
      </div>
    `).join('');
  }

  // ── Blog: 파일 리스트 ──
  function renderAllPosts() {
    if (!POSTS.length) { allContainer.innerHTML = EMPTY; return; }
    allContainer.innerHTML = POSTS.map(post => `
      <div class="file-row" data-id="${post.id}">
        <span class="row-icon">📄</span>
        <span class="row-name">${post.title}.txt</span>
        <span class="row-date">${post.date}</span>
        <span class="row-type">${post.tag}</span>
      </div>
    `).join('');
  }

  // ── 메모장 팝업 열기 ──
  function openPost(id) {
    const post = POSTS.find(p => p.id === id);
    if (!post) return;

    notepadTitle.textContent = post.title + '.txt - Notepad';
    notepadBody.innerHTML = `
      <h1>${post.title}</h1>
      <div class="meta">${post.date} · ${post.tag}</div>
      <div class="body">${post.body}</div>
    `;

    const lines = post.body.split('\n').length;
    npStatus.textContent = 'Ln ' + lines + ', Col 1';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePost() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── 페이지 라우팅 ──
  function navigate() {
    const hash = location.hash.slice(1) || 'home';

    if (hash.startsWith('post/')) {
      openPost(hash.replace('post/', ''));
      return;
    }

    closePost();
    showPage(hash);

    const paths = {
      home: 'C:\\Users\\RTV\\Blog',
      blog: 'C:\\Users\\RTV\\Blog\\Archive',
      about: 'C:\\Users\\RTV\\Blog\\About'
    };
    addressPath.textContent = paths[hash] || paths.home;
    itemCount.textContent = hash === 'blog'
      ? POSTS.length + ' items'
      : hash === 'home'
        ? Math.min(POSTS.length, 12) + ' items'
        : '1 item';
  }

  function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + name);
    if (target) target.classList.add('active');

    document.querySelectorAll('.explorer-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === name);
    });
  }

  // ── 이벤트 ──

  // 오버레이 배경 클릭 → 닫기
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      location.hash = '#' + (document.querySelector('.explorer-tab.active')?.dataset.page || 'home');
    }
  });

  // 닫기 버튼
  document.getElementById('notepad-close').addEventListener('click', function () {
    location.hash = '#' + (document.querySelector('.explorer-tab.active')?.dataset.page || 'home');
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      location.hash = '#' + (document.querySelector('.explorer-tab.active')?.dataset.page || 'home');
    }
  });

  // 파일 클릭 → 팝업
  document.addEventListener('click', function (e) {
    const item = e.target.closest('[data-id]');
    if (item) {
      location.hash = '#post/' + item.dataset.id;
      return;
    }

    const pageLink = e.target.closest('[data-page]');
    if (pageLink) {
      e.preventDefault();
      location.hash = '#' + pageLink.dataset.page;
    }
  });

  window.addEventListener('hashchange', navigate);

  // ── 초기화 ──
  renderRecentPosts();
  renderAllPosts();
  renderTags('sidebar-tags');
  renderTags('sidebar-tags-blog');
  navigate();
})();
