document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-active');
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-active');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Modern Dialog Management with Light-Dismiss Fallback
  const modalLead = document.getElementById('modalLead');
  const modalPortal = document.getElementById('modalPortal');
  const modalArticle = document.getElementById('modalArticle');
  const modalLeadTitle = document.getElementById('modalLeadTitle');
  const modalLeadServiceInput = document.getElementById('modalLeadService');
  const modalArticleTitle = document.getElementById('modalArticleTitle');
  const modalArticleCategory = document.getElementById('modalArticleCategory');
  const modalArticleTime = document.getElementById('modalArticleTime');
  const modalArticleDate = document.getElementById('modalArticleDate');
  const modalArticleBody = document.getElementById('modalArticleBody');
  const modalArticlePermalink = document.getElementById('modalArticlePermalink');

  const setupDialog = (dialog) => {
    if (!dialog) return;

    // Light-dismiss fallback for browsers that do not yet support closedby="any"
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }

    // Close buttons inside dialog
    dialog.querySelectorAll('[data-dialog-close]').forEach(btn => {
      btn.addEventListener('click', () => dialog.close());
    });
  };

  setupDialog(modalLead);
  setupDialog(modalPortal);
  setupDialog(modalArticle);

  // Article Reader Modal Opener
  const openArticleModal = (articleId) => {
    if (!modalArticle || typeof BLOG_ARTICLES === 'undefined') return;
    const article = BLOG_ARTICLES.find(a => a.id === articleId);
    if (!article) return;

    if (modalArticleTitle) modalArticleTitle.textContent = article.title;
    if (modalArticleCategory) modalArticleCategory.textContent = article.categoryLabel;
    if (modalArticleTime) modalArticleTime.textContent = '⏱️ ' + article.readingTime + ' чтения';
    if (modalArticleDate) modalArticleDate.textContent = article.date;
    if (modalArticleBody) modalArticleBody.innerHTML = article.content;
    if (modalArticlePermalink) modalArticlePermalink.href = `blog.html#${article.id}`;

    modalArticle.showModal();
  };

  document.querySelectorAll('[data-open-article]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = btn.dataset.openArticle;
      openArticleModal(articleId);
    });
  });

  // Blog Category Filters
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const blogCards = document.querySelectorAll('#mainBlogGrid .blog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      blogCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Trigger modal open from buttons with dataset
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.openModal;
      const serviceName = btn.dataset.serviceName || 'Комплексная консультация';

      if (target === 'lead' && modalLead) {
        if (modalLeadTitle) {
          modalLeadTitle.textContent = btn.dataset.modalTitle || 'Оставить заявку';
        }
        if (modalLeadServiceInput) {
          modalLeadServiceInput.value = serviceName;
        }
        modalLead.showModal();
      } else if (target === 'portal' && modalPortal) {
        modalPortal.showModal();
      }
    });
  });

  // 3. Tariffs Switcher for Kazakhstan (Annual vs Monthly in KZT ₸)
  const billingToggle = document.getElementById('billingToggle');
  const tariffPrices = document.querySelectorAll('[data-price-monthly][data-price-yearly]');
  const tariffPeriods = document.querySelectorAll('.tariff-card__period');

  if (billingToggle) {
    const updateTariffs = () => {
      const isYearly = billingToggle.checked;
      tariffPrices.forEach(el => {
        const price = isYearly ? el.dataset.priceYearly : el.dataset.priceMonthly;
        el.textContent = Number(price).toLocaleString('ru-RU') + ' ₸';
      });
      tariffPeriods.forEach(el => {
        el.textContent = isYearly ? 'в месяц при оплате за год' : 'в месяц при помесячной оплате';
      });
    };

    billingToggle.addEventListener('change', updateTariffs);
    updateTariffs();
  }

  // 4. Interactive Calculator for Kazakhstan (KZT ₸)
  const calcTeamRadios = document.querySelectorAll('input[name="calc_team"]');
  const calcTypeRadios = document.querySelectorAll('input[name="calc_type"]');
  const calcCheckboxes = document.querySelectorAll('input[name="calc_addons"]');
  const calcPriceDisplay = document.getElementById('calcPrice');
  const calcDaysDisplay = document.getElementById('calcDays');
  const calcPlanDisplay = document.getElementById('calcPlan');

  function calculateEstimate() {
    let basePrice = 220000;
    let days = 5;
    let recommendedPlan = 'Базовый (до 5 польз.)';

    // Team size factor
    const selectedTeam = document.querySelector('input[name="calc_team"]:checked')?.value || 'small';
    if (selectedTeam === 'micro') {
      basePrice = 160000;
      days = 4;
      recommendedPlan = 'Базовый (до 5 польз.)';
    } else if (selectedTeam === 'small') {
      basePrice = 280000;
      days = 7;
      recommendedPlan = 'Стандартный (до 50 польз.)';
    } else if (selectedTeam === 'medium') {
      basePrice = 520000;
      days = 14;
      recommendedPlan = 'Профессиональный (до 100 польз.)';
    } else if (selectedTeam === 'large') {
      basePrice = 980000;
      days = 25;
      recommendedPlan = 'Энтерпрайз или Коробочная версия';
    }

    // Deployment type factor
    const selectedType = document.querySelector('input[name="calc_type"]:checked')?.value || 'cloud';
    if (selectedType === 'box') {
      basePrice += 250000;
      days += 5;
    }

    // Addons
    calcCheckboxes.forEach(cb => {
      if (cb.checked) {
        basePrice += parseInt(cb.value, 10) || 0;
        days += parseInt(cb.dataset.days, 10) || 0;
      }
    });

    if (calcPriceDisplay) {
      calcPriceDisplay.textContent = 'от ' + basePrice.toLocaleString('ru-RU') + ' ₸';
    }
    if (calcDaysDisplay) {
      calcDaysDisplay.textContent = 'от ' + days + ' раб. дней';
    }
    if (calcPlanDisplay) {
      calcPlanDisplay.textContent = recommendedPlan;
    }
  }

  calcTeamRadios.forEach(r => r.addEventListener('change', calculateEstimate));
  calcTypeRadios.forEach(r => r.addEventListener('change', calculateEstimate));
  calcCheckboxes.forEach(c => c.addEventListener('change', calculateEstimate));
  calculateEstimate();

  // 5. Toast Notification System
  const showToast = (message) => {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      toast.innerHTML = `
        <svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span class="toast-msg"></span>
      `;
      document.body.appendChild(toast);
    }

    toast.querySelector('.toast-msg').textContent = message;
    toast.classList.add('is-visible');

    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4500);
  };

  // 6. Form Handlers
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const phoneInput = form.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value.trim().length < 8) {
        alert('Пожалуйста, введите корректный номер телефона Республики Казахстан.');
        phoneInput.focus();
        return;
      }

      const parentDialog = form.closest('dialog');
      if (parentDialog) {
        parentDialog.close();
      }

      showToast('Рахмет! Ваша заявка принята. Наш эксперт свяжется с вами в течение 15 минут.');
      form.reset();
    });
  });

  // 7. Cookie Banner Management
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');

  if (cookieBanner && cookieAcceptBtn) {
    if (!localStorage.getItem('b24_kz_cookie_accepted')) {
      setTimeout(() => {
        cookieBanner.classList.add('is-active');
      }, 1000);
    }

    cookieAcceptBtn.addEventListener('click', () => {
      localStorage.setItem('b24_kz_cookie_accepted', 'true');
      cookieBanner.classList.remove('is-active');
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
      // Force 7 prefix
      if (val[0] !== '7') {
        val = '7' + val;
      }
      // Kazakhstan mobile operators start with 7
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
});
