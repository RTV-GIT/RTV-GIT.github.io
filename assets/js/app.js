// ========================================
// RTV Blog — Notepad popup controller
// ========================================

(function () {
  var overlay = document.getElementById('overlay');
  var notepadBody = document.getElementById('notepad-body');
  var notepadTitle = document.getElementById('notepad-title');
  var npStatus = document.getElementById('np-status');
  var postsCache = null;

  // ── 포스트 데이터 로드 (한 번만) ──
  function loadPosts(cb) {
    if (postsCache) return cb(postsCache);
    fetch('/api/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { postsCache = data; cb(data); })
      .catch(function () { cb([]); });
  }

  // ── 메모장 팝업 열기 ──
  function openPost(slug) {
    loadPosts(function (posts) {
      var post = posts.find(function (p) { return p.slug === slug; });
      if (!post) return;

      notepadTitle.textContent = post.title + '.txt - Notepad';
      notepadBody.innerHTML =
        '<h1>' + post.title + '</h1>' +
        '<div class="meta">' + post.date + ' · ' + post.tag + '</div>' +
        '<div class="body">' + post.body + '</div>';

      var lines = post.body.split('\n').length;
      npStatus.textContent = 'Ln ' + lines + ', Col 1';

      overlay.classList.add('open');
    });
  }

  function closePost() {
    overlay.classList.remove('open');
  }

  // ── 이벤트 ──

  // 파일 클릭 → 팝업
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-slug]');
    if (item) {
      e.preventDefault();
      openPost(item.dataset.slug);
    }
  });

  // 오버레이 배경 클릭 → 닫기
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePost();
  });

  // X 버튼 → 닫기
  document.getElementById('notepad-close').addEventListener('click', closePost);

  // ESC → 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePost();
  });
})();
