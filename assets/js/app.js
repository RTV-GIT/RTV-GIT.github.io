// ========================================
// RTV Blog — Notepad popup + Tag filter
// ========================================

(function () {
  var overlay = document.getElementById('overlay');
  var notepadBody = document.getElementById('notepad-body');
  var notepadTitle = document.getElementById('notepad-title');
  var npStatus = document.getElementById('np-status');
  var itemCount = document.getElementById('item-count');
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

  // ── 태그 필터링 ──
  function filterByTag(tag) {
    var rows = document.querySelectorAll('.file-row[data-tag]');
    var items = document.querySelectorAll('.file-item[data-tag]');
    var all = Array.prototype.slice.call(rows).concat(Array.prototype.slice.call(items));
    var visibleCount = 0;

    all.forEach(function (el) {
      if (!tag || el.dataset.tag === tag) {
        el.style.display = '';
        visibleCount++;
      } else {
        el.style.display = 'none';
      }
    });

    // 태그 버튼 active 상태
    document.querySelectorAll('.tag-filter').forEach(function (btn) {
      btn.classList.toggle('tag-active', btn.dataset.tag === tag);
    });

    // 상태바 업데이트
    if (itemCount) {
      itemCount.textContent = visibleCount + ' items' + (tag ? ' — [' + tag + ']' : '');
    }
  }

  // URL 파라미터에서 태그 읽기
  function getTagFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('tag') || '';
  }

  // ── 이벤트 ──

  // 파일 클릭 → 팝업
  document.addEventListener('click', function (e) {
    // 태그 필터 클릭
    var tagLink = e.target.closest('.tag-filter');
    if (tagLink) {
      e.preventDefault();
      var tag = tagLink.dataset.tag;
      var currentTag = getTagFromURL();
      var newTag = (currentTag === tag) ? '' : tag; // 토글

      if (newTag) {
        history.replaceState(null, '', '?tag=' + encodeURIComponent(newTag));
      } else {
        history.replaceState(null, '', window.location.pathname);
      }
      filterByTag(newTag);
      return;
    }

    var item = e.target.closest('[data-slug]');
    if (item) {
      e.preventDefault();
      openPost(item.dataset.slug);
      return;
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

  // ── 초기화: URL에 tag 파라미터 있으면 필터 적용 ──
  var initialTag = getTagFromURL();
  if (initialTag) {
    filterByTag(initialTag);
  }

})();
