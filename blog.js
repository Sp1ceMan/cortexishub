document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-active');
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-active');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Elements Reference
  const blogGrid = document.getElementById('blogGrid');
  const blogSearchInput = document.getElementById('blogSearchInput');
  const filterBtns = document.querySelectorAll('#blogFilters .blog-filter-btn');
  const noResults = document.getElementById('noResults');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  const articleView = document.getElementById('articleView');
  const backToBlogBtn = document.getElementById('backToBlogBtn');
  const copyArticleLinkBtn = document.getElementById('copyArticleLinkBtn');
  const articleViewCategory = document.getElementById('articleViewCategory');
  const articleViewTime = document.getElementById('articleViewTime');
  const articleViewDate = document.getElementById('articleViewDate');
  const articleViewTitle = document.getElementById('articleViewTitle');
  const articleViewContent = document.getElementById('articleViewContent');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  let currentCategory = 'all';
  let searchQuery = '';

  const showToast = (message) => {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3500);
  };

  // 3. Render Cards in Grid
  const renderArticles = () => {
    if (!blogGrid || typeof BLOG_ARTICLES === 'undefined') return;

    const query = searchQuery.trim().toLowerCase();
    const filtered = BLOG_ARTICLES.filter(item => {
      const matchCategory = currentCategory === 'all' || item.category === currentCategory;
      const matchSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      blogGrid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    blogGrid.innerHTML = filtered.map(item => `
      <article class="blog-card" data-category="${item.category}" data-article-id="${item.id}">
        <div class="blog-card__header-graphic">
          <div class="blog-card__icon-badge">
            ${item.icon || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>'}
          </div>
          <span class="blog-card__time">⏱️ ${item.readingTime} чтения</span>
        </div>
        <div class="blog-card__body">
          <span class="blog-card__category">${item.categoryLabel}</span>
          <h3 class="blog-card__title">${item.title}</h3>
          <p class="blog-card__excerpt">${item.excerpt}</p>
          <div class="blog-card__tags">
            ${item.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
          </div>
          <div class="blog-card__footer">
            <span class="blog-card__date">${item.date}</span>
            <button type="button" class="blog-card__link" data-read-article="${item.id}">
              Читать статью →
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click listeners to generated cards
    blogGrid.querySelectorAll('[data-read-article]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const articleId = btn.dataset.readArticle;
        displayArticle(articleId, true);
      });
    });

    blogGrid.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        const articleId = card.dataset.articleId;
        displayArticle(articleId, true);
      });
    });
  };

  // 4. Display Single Article in Reader Mode
  const displayArticle = (articleId, pushState = false) => {
    if (typeof BLOG_ARTICLES === 'undefined') return;
    const article = BLOG_ARTICLES.find(a => a.id === articleId || a.slug === articleId);
    if (!article || !articleView) return;

    articleViewCategory.textContent = article.categoryLabel;
    articleViewTime.textContent = '⏱️ ' + article.readingTime + ' чтения';
    articleViewDate.textContent = article.date;
    articleViewTitle.textContent = article.title;
    articleViewContent.innerHTML = article.content;

    articleView.classList.add('is-active');

    if (pushState) {
      window.history.pushState({ articleId: article.id }, '', `#${article.id}`);
    }

    // Scroll smoothly to article view
    articleView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeArticleView = () => {
    if (!articleView) return;
    articleView.classList.remove('is-active');
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    if (blogGrid) {
      blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (backToBlogBtn) {
    backToBlogBtn.addEventListener('click', closeArticleView);
  }

  if (copyArticleLinkBtn) {
    copyArticleLinkBtn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showToast('Ссылка на статью скопирована в буфер обмена!');
        });
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Ссылка на статью скопирована в буфер обмена!');
      }
    });
  }

  // 5. Filtering and Search Listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      currentCategory = btn.dataset.filter;
      renderArticles();
    });
  });

  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderArticles();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      if (blogSearchInput) blogSearchInput.value = '';
      currentCategory = 'all';
      filterBtns.forEach((b, idx) => {
        b.classList.toggle('is-active', idx === 0);
        b.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      });
      renderArticles();
    });
  }

  // 6. Check Initial URL Hash or Params for Direct Article Linking
  const checkInitialHash = () => {
    const hash = window.location.hash.replace('#', '');
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id') || urlParams.get('article');
    const targetId = hash || paramId;

    if (targetId) {
      displayArticle(targetId, false);
    }
  };

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.articleId) {
      displayArticle(e.state.articleId, false);
    } else {
      closeArticleView();
    }
  });

  // 7. Dialog Management for Lead Modal
  const modalLead = document.getElementById('modalLead');
  if (modalLead) {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      modalLead.addEventListener('click', (event) => {
        if (event.target !== modalLead) return;
        const rect = modalLead.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) modalLead.close();
      });
    }

    modalLead.querySelectorAll('[data-dialog-close]').forEach(btn => {
      btn.addEventListener('click', () => modalLead.close());
    });
  }

  document.querySelectorAll('[data-open-modal="lead"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalLead) {
        const titleEl = document.getElementById('modalLeadTitle');
        const serviceInput = document.getElementById('modalLeadService');
        if (titleEl) titleEl.textContent = btn.dataset.modalTitle || 'Получить консультацию';
        if (serviceInput) serviceInput.value = btn.dataset.serviceName || 'Заявка из блога';
        modalLead.showModal();
      }
    });
  });

  const modalLeadForm = document.getElementById('modalLeadForm');
  if (modalLeadForm) {
    modalLeadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (modalLead) modalLead.close();
      showToast('Рахмет! Ваша заявка принята. Эксперт свяжется с вами в течение 15 минут.');
      modalLeadForm.reset();
    });
  }

  // 8. Phone Input Masking for Kazakhstan (+7 (7xx) xxx-xx-xx)
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 (7';
    });
    input.addEventListener('input', () => {
      let val = input.value.replace(/\D/g, '');
      if (val.length === 0) {
        input.value = '';
        return;
      }
      if (val[0] !== '7') {
        val = '7' + val;
      }
      let formatted = '+7 ';
      if (val.length > 1) {
        formatted += '(' + val.substring(1, 4);
      }
      if (val.length >= 5) {
        formatted += ') ' + val.substring(4, 7);
      }
      if (val.length >= 8) {
        formatted += '-' + val.substring(7, 9);
      }
      if (val.length >= 10) {
        formatted += '-' + val.substring(9, 11);
      }
      input.value = formatted;
    });
  });

  // Initial Boot
  renderArticles();
  checkInitialHash();
});
