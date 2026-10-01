// ========================================
// RTV Blog — Notepad popup + Tag filter
// ========================================

(function () {
  var overlay = document.getElementById('overlay');
  var notepadBody = document.getElementById('notepad-body');
  var notepadTitle = document.getElementById('notepad-title');
  var npStatus = document.getElementById('np-status');
  var itemCount = document.getElementById('item-count');
  var tocList = document.getElementById('toc-list');
  var notepadToc = document.getElementById('notepad-toc');
  var postsCache = null;

  var previewContent = document.getElementById('preview-content');
  var previewThumb = document.getElementById('preview-thumb');
  var previewTitle = document.getElementById('preview-title');
  var previewExcerpt = document.getElementById('preview-excerpt');
  var previewEmpty = document.querySelector('.preview-empty');

  // ── 포스트 데이터 로드 (한 번만) ──
  function loadPosts(cb) {
    if (postsCache) return cb(postsCache);
    fetch('/api/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { postsCache = data; cb(data); })
      .catch(function () { cb([]); });
  }

  // ── 미리보기 표시 ──
  function showPreview(slug) {
    if (!previewContent) return;
    loadPosts(function (posts) {
      var post = posts.find(function (p) { return p.slug === slug; });
      if (!post) return;

      var tmp = document.createElement('div');
      tmp.innerHTML = post.body;
      var firstH2 = tmp.querySelector('h2');
      var firstP = tmp.querySelector('p');

      previewTitle.textContent = post.title;
      previewExcerpt.textContent = firstP ? firstP.textContent.substring(0, 200) : '';

      if (post.thumbnail) {
        previewThumb.style.backgroundImage = 'url(' + post.thumbnail + ')';
        previewThumb.style.display = '';
      } else {
        previewThumb.style.display = 'none';
      }

      previewEmpty.style.display = 'none';
      previewContent.style.display = '';

      document.querySelectorAll('.file-row').forEach(function (r) {
        r.classList.toggle('file-row-selected', r.dataset.slug === slug);
      });
    });
  }

  // ── 메모장 팝업 열기 ──
  function openPost(slug) {
    loadPosts(function (posts) {
      var post = posts.find(function (p) { return p.slug === slug; });
      if (!post) return;

      notepadTitle.textContent = post.title + '.txt - Notepad';
      var tagsHtml = (post.tags || []).map(function(t) {
        return '<span class="tag-chip">' + t + '</span>';
      }).join(' ');
      notepadBody.innerHTML =
        '<h1>' + post.title + '</h1>' +
        '<div class="meta">' + post.date + ' · ' + tagsHtml + '</div>' +
        '<div class="body">' + post.body + '</div>';

      var lines = post.body.split('\n').length;
      npStatus.textContent = 'Ln ' + lines + ', Col 1';

      buildTOC();
      overlay.classList.add('open');
    });
  }

  function buildTOC() {
    tocList.innerHTML = '';
    var headings = notepadBody.querySelectorAll('.body h2');
    if (headings.length === 0) {
      notepadToc.style.display = 'none';
      return;
    }
    notepadToc.style.display = 'block';
    headings.forEach(function (h, i) {
      h.id = 'heading-' + i;
      var li = document.createElement('li');
      li.className = 'toc-item';
      li.textContent = h.textContent.replace(/^## /, '');
      li.addEventListener('click', function () {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocList.appendChild(li);
    });
  }

  function closePost() {
    overlay.classList.remove('open');
    notepadToc.style.display = 'none';
  }

  // ── 태그 필터링 ──
  function filterByTag(tag) {
    var rows = document.querySelectorAll('.file-row[data-tags]');
    var cards = document.querySelectorAll('.post-card[data-tags]');
    var all = Array.prototype.slice.call(rows).concat(Array.prototype.slice.call(cards));
    var visibleCount = 0;

    all.forEach(function (el) {
      var tags = (el.dataset.tags || '').split(',');
      if (!tag || tags.indexOf(tag) !== -1) {
        el.style.display = '';
        visibleCount++;
      } else {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('.tag-filter').forEach(function (btn) {
      btn.classList.toggle('tag-active', btn.dataset.tag === tag);
    });

    if (itemCount) {
      itemCount.textContent = visibleCount + ' items' + (tag ? ' — [' + tag + ']' : '');
    }
  }

  function getTagFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('tag') || '';
  }

  // ── 이벤트 ──

  // 싱글클릭 → 미리보기 / 더블클릭 → 메모장 팝업
  var clickTimer = null;
  var isTouchDevice = 'ontouchstart' in window;

  document.addEventListener('click', function (e) {
    var tagLink = e.target.closest('.tag-filter');
    if (tagLink) {
      var onBlogPage = document.querySelector('.file-row[data-tags]') || document.querySelector('.post-card[data-tags]');
      if (!onBlogPage) return;
      e.preventDefault();
      var tag = tagLink.dataset.tag;
      var currentTag = getTagFromURL();
      var newTag = (currentTag === tag) ? '' : tag;

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
      var slug = item.dataset.slug;

      if (isTouchDevice) {
        var alreadySelected = item.classList.contains('file-row-selected');
        if (alreadySelected) {
          openPost(slug);
        } else {
          showPreview(slug);
        }
      } else {
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
          openPost(slug);
        } else {
          clickTimer = setTimeout(function () {
            clickTimer = null;
            showPreview(slug);
          }, 250);
        }
      }
      return;
    }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePost();
  });

  document.getElementById('notepad-close').addEventListener('click', closePost);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePost();
  });

  var initialTag = getTagFromURL();
  if (initialTag) {
    filterByTag(initialTag);
  }

})();
