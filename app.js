// ========================================
// RTV Blog — SPA 라우터 & 렌더링
// ========================================

(function () {
  const recentContainer = document.getElementById('recent-posts');
  const allContainer = document.getElementById('all-posts');
  const postContent = document.getElementById('post-content');
  const statusInfo = document.getElementById('status-info');
  const winTitle = document.querySelector('.win-title');

  const EMPTY = '<p class="empty">( empty )</p>';

  function renderRecentPosts() {
    if (!POSTS.length) { recentContainer.innerHTML = EMPTY; return; }
    recentContainer.innerHTML = POSTS.slice(0, 6).map(post => `
      <div class="post-card" data-id="${post.id}">
        <div class="card-line">
          <span class="card-date">${post.date}</span>
          <span class="card-title">${post.title}</span>
          <span class="card-tag">${post.tag}</span>
        </div>
      </div>
    `).join('');
  }

  function renderAllPosts() {
    if (!POSTS.length) { allContainer.innerHTML = EMPTY; return; }
    allContainer.innerHTML = POSTS.map(post => `
      <div class="post-list-item" data-id="${post.id}">
        <span class="list-date">${post.date}</span>
        <span class="list-title">${post.title}</span>
        <span class="list-tag">${post.tag}</span>
      </div>
    `).join('');
  }

  function renderPost(id) {
    const post = POSTS.find(p => p.id === id);
    if (!post) return;

    postContent.innerHTML = `
      <div class="notepad-content">
        <h1>${post.title}</h1>
        <div class="meta">${post.date} · ${post.tag}</div>
        <div class="body">${post.body}</div>
      </div>
    `;

    // 상태바 업데이트
    const lines = post.body.split('\n').length;
    statusInfo.textContent = 'Ln ' + lines + ', Col 1';
    winTitle.textContent = 'RTV — ' + post.title + '.txt';
  }

  // ── SPA 라우터 ──
  function navigate() {
    const hash = location.hash.slice(1) || 'home';

    if (hash.startsWith('post/')) {
      const postId = hash.replace('post/', '');
      showPage('post');
      renderPost(postId);
      document.querySelector('.win-body').scrollTop = 0;
      return;
    }

    showPage(hash);

    // 타이틀바 & 상태바 업데이트
    const titles = { home: 'blog.txt', blog: 'archive.txt', about: 'about.txt' };
    winTitle.textContent = 'RTV — ' + (titles[hash] || 'blog.txt');
    statusInfo.textContent = 'Ln 1, Col 1';
    document.querySelector('.win-body').scrollTop = 0;
  }

  function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + name);
    if (target) target.classList.add('active');

    document.querySelectorAll('.win-menu').forEach(link => {
      link.classList.toggle('active', link.dataset.page === name);
    });
  }

  // ── 이벤트 ──
  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-id]');
    if (card) {
      location.hash = '#post/' + card.dataset.id;
      return;
    }

    const pageLink = e.target.closest('[data-page]');
    if (pageLink) {
      location.hash = '#' + pageLink.dataset.page;
    }
  });

  window.addEventListener('hashchange', navigate);

  // ── 초기화 ──
  renderRecentPosts();
  renderAllPosts();
  navigate();
})();
