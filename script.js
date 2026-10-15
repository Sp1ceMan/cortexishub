document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Active State, Click Highlight & ScrollSpy
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
  const allNavLinks = [...navLinks, ...mobileNavLinks];

  let isManualNav = false;
  let manualNavTimer = null;

  const setActiveNavLink = (targetHash) => {
    if (!targetHash) return;
    allNavLinks.forEach(link => {
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // Click handler for all navigation links (desktop and mobile)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        setActiveNavLink(href);
        isManualNav = true;
        clearTimeout(manualNavTimer);
        manualNavTimer = setTimeout(() => {
          isManualNav = false;
        }, 900);

        // If in mobile menu, close the drawer
        if (mobileNav && mobileNav.classList.contains('is-active')) {
          mobileNav.classList.remove('is-active');
          if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Burger button toggle
  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-active');
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // ScrollSpy: auto-highlight menu item as user scrolls through sections
  const spySections = Array.from(document.querySelectorAll('section[id]')).filter(sec => {
    const id = sec.getAttribute('id');
    return Array.from(allNavLinks).some(link => link.getAttribute('href') === `#${id}`);
  });

  const updateScrollSpy = () => {
    if (isManualNav || spySections.length === 0) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Bottom of the page: activate contacts
    if (scrollY + windowHeight >= documentHeight - 70) {
      setActiveNavLink('#contacts');
      return;
    }

    const scrollPos = scrollY + 120;
    let currentId = null;

    for (let i = 0; i < spySections.length; i++) {
      const sec = spySections[i];
      const top = sec.offsetTop;
      const height = sec.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
        break;
      }
    }

    if (currentId) {
      setActiveNavLink(`#${currentId}`);
    } else if (scrollY < 200) {
      // In hero area, clear active nav highlights
      allNavLinks.forEach(link => link.classList.remove('active'));
    }
  };

  let scrollThrottle = null;
  window.addEventListener('scroll', () => {
    if (!scrollThrottle) {
      scrollThrottle = requestAnimationFrame(() => {
        updateScrollSpy();
        scrollThrottle = null;
      });
    }
  }, { passive: true });

  // Initial check on page load if url has hash or page starts scrolled
  if (window.location.hash) {
    setActiveNavLink(window.location.hash);
  } else {
    updateScrollSpy();
  }

  // 2. Modern Dialog Management with Light-Dismiss Fallback
  const modalLead = document.getElementById('modalLead');
  const modalPortal = document.getElementById('modalPortal');
  const modalLeadTitle = document.getElementById('modalLeadTitle');
  const modalLeadServiceInput = document.getElementById('modalLeadService');

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
    let basePrice = 210000;
    let days = 6;
    let recommendedPlan = 'Стандартный (до 50 польз.)';

    // Team size factor
    const selectedTeam = document.querySelector('input[name="calc_team"]:checked')?.value || 'small';
    if (selectedTeam === 'micro') {
      basePrice = 120000;
      days = 3;
      recommendedPlan = 'Базовый (до 5 польз.)';
    } else if (selectedTeam === 'small') {
      basePrice = 210000;
      days = 6;
      recommendedPlan = 'Стандартный (до 50 польз.)';
    } else if (selectedTeam === 'medium') {
      basePrice = 380000;
      days = 12;
      recommendedPlan = 'Профессиональный (до 100 польз.)';
    } else if (selectedTeam === 'large') {
      basePrice = 690000;
      days = 20;
      recommendedPlan = 'Энтерпрайз или Коробочная версия';
    }

    // Deployment type factor
    const selectedType = document.querySelector('input[name="calc_type"]:checked')?.value || 'cloud';
    if (selectedType === 'box') {
      basePrice += 180000;
      days += 4;
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

  // 9. Theme Switcher (Dark / Light Mode)
  const themeToggleBtn = document.getElementById('themeToggle');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggle');

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getActiveTheme = () => {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('cortexis-theme') || getSystemTheme();
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = theme;
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = theme === 'dark' ? '#080e21' : '#ffffff';
    }

    if (themeToggleBtn) {
      const label = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
      themeToggleBtn.setAttribute('title', label);
      themeToggleBtn.setAttribute('aria-label', label);
    }

    const mobileThemeTexts = document.querySelectorAll('.mobile-theme-text');
    mobileThemeTexts.forEach(txt => {
      txt.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
    });
  };

  const toggleTheme = () => {
    const current = getActiveTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('cortexis-theme', next);
    } catch (e) {}
    applyTheme(next);
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Sync initial UI state
  applyTheme(getActiveTheme());

  // Listen for OS theme changes if user has not explicitly chosen
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('cortexis-theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  } catch (e) {}

  // 10. Floating Bubble Management
  const floatingBubble = document.getElementById('floatingBubble');
  const bubbleCloseBtn = document.getElementById('bubbleCloseBtn');
  if (floatingBubble && bubbleCloseBtn) {
    if (sessionStorage.getItem('cortexis_bubble_closed')) {
      floatingBubble.style.display = 'none';
    }
    bubbleCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      floatingBubble.style.opacity = '0';
      floatingBubble.style.transform = 'translateY(10px)';
      setTimeout(() => {
        floatingBubble.style.display = 'none';
      }, 300);
      try {
        sessionStorage.setItem('cortexis_bubble_closed', 'true');
      } catch (err) {}
    });
  }
});
