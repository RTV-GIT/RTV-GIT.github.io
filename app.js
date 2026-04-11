// ========================================
// RTV Scrawl Blog — SPA 라우터 & 렌더링
// ========================================

(function () {
  const recentContainer = document.getElementById('recent-posts');
  const allContainer = document.getElementById('all-posts');
  const postContent = document.getElementById('post-content');

  const EMPTY = '<p class="empty">...</p>';

  function renderRecentPosts() {
    if (!POSTS.length) { recentContainer.innerHTML = EMPTY; return; }
    recentContainer.innerHTML = POSTS.slice(0, 4).map(post => `
      <article class="post-card" data-id="${post.id}">
        <span class="tag">${post.tag}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <span class="date">${post.date}</span>
      </article>
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

  // ── 글 상세 렌더 ──
  function renderPost(id) {
    const post = POSTS.find(p => p.id === id);
    if (!post) return;

    postContent.innerHTML = `
      <h1>${post.title}</h1>
      <div class="meta">${post.date} · ${post.tag}</div>
      <div class="body">${post.body}</div>
    `;
  }

  // ── SPA 라우터 ──
  function navigate() {
    const hash = location.hash.slice(1) || 'home';

    // 글 상세
    if (hash.startsWith('post/')) {
      const postId = hash.replace('post/', '');
      showPage('post');
      renderPost(postId);
      window.scrollTo(0, 0);
      return;
    }

    showPage(hash);
    window.scrollTo(0, 0);
  }

  function showPage(name) {
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });

    const target = document.getElementById('page-' + name);
    if (target) target.classList.add('active');

    // nav 활성화
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === name);
    });
  }

  // ── 이벤트 ──
  // 카드/리스트 클릭 → 글 상세
  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-id]');
    if (card) {
      location.hash = '#post/' + card.dataset.id;
    }

    const pageLink = e.target.closest('[data-page]');
    if (pageLink && !e.target.closest('[data-id]')) {
      location.hash = '#' + pageLink.dataset.page;
    }
  });

  window.addEventListener('hashchange', navigate);

  // ── 초기화 ──
  renderRecentPosts();
  renderAllPosts();
  navigate();
})();
