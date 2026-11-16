// Admin Dashboard Engine for Noreen's Portfolio
// Authentication (admin0987), Dynamic Section Builder, 10-Theme Manager, JSON Import/Export

document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_PASSWORD = 'admin0987';
  const getAdminPassword = () => {
    return localStorage.getItem('noreen_admin_password') || DEFAULT_PASSWORD;
  };

  // State Management
  const getStoredData = () => {
    try {
      const stored = localStorage.getItem('noreen_portfolio_data');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored portfolio data', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA));
  };

  let portfolioData = getStoredData();

  // Authentication Flow
  const loginScreen = document.getElementById('login-screen');
  const adminDashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('admin-login-form');
  const pwInput = document.getElementById('admin-password-input');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');
  const togglePwBtn = document.getElementById('toggle-pw-visibility');

  const checkAuth = () => {
    if (sessionStorage.getItem('noreen_admin_authenticated') === 'true') {
      loginScreen.style.display = 'none';
      adminDashboard.style.display = 'flex';
      initDashboard();
    } else {
      loginScreen.style.display = 'flex';
      adminDashboard.style.display = 'none';
    }
  };

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPass = getAdminPassword();
    if (pwInput.value.trim() === currentPass) {
      sessionStorage.setItem('noreen_admin_authenticated', 'true');
      loginError.style.display = 'none';
      checkAuth();
    } else {
      loginError.style.display = 'block';
      loginError.textContent = currentPass === DEFAULT_PASSWORD ? 'Incorrect password. Default is admin0987' : 'Incorrect password.';
      pwInput.focus();
    }
  });

  btnLogout?.addEventListener('click', () => {
    sessionStorage.removeItem('noreen_admin_authenticated');
    checkAuth();
  });

  togglePwBtn?.addEventListener('click', () => {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      togglePwBtn.innerHTML = '<i class="ri-eye-off-line"></i>';
    } else {
      pwInput.type = 'password';
      togglePwBtn.innerHTML = '<i class="ri-eye-line"></i>';
    }
  });

  // Toast Helper
  const showToast = (message = 'Saved successfully!') => {
    const toast = document.getElementById('admin-toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // Tab Navigation
  const tabLinks = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const activeTabTitle = document.getElementById('active-tab-title');

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      tabLinks.forEach(l => l.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const targetTabId = link.getAttribute('data-tab');
      document.getElementById(targetTabId)?.classList.add('active');

      if (activeTabTitle) {
        activeTabTitle.textContent = link.textContent.trim();
      }
    });
  });

  // Save All Changes to LocalStorage
  const savePortfolioData = (showNotification = true) => {
    collectAllInputs();
    localStorage.setItem('noreen_portfolio_data', JSON.stringify(portfolioData));
    if (showNotification) {
      showToast('All portfolio updates saved & published!');
    }
    updateRawJsonEditor();
  };

  document.getElementById('btn-save-all')?.addEventListener('click', () => {
    savePortfolioData(true);
  });

  // Initialize Dashboard with Loaded Data
  const initDashboard = () => {
    initFlyersTab();
    initProfileTab();
    initHeaderAnnouncementTab();
    initThemesTab();
    initHeroTab();
    initPlatformsTab();
    initSkillsTab();
    initEducationTab();
    initProjectsTab();
    initExperienceTab();
    initCustomSectionsTab();
    initTestimonialsTab();
    initFooterTab();
    initSecurityTab();
    initJsonTab();
  };

  // ================= 0A. FLYERS & AWARDS TAB =================
  const collectFlyersInputs = () => {
    if (!portfolioData.flyersSection) return;
    const enabledCheck = document.getElementById('flyers-enabled-input');
    if (enabledCheck) portfolioData.flyersSection.enabled = enabledCheck.checked;
    if (!portfolioData.flyersSection.items) portfolioData.flyersSection.items = [];

    document.querySelectorAll('.flyer-badge-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].badge = input.value;
    });
    document.querySelectorAll('.flyer-title-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].title = input.value;
    });
    document.querySelectorAll('.flyer-subtitle-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].subtitle = input.value;
    });
    document.querySelectorAll('.flyer-img-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].image = input.value;
    });
    document.querySelectorAll('.flyer-linktext-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].linkText = input.value;
    });
    document.querySelectorAll('.flyer-linkurl-in').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (portfolioData.flyersSection.items[idx]) portfolioData.flyersSection.items[idx].linkUrl = input.value;
    });
  };

  const initFlyersTab = () => {
    if (!portfolioData.flyersSection) {
      portfolioData.flyersSection = JSON.parse(JSON.stringify((window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.flyersSection) || { enabled: true, items: [] }));
    }
    const fs = portfolioData.flyersSection;
    if (!fs.items) fs.items = [];

    const enabledCheck = document.getElementById('flyers-enabled-input');
    if (enabledCheck) enabledCheck.checked = fs.enabled !== false;
    enabledCheck?.addEventListener('change', () => {
      portfolioData.flyersSection.enabled = enabledCheck.checked;
    });

    const container = document.getElementById('flyers-items-manager');
    const renderFlyers = () => {
      if (!container) return;
      if (fs.items.length === 0) {
        container.innerHTML = `
          <div style="padding:2.5rem; text-align:center; color:var(--admin-muted); border:1px dashed var(--admin-border); border-radius:12px;">
            <i class="ri-advertisement-line" style="font-size:2.5rem; color:var(--admin-primary); margin-bottom:0.75rem; display:block;"></i>
            <h4 style="margin-bottom:0.4rem; color:#fff;">No promotional flyers or awards yet</h4>
            <p style="font-size:0.85rem;">Click "Add New Flyer" above to create high-visibility banners shown at the top of your site.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = fs.items.map((flyer, idx) => `
        <div class="admin-card" style="margin-bottom:1.25rem; background: rgba(255,255,255,0.02); border: 1px solid var(--admin-border); padding: 1.25rem;" data-flyer-idx="${idx}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--admin-border); padding-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="badge-tag" style="background:var(--admin-primary); color:#fff; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.75rem; font-weight:700;">Flyer #${idx + 1}</span>
              <strong style="font-size:0.95rem;">${flyer.title || 'Untitled Flyer'}</strong>
            </div>
            <button type="button" class="btn-admin btn-admin-danger btn-sm btn-delete-flyer" data-idx="${idx}">
              <i class="ri-delete-bin-line"></i> Delete
            </button>
          </div>

          <div style="display:flex; gap:1.5rem; align-items:flex-start; flex-wrap:wrap; margin-bottom:1rem;">
            <div style="flex-shrink:0;">
              <div style="width:140px; height:90px; border-radius:8px; overflow:hidden; border:1px solid var(--admin-border); background:#050914; display:flex; align-items:center; justify-content:center;">
                <img src="${flyer.image || ''}" alt="Flyer Preview" class="flyer-img-preview-${idx}" style="width:100%; height:100%; object-fit:cover; display:${flyer.image ? 'block' : 'none'};">
                <i class="ri-image-line flyer-placeholder-icon-${idx}" style="font-size:1.8rem; color:var(--admin-muted); display:${flyer.image ? 'none' : 'block'};"></i>
              </div>
            </div>
            <div style="flex-grow:1; min-width:240px;">
              <label class="admin-label">Upload Flyer Graphic from Device</label>
              <input type="file" accept="image/*" class="admin-input flyer-file-in" data-idx="${idx}" style="padding:0.4rem; font-size:0.8rem; margin-bottom:0.5rem;">
              <label class="admin-label">Or Image URL</label>
              <input type="text" class="admin-input flyer-img-in" data-idx="${idx}" value="${flyer.image || ''}" placeholder="https://images.unsplash.com/... or paste image URL">
            </div>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Flyer Badge / Category Tag</label>
              <input type="text" class="admin-input flyer-badge-in" data-idx="${idx}" value="${flyer.badge || ''}" placeholder="e.g. 🏆 Milestone Recognition or ⭐ Special Award">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Flyer Headline / Title</label>
              <input type="text" class="admin-input flyer-title-in" data-idx="${idx}" value="${flyer.title || ''}" placeholder="e.g. £1.2M+ Multi-Marketplace GMV Scaled">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Flyer Description / Details</label>
            <textarea class="admin-textarea flyer-subtitle-in" data-idx="${idx}" rows="2" placeholder="Describe the achievement, metric, or promotional offer...">${flyer.subtitle || ''}</textarea>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Button / CTA Text</label>
              <input type="text" class="admin-input flyer-linktext-in" data-idx="${idx}" value="${flyer.linkText || ''}" placeholder="e.g. View Case Study or Claim Free Audit">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Button Destination URL</label>
              <input type="text" class="admin-input flyer-linkurl-in" data-idx="${idx}" value="${flyer.linkUrl || ''}" placeholder="#contact or #projects or external URL">
            </div>
          </div>
        </div>
      `).join('');

      // Wire up file uploads
      container.querySelectorAll('.flyer-file-in').forEach(fin => {
        fin.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            fs.items[idx].image = base64;
            const imgInput = container.querySelector(`.flyer-img-in[data-idx="${idx}"]`);
            if (imgInput) imgInput.value = base64;
            const preview = container.querySelector(`.flyer-img-preview-${idx}`);
            const icon = container.querySelector(`.flyer-placeholder-icon-${idx}`);
            if (preview) { preview.src = base64; preview.style.display = 'block'; }
            if (icon) icon.style.display = 'none';
            showToast(`Flyer #${idx+1} graphic uploaded!`);
          };
          reader.readAsDataURL(file);
        });
      });

      // Wire up image URL changes
      container.querySelectorAll('.flyer-img-in').forEach(urlIn => {
        urlIn.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          const val = e.target.value.trim();
          fs.items[idx].image = val;
          const preview = container.querySelector(`.flyer-img-preview-${idx}`);
          const icon = container.querySelector(`.flyer-placeholder-icon-${idx}`);
          if (preview) {
            preview.src = val;
            preview.style.display = val ? 'block' : 'none';
          }
          if (icon) icon.style.display = val ? 'none' : 'block';
        });
      });

      // Wire up delete
      container.querySelectorAll('.btn-delete-flyer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          if (confirm(`Delete Flyer #${idx + 1}?`)) {
            collectFlyersInputs();
            fs.items.splice(idx, 1);
            renderFlyers();
            showToast('Flyer removed');
          }
        });
      });
    };

    renderFlyers();

    document.getElementById('btn-add-flyer')?.addEventListener('click', () => {
      collectFlyersInputs();
      fs.items.push({
        id: `flyer-${Date.now()}`,
        badge: "⭐ Special Announcement",
        title: "New Marketplace Milestone & Client Offer",
        subtitle: "Add details about your latest award, certification, or promotional audit package.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        linkText: "Learn More",
        linkUrl: "#contact"
      });
      renderFlyers();
      showToast('New flyer added! Click "Save All Changes" to publish.');
    });
  };

  // ================= 0. PROFILE & PHOTO TAB =================
  const initProfileTab = () => {
    if (!portfolioData.profile) {
      portfolioData.profile = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA.profile || {}));
    }
    const prof = portfolioData.profile;

    const avatarIn = document.getElementById('profile-input-avatar');
    const fileIn = document.getElementById('profile-pic-file-input');
    const preview = document.getElementById('profile-pic-preview');
    const nameIn = document.getElementById('profile-input-name');
    const roleIn = document.getElementById('profile-input-role');
    const tagIn = document.getElementById('profile-input-tagline');
    const bioIn = document.getElementById('profile-input-bio');
    const locIn = document.getElementById('profile-input-location');
    const availIn = document.getElementById('profile-input-availability');
    const eduBriefIn = document.getElementById('profile-input-edu-brief');
    const waIn = document.getElementById('profile-input-whatsapp');
    const liIn = document.getElementById('profile-input-linkedin');
    const emIn = document.getElementById('profile-input-email');

    const curAvatar = prof.avatar || (portfolioData.about && portfolioData.about.image) || '';
    if (preview) preview.src = curAvatar;
    if (avatarIn) avatarIn.value = curAvatar;
    if (nameIn) nameIn.value = prof.name || 'Noreen';
    if (roleIn) roleIn.value = prof.role || 'eCommerce Account Manager & Team Lead';
    if (tagIn) tagIn.value = prof.tagline || '';
    if (bioIn) bioIn.value = prof.bio || '';
    if (locIn) locIn.value = prof.location || '';
    if (availIn) availIn.value = prof.availability || '';
    if (eduBriefIn) eduBriefIn.value = prof.educationBrief || '';

    // Contact fields
    const c = (portfolioData.siteConfig && portfolioData.siteConfig.contact) || {};
    if (waIn) waIn.value = c.whatsapp || '';
    if (liIn) liIn.value = c.linkedin || '';
    if (emIn) emIn.value = c.email || '';

    // Image URL change live preview
    avatarIn?.addEventListener('input', () => {
      if (preview && avatarIn.value) {
        preview.src = avatarIn.value;
      }
    });

    // File input (Upload from computer directly)
    fileIn?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Img = event.target.result;
        prof.avatar = base64Img;
        if (avatarIn) avatarIn.value = base64Img;
        if (preview) preview.src = base64Img;
        showToast('Profile image uploaded! Click Save to publish.');
      };
      reader.readAsDataURL(file);
    });
  };

  // ================= 1. HEADER & ANNOUNCEMENT TAB =================
  const initHeaderAnnouncementTab = () => {
    if (!portfolioData.announcement) {
      portfolioData.announcement = { enabled: true, text: "", badge: "", linkText: "", linkUrl: "" };
    }
    const ann = portfolioData.announcement;

    const annCheck = document.getElementById('announcement-enabled-input');
    const annText = document.getElementById('announcement-text-input');
    const annBadge = document.getElementById('announcement-badge-input');
    const annLinkText = document.getElementById('announcement-linktext-input');
    const annLinkUrl = document.getElementById('announcement-linkurl-input');

    if (annCheck) annCheck.checked = ann.enabled !== false;
    if (annText) annText.value = ann.text || '';
    if (annBadge) annBadge.value = ann.badge || '';
    if (annLinkText) annLinkText.value = ann.linkText || '';
    if (annLinkUrl) annLinkUrl.value = ann.linkUrl || '';

    // Header branding
    if (!portfolioData.headerConfig) {
      portfolioData.headerConfig = { brandName: "Noreen", brandSub: "eCommerce Account Lead", ctaText: "Let's Talk", ctaLink: "#contact" };
    }
    const hc = portfolioData.headerConfig;

    const brandNameIn = document.getElementById('header-brand-name-input');
    const brandSubIn = document.getElementById('header-brand-sub-input');
    const ctaTextIn = document.getElementById('header-cta-text-input');
    const ctaLinkIn = document.getElementById('header-cta-link-input');

    if (brandNameIn) brandNameIn.value = hc.brandName || 'Noreen';
    if (brandSubIn) brandSubIn.value = hc.brandSub || 'eCommerce Account Lead';
    if (ctaTextIn) ctaTextIn.value = hc.ctaText || "Let's Talk";
    if (ctaLinkIn) ctaLinkIn.value = hc.ctaLink || "#contact";
  };

  // ================= 2. THEMES & TYPOGRAPHY =================
  const initThemesTab = () => {
    const themeGrid = document.getElementById('theme-picker-grid');
    if (!themeGrid || !window.THEMES) return;

    const currentThemeId = localStorage.getItem('noreen_current_theme') || (portfolioData.siteConfig && portfolioData.siteConfig.theme) || 'tnc-navy';

    themeGrid.innerHTML = window.THEMES.map(t => `
      <div class="theme-card-option ${t.id === currentThemeId ? 'active' : ''}" data-theme-id="${t.id}">
        <div class="theme-preview-palette">
          <div class="theme-color-slice" style="background: ${t.bgMain};"></div>
          <div class="theme-color-slice" style="background: ${t.primary};"></div>
          <div class="theme-color-slice" style="background: ${t.accent};"></div>
          <div class="theme-color-slice" style="background: ${t.bgCard};"></div>
        </div>
        <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">${t.name}</h4>
        <p style="font-size: 0.78rem; color: var(--admin-muted); line-height: 1.4;">${t.description}</p>
      </div>
    `).join('');

    themeGrid.querySelectorAll('.theme-card-option').forEach(el => {
      el.addEventListener('click', () => {
        const selectedId = el.getAttribute('data-theme-id');
        themeGrid.querySelectorAll('.theme-card-option').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        portfolioData.siteConfig.theme = selectedId;
        localStorage.setItem('noreen_current_theme', selectedId);
        savePortfolioData(false);
        showToast(`Theme changed to "${window.THEMES.find(t=>t.id===selectedId).name}"`);
      });
    });

    // Typography Inputs
    const fs = portfolioData.siteConfig.fontStyle || {};
    const fontSelect = document.getElementById('setting-font-family');
    const customFontInput = document.getElementById('setting-custom-font-input');
    const headingStyleSelect = document.getElementById('setting-heading-style');
    const bodyStyleSelect = document.getElementById('setting-body-style');
    const weightSelect = document.getElementById('setting-heading-weight');

    if (fontSelect && fs.fontFamily) fontSelect.value = fs.fontFamily;
    if (customFontInput) customFontInput.value = fs.customFontName || '';
    if (headingStyleSelect) headingStyleSelect.value = fs.headingStyle || 'bold-italic';
    if (bodyStyleSelect) bodyStyleSelect.value = fs.bodyStyle || 'normal';
    if (weightSelect && fs.headingWeight) weightSelect.value = fs.headingWeight;

    fontSelect?.addEventListener('change', () => {
      portfolioData.siteConfig.fontStyle.fontFamily = fontSelect.value;
      savePortfolioData(false);
      showToast('Font family updated');
    });

    customFontInput?.addEventListener('input', () => {
      portfolioData.siteConfig.fontStyle.customFontName = customFontInput.value.trim();
    });

    headingStyleSelect?.addEventListener('change', () => {
      portfolioData.siteConfig.fontStyle.headingStyle = headingStyleSelect.value;
      savePortfolioData(false);
      showToast('Heading style updated');
    });

    bodyStyleSelect?.addEventListener('change', () => {
      portfolioData.siteConfig.fontStyle.bodyStyle = bodyStyleSelect.value;
      savePortfolioData(false);
      showToast('Body text style updated');
    });

    weightSelect?.addEventListener('change', () => {
      portfolioData.siteConfig.fontStyle.headingWeight = weightSelect.value;
      savePortfolioData(false);
      showToast('Heading weight updated');
    });
  };

  // ================= 3. HERO TAB =================
  const initHeroTab = () => {
    const h = portfolioData.hero || {};
    const badgeIn = document.getElementById('hero-input-badge');
    const prefixIn = document.getElementById('hero-input-prefix');
    const highlightIn = document.getElementById('hero-input-highlight');
    const subtitleIn = document.getElementById('hero-input-subtitle');
    const ctaPrimIn = document.getElementById('hero-input-cta-primary');
    const ctaSecIn = document.getElementById('hero-input-cta-secondary');
    const platformsIn = document.getElementById('hero-input-platforms');

    if (badgeIn) badgeIn.value = h.badge || '';
    if (prefixIn) prefixIn.value = h.titlePrefix || '';
    if (highlightIn) highlightIn.value = h.titleHighlight || '';
    if (subtitleIn) subtitleIn.value = h.subtitle || '';
    if (ctaPrimIn) ctaPrimIn.value = h.ctaPrimary || '';
    if (ctaSecIn) ctaSecIn.value = h.ctaSecondary || '';
    if (platformsIn) platformsIn.value = (h.platforms || []).join(', ');

    // Stats Cards Manager
    const statsMgr = document.getElementById('hero-stats-manager');
    if (statsMgr && h.stats) {
      statsMgr.innerHTML = h.stats.map((s, idx) => `
        <div class="item-repeater-box">
          <div class="admin-form-group">
            <label class="admin-label">Statistic Value</label>
            <input type="text" class="admin-input stat-val-input" data-idx="${idx}" value="${s.value}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Statistic Label</label>
            <input type="text" class="admin-input stat-lbl-input" data-idx="${idx}" value="${s.label}">
          </div>
        </div>
      `).join('');
    }
  };

  // ================= 4. PLATFORMS TAB =================
  const initPlatformsTab = () => {
    const mgr = document.getElementById('platforms-manager');
    const ps = portfolioData.platformsSection || {};
    if (!mgr || !ps.items) return;

    mgr.innerHTML = ps.items.map((p, idx) => `
      <div class="item-repeater-box">
        <div class="admin-grid-3">
          <div class="admin-form-group">
            <label class="admin-label">Platform Name</label>
            <input type="text" class="admin-input plat-name" data-idx="${idx}" value="${p.name}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Tagline (e.g. 2+ Yrs Focus)</label>
            <input type="text" class="admin-input plat-tagline" data-idx="${idx}" value="${p.tagline}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Badge</label>
            <input type="text" class="admin-input plat-badge" data-idx="${idx}" value="${p.badge}">
          </div>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Description</label>
          <textarea class="admin-textarea plat-desc" data-idx="${idx}" rows="2">${p.description}</textarea>
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Metrics (comma-separated)</label>
          <input type="text" class="admin-input plat-metrics" data-idx="${idx}" value="${(p.metrics || []).join(', ')}">
        </div>

        <div class="admin-form-group">
          <label class="admin-label">Capabilities / Key Features (one per line)</label>
          <textarea class="admin-textarea plat-capabilities" data-idx="${idx}" rows="3">${(p.capabilities || []).join('\n')}</textarea>
        </div>
      </div>
    `).join('');
  };

  // ================= 5. SKILLS MANAGER TAB =================
  const initSkillsTab = () => {
    const mgr = document.getElementById('skills-categories-manager');
    if (!mgr || !portfolioData.skills) return;

    const renderSkillsManager = () => {
      const cats = portfolioData.skills.categories || [];
      mgr.innerHTML = cats.map((cat, catIdx) => `
        <div class="item-repeater-box" style="border-left: 4px solid var(--admin-primary); margin-bottom: 2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div style="flex-grow:1; margin-right:1rem;">
              <label class="admin-label">Category Title</label>
              <input type="text" class="admin-input skill-cat-title" data-cidx="${catIdx}" value="${cat.category}">
            </div>
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSkillCategory(${catIdx})">
              <i class="ri-delete-bin-line"></i> Remove Category
            </button>
          </div>

          <div style="margin-top: 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h5 style="margin:0; font-size:0.95rem;">Skills in this Category (${(cat.skills || []).length})</h5>
              <button class="btn-admin btn-admin-secondary btn-sm" onclick="addSkillToCategory(${catIdx})">
                <i class="ri-add-line"></i> Add Skill
              </button>
            </div>

            <div id="cat-skills-${catIdx}">
              ${(cat.skills || []).map((sk, skIdx) => `
                <div style="display:flex; gap:1rem; align-items:center; background:rgba(255,255,255,0.02); padding:0.75rem; border-radius:8px; margin-bottom:0.5rem; border:1px solid var(--admin-border);">
                  <div style="flex-grow:1;">
                    <input type="text" class="admin-input skill-name-in" data-cidx="${catIdx}" data-skidx="${skIdx}" value="${sk.name}" placeholder="Skill Name">
                  </div>
                  <div style="width:120px; display:flex; align-items:center; gap:0.4rem;">
                    <input type="number" min="1" max="100" class="admin-input skill-level-in" data-cidx="${catIdx}" data-skidx="${skIdx}" value="${sk.level}" style="width:70px;">
                    <span style="font-weight:700; color:var(--admin-accent);">%</span>
                  </div>
                  <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteSkillFromCategory(${catIdx}, ${skIdx})">
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');
    };

    renderSkillsManager();

    document.getElementById('btn-add-skill-category')?.addEventListener('click', () => {
      portfolioData.skills.categories.push({
        category: "New Skill Specialization",
        icon: "ri-star-line",
        skills: [
          { name: "Marketplace Optimization", level: 95 }
        ]
      });
      renderSkillsManager();
      savePortfolioData(false);
      showToast('Skill category added');
    });

    window.deleteSkillCategory = (cIdx) => {
      if (confirm('Delete this entire skill category?')) {
        portfolioData.skills.categories.splice(cIdx, 1);
        renderSkillsManager();
        savePortfolioData(false);
        showToast('Skill category removed');
      }
    };

    window.addSkillToCategory = (cIdx) => {
      portfolioData.skills.categories[cIdx].skills.push({
        name: "New Marketplace Skill",
        level: 90
      });
      renderSkillsManager();
      savePortfolioData(false);
      showToast('Skill added');
    };

    window.deleteSkillFromCategory = (cIdx, skIdx) => {
      portfolioData.skills.categories[cIdx].skills.splice(skIdx, 1);
      renderSkillsManager();
      savePortfolioData(false);
      showToast('Skill deleted');
    };
  };

  // ================= 6. EDUCATION TAB =================
  const initEducationTab = () => {
    const mgr = document.getElementById('education-items-manager');
    const e = portfolioData.education || {};
    if (!mgr || !e.items) return;

    const renderEdu = () => {
      mgr.innerHTML = e.items.map((item, idx) => `
        <div class="item-repeater-box">
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Degree / Title</label>
              <input type="text" class="admin-input edu-degree-in" data-idx="${idx}" value="${item.degree}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Institution</label>
              <input type="text" class="admin-input edu-inst-in" data-idx="${idx}" value="${item.institution}">
            </div>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Period (e.g. Currently Studying)</label>
              <input type="text" class="admin-input edu-period-in" data-idx="${idx}" value="${item.period}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Status Tag (e.g. In Progress, Completed)</label>
              <input type="text" class="admin-input edu-status-in" data-idx="${idx}" value="${item.status}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Description / Relevance to eCommerce</label>
            <textarea class="admin-textarea edu-desc-in" data-idx="${idx}" rows="2">${item.description}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Key Takeaways / Highlights (one per line)</label>
            <textarea class="admin-textarea edu-hl-in" data-idx="${idx}" rows="3">${(item.highlights || []).join('\n')}</textarea>
          </div>

          <div class="item-repeater-actions">
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteEducationItem(${idx})">
              <i class="ri-delete-bin-line"></i> Remove Item
            </button>
          </div>
        </div>
      `).join('');
    };

    renderEdu();

    document.getElementById('btn-add-education')?.addEventListener('click', () => {
      e.items.push({
        degree: "New Degree / Professional Specialization",
        institution: "Institution Name",
        period: "2024",
        status: "Completed",
        description: "Specialized training covering digital marketplace operations.",
        highlights: ["Marketplace Operations", "Analytical Decision Making"]
      });
      renderEdu();
      savePortfolioData(false);
      showToast('New education item added!');
    });

    window.deleteEducationItem = (idx) => {
      if (confirm('Delete this education entry?')) {
        e.items.splice(idx, 1);
        renderEdu();
        savePortfolioData(false);
        showToast('Education entry removed');
      }
    };
  };

  // ================= 7. PROJECTS & CASE STUDIES TAB =================
  const initProjectsTab = () => {
    const mgr = document.getElementById('projects-items-manager');
    const p = portfolioData.projects || {};
    if (!mgr || !p.items) return;

    const renderProjects = () => {
      mgr.innerHTML = p.items.map((proj, idx) => `
        <div class="item-repeater-box">
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Project Title</label>
              <input type="text" class="admin-input proj-title-in" data-idx="${idx}" value="${proj.title}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Platform (OnBuy, eBay, TikTok Shop)</label>
              <input type="text" class="admin-input proj-plat-in" data-idx="${idx}" value="${proj.platform}">
            </div>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Category (e.g. Growth & Optimization)</label>
              <input type="text" class="admin-input proj-cat-in" data-idx="${idx}" value="${proj.category || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Main Cover Image URL</label>
              <input type="text" class="admin-input proj-img-in" data-idx="${idx}" value="${proj.image || ''}">
            </div>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">Live Storefront / Case Study URL</label>
              <input type="text" class="admin-input proj-livelink-in" data-idx="${idx}" value="${proj.liveLink || ''}" placeholder="https://onbuy.com or client store URL">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Video Embed URL (YouTube/Vimeo Embed - optional)</label>
              <input type="text" class="admin-input proj-vid-in" data-idx="${idx}" value="${proj.videoUrl || ''}" placeholder="https://www.youtube.com/embed/...">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Reference Proof Screenshots (comma-separated URLs)</label>
            <textarea class="admin-textarea proj-refimgs-in" data-idx="${idx}" rows="2" placeholder="https://image1.jpg, https://image2.jpg">${(proj.referenceImages || []).join(', ')}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Project Summary</label>
            <textarea class="admin-textarea proj-sum-in" data-idx="${idx}" rows="2">${proj.summary || ''}</textarea>
          </div>

          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label class="admin-label">The Challenge Faced</label>
              <textarea class="admin-textarea proj-chal-in" data-idx="${idx}" rows="2">${proj.challenge || ''}</textarea>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">The Strategic Solution Deployed</label>
              <textarea class="admin-textarea proj-sol-in" data-idx="${idx}" rows="2">${proj.solution || ''}</textarea>
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Results (Format: Metric|Label, e.g. +140%|Revenue Surge)</label>
            <input type="text" class="admin-input proj-res-in" data-idx="${idx}" value="${(proj.results || []).map(r => `${r.metric}|${r.label}`).join(', ')}">
          </div>

          <div class="item-repeater-actions">
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteProjectItem(${idx})">
              <i class="ri-delete-bin-line"></i> Delete Case Study
            </button>
          </div>
        </div>
      `).join('');
    };

    renderProjects();

    document.getElementById('btn-add-project')?.addEventListener('click', () => {
      p.items.push({
        id: 'proj-' + Math.random().toString(36).substr(2, 6),
        title: "New Marketplace Case Study",
        platform: "OnBuy",
        category: "Account Growth",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        referenceImages: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
        ],
        liveLink: "https://onbuy.com",
        videoUrl: "",
        summary: "Detailed breakdown of metrics achieved for client storefront.",
        challenge: "Account health decline and Buy Box friction.",
        solution: "Overhauled inventory feed and launched Boost campaigns.",
        results: [
          { metric: "+85%", label: "Sales Increase" },
          { metric: "99.8%", label: "Health Score" },
          { metric: "3.5x", label: "ROAS" }
        ]
      });
      renderProjects();
      savePortfolioData(false);
      showToast('New case study added!');
    });

    window.deleteProjectItem = (idx) => {
      if (confirm('Delete this case study?')) {
        p.items.splice(idx, 1);
        renderProjects();
        savePortfolioData(false);
        showToast('Case study deleted');
      }
    };
  };

  // ================= 8. EXPERIENCE TAB =================
  const initExperienceTab = () => {
    const mgr = document.getElementById('experience-items-manager');
    const exp = portfolioData.experience || {};
    if (!mgr || !exp.timeline) return;

    const renderExp = () => {
      mgr.innerHTML = exp.timeline.map((item, idx) => `
        <div class="item-repeater-box">
          <div class="admin-grid-3">
            <div class="admin-form-group">
              <label class="admin-label">Role Title</label>
              <input type="text" class="admin-input exp-role-in" data-idx="${idx}" value="${item.role}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Company / Client Scope</label>
              <input type="text" class="admin-input exp-comp-in" data-idx="${idx}" value="${item.company}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Period</label>
              <input type="text" class="admin-input exp-per-in" data-idx="${idx}" value="${item.period}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Description</label>
            <textarea class="admin-textarea exp-desc-in" data-idx="${idx}" rows="2">${item.description}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Key Achievements (one per line)</label>
            <textarea class="admin-textarea exp-ach-in" data-idx="${idx}" rows="3">${(item.achievements || []).join('\n')}</textarea>
          </div>

          <div class="item-repeater-actions">
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteExperienceItem(${idx})">
              <i class="ri-delete-bin-line"></i> Remove Role
            </button>
          </div>
        </div>
      `).join('');
    };

    renderExp();

    document.getElementById('btn-add-experience')?.addEventListener('click', () => {
      exp.timeline.push({
        role: "eCommerce Marketplace Lead",
        company: "Global Brand Store",
        period: "2024 - Present",
        type: "Full-Time",
        description: "Overseeing store operations and managing virtual assistant team.",
        achievements: [
          "Scaled store revenue by 50%",
          "Maintained 99.9% dispatch compliance"
        ]
      });
      renderExp();
      savePortfolioData(false);
      showToast('Career milestone added!');
    });

    window.deleteExperienceItem = (idx) => {
      if (confirm('Delete this career role?')) {
        exp.timeline.splice(idx, 1);
        renderExp();
        savePortfolioData(false);
        showToast('Role removed');
      }
    };
  };

  // ================= 9. DYNAMIC CUSTOM SECTIONS BUILDER =================
  const initCustomSectionsTab = () => {
    const mgr = document.getElementById('custom-sections-manager');
    if (!mgr) return;

    if (!portfolioData.customSections) {
      portfolioData.customSections = [];
    }

    const renderCustomSections = () => {
      if (portfolioData.customSections.length === 0) {
        mgr.innerHTML = `
          <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--admin-border);">
            <i class="ri-layout-masonry-line" style="font-size: 2.5rem; color: var(--admin-muted); display: block; margin-bottom: 0.5rem;"></i>
            <h4>No Custom Sections Added Yet</h4>
            <p style="color: var(--admin-muted); font-size: 0.88rem; margin-top: 4px;">Click "Add New Section" above to create custom content with videos, images, or card grids.</p>
          </div>
        `;
        return;
      }

      mgr.innerHTML = portfolioData.customSections.map((sec, secIdx) => `
        <div class="item-repeater-box" style="border-left: 4px solid var(--admin-primary); margin-bottom: 2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span style="font-size:0.8rem; background:rgba(37,99,235,0.15); color:var(--admin-accent); padding:0.25rem 0.65rem; border-radius:9999px; font-weight:700;">Custom Section #${secIdx + 1}</span>
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteCustomSection(${secIdx})">
              <i class="ri-delete-bin-line"></i> Delete Section
            </button>
          </div>

          <div class="admin-grid-3">
            <div class="admin-form-group">
              <label class="admin-label">Section Title *</label>
              <input type="text" class="admin-input csec-title" data-sidx="${secIdx}" value="${sec.title || ''}" placeholder="e.g. My Leadership Philosophy">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Subtitle</label>
              <input type="text" class="admin-input csec-subtitle" data-sidx="${secIdx}" value="${sec.subtitle || ''}" placeholder="Sub-heading description">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Section Badge</label>
              <input type="text" class="admin-input csec-badge" data-sidx="${secIdx}" value="${sec.badge || ''}" placeholder="e.g. Framework">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Media URL (YouTube/Vimeo Embed URL or Image link - optional)</label>
            <input type="text" class="admin-input csec-media" data-sidx="${secIdx}" value="${sec.mediaUrl || ''}" placeholder="https://www.youtube.com/embed/... OR https://images.unsplash.com/...">
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Introductory Content / Text</label>
            <textarea class="admin-textarea csec-content" data-sidx="${secIdx}" rows="3" placeholder="Paragraph text explaining this section...">${sec.content || ''}</textarea>
          </div>

          <!-- Section Cards / Sub-Items -->
          <div style="margin-top: 1.5rem; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 1.25rem; border: 1px solid var(--admin-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h5 style="font-size: 0.95rem; margin: 0;"><i class="ri-grid-fill"></i> Section Cards / Sub-Items (${(sec.items || []).length})</h5>
              <button class="btn-admin btn-admin-secondary btn-sm" onclick="addCardToCustomSection(${secIdx})">
                <i class="ri-add-line"></i> Add Card to Section
              </button>
            </div>

            <div id="csec-cards-container-${secIdx}">
              ${(sec.items || []).map((it, itIdx) => `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--admin-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                  <div class="admin-grid-2">
                    <div class="admin-form-group">
                      <label class="admin-label">Card Title</label>
                      <input type="text" class="admin-input csec-card-title" data-sidx="${secIdx}" data-itidx="${itIdx}" value="${it.title || ''}">
                    </div>
                    <div class="admin-form-group">
                      <label class="admin-label">RemixIcon Name (e.g. ri-brain-line, ri-team-line)</label>
                      <input type="text" class="admin-input csec-card-icon" data-sidx="${secIdx}" data-itidx="${itIdx}" value="${it.icon || 'ri-star-line'}">
                    </div>
                  </div>
                  <div class="admin-form-group" style="margin-bottom: 0.5rem;">
                    <label class="admin-label">Card Description</label>
                    <textarea class="admin-textarea csec-card-desc" data-sidx="${secIdx}" data-itidx="${itIdx}" rows="2">${it.desc || it.description || ''}</textarea>
                  </div>
                  <div style="text-align: right;">
                    <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteCardFromCustomSection(${secIdx}, ${itIdx})">
                      <i class="ri-delete-bin-line"></i> Delete Card
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');
    };

    renderCustomSections();

    document.getElementById('btn-add-custom-section')?.addEventListener('click', () => {
      portfolioData.customSections.push({
        id: 'sec-' + Math.random().toString(36).substr(2, 6),
        title: "New Custom Portfolio Section",
        subtitle: "Custom content built dynamically",
        badge: "Special Feature",
        content: "Describe any special capability, video demonstration, or operational methodology.",
        mediaUrl: "",
        items: [
          { title: "Special Pillar 1", desc: "Detail regarding this pillar.", icon: "ri-star-line" },
          { title: "Special Pillar 2", desc: "Detail regarding this pillar.", icon: "ri-shield-check-line" }
        ]
      });
      renderCustomSections();
      savePortfolioData(false);
      showToast('New custom section created!');
    });

    window.deleteCustomSection = (sIdx) => {
      if (confirm('Delete this entire custom section?')) {
        portfolioData.customSections.splice(sIdx, 1);
        renderCustomSections();
        savePortfolioData(false);
        showToast('Custom section deleted');
      }
    };

    window.addCardToCustomSection = (sIdx) => {
      if (!portfolioData.customSections[sIdx].items) {
        portfolioData.customSections[sIdx].items = [];
      }
      portfolioData.customSections[sIdx].items.push({
        title: "New Card Title",
        desc: "Card description text goes here.",
        icon: "ri-flashlight-line"
      });
      renderCustomSections();
      savePortfolioData(false);
      showToast('Card added to section');
    };

    window.deleteCardFromCustomSection = (sIdx, itIdx) => {
      portfolioData.customSections[sIdx].items.splice(itIdx, 1);
      renderCustomSections();
      savePortfolioData(false);
      showToast('Card removed from section');
    };
  };

  // ================= 10. TESTIMONIALS & FAQ TAB =================
  const initTestimonialsTab = () => {
    const tMgr = document.getElementById('testimonials-items-manager');
    const fMgr = document.getElementById('faq-items-manager');

    // Testimonials
    const renderTestimonials = () => {
      if (!tMgr) return;
      tMgr.innerHTML = (portfolioData.testimonials || []).map((t, idx) => `
        <div class="item-repeater-box">
          <div class="admin-grid-3">
            <div class="admin-form-group">
              <label class="admin-label">Client Name</label>
              <input type="text" class="admin-input test-name" data-idx="${idx}" value="${t.name}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Role / Store</label>
              <input type="text" class="admin-input test-role" data-idx="${idx}" value="${t.role}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Platform Tag</label>
              <input type="text" class="admin-input test-plat" data-idx="${idx}" value="${t.platform}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-label">Testimonial Quote</label>
            <textarea class="admin-textarea test-quote" data-idx="${idx}" rows="2">${t.text}</textarea>
          </div>

          <div class="item-repeater-actions">
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteTestimonial(${idx})">
              <i class="ri-delete-bin-line"></i> Remove Review
            </button>
          </div>
        </div>
      `).join('');
    };

    renderTestimonials();

    document.getElementById('btn-add-testimonial')?.addEventListener('click', () => {
      if (!portfolioData.testimonials) portfolioData.testimonials = [];
      portfolioData.testimonials.push({
        name: "Client Name",
        role: "Director, Retail Store",
        platform: "OnBuy Store Client",
        text: "Noreen delivered extraordinary results and transformed our store performance.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
      });
      renderTestimonials();
      savePortfolioData(false);
      showToast('New review added');
    });

    window.deleteTestimonial = (idx) => {
      portfolioData.testimonials.splice(idx, 1);
      renderTestimonials();
      savePortfolioData(false);
      showToast('Review deleted');
    };

    // FAQs
    const renderFaqs = () => {
      if (!fMgr) return;
      fMgr.innerHTML = (portfolioData.faq || []).map((faq, idx) => `
        <div class="item-repeater-box">
          <div class="admin-form-group">
            <label class="admin-label">Question</label>
            <input type="text" class="admin-input faq-q" data-idx="${idx}" value="${faq.q}">
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Answer</label>
            <textarea class="admin-textarea faq-a" data-idx="${idx}" rows="2">${faq.a}</textarea>
          </div>
          <div class="item-repeater-actions">
            <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteFaq(${idx})">
              <i class="ri-delete-bin-line"></i> Remove FAQ
            </button>
          </div>
        </div>
      `).join('');
    };

    renderFaqs();

    document.getElementById('btn-add-faq')?.addEventListener('click', () => {
      if (!portfolioData.faq) portfolioData.faq = [];
      portfolioData.faq.push({
        q: "New Frequently Asked Question?",
        a: "Detailed clear answer addressing client confidence and expectations."
      });
      renderFaqs();
      savePortfolioData(false);
      showToast('FAQ added');
    });

    window.deleteFaq = (idx) => {
      portfolioData.faq.splice(idx, 1);
      renderFaqs();
      savePortfolioData(false);
      showToast('FAQ removed');
    };
  };

  // ================= 11. FOOTER TAB =================
  const initFooterTab = () => {
    if (!portfolioData.footerConfig) {
      portfolioData.footerConfig = {
        aboutText: "Professional eCommerce Account Manager and Team Lead.",
        copyrightText: "Noreen — eCommerce Account Manager & Team Lead. All rights reserved."
      };
    }
    const fc = portfolioData.footerConfig;

    const aboutIn = document.getElementById('footer-about-input');
    const copyIn = document.getElementById('footer-copyright-input');

    if (aboutIn) aboutIn.value = fc.aboutText || '';
    if (copyIn) copyIn.value = fc.copyrightText || '';
  };

  // ================= 12. ADMIN SECURITY & PASSWORD TAB =================
  const initSecurityTab = () => {
    const pwForm = document.getElementById('change-password-form');
    const curPwInput = document.getElementById('pw-current-input');
    const newPwInput = document.getElementById('pw-new-input');
    const confirmPwInput = document.getElementById('pw-confirm-input');
    const statusMsg = document.getElementById('pw-status-msg');
    const btnResetPw = document.getElementById('btn-reset-default-pw');

    const showMsg = (text, isSuccess = true) => {
      if (!statusMsg) return;
      statusMsg.style.display = 'block';
      statusMsg.style.color = isSuccess ? 'var(--admin-success)' : '#ef4444';
      statusMsg.textContent = text;
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 5000);
    };

    pwForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentStored = getAdminPassword();
      const enteredCurrent = curPwInput.value.trim();
      const enteredNew = newPwInput.value.trim();
      const enteredConfirm = confirmPwInput.value.trim();

      if (enteredCurrent !== currentStored) {
        showMsg('Error: Current password is incorrect!', false);
        curPwInput.focus();
        return;
      }

      if (enteredNew.length < 6) {
        showMsg('Error: New password must be at least 6 characters long!', false);
        newPwInput.focus();
        return;
      }

      if (enteredNew !== enteredConfirm) {
        showMsg('Error: New password and Confirm password do not match!', false);
        confirmPwInput.focus();
        return;
      }

      localStorage.setItem('noreen_admin_password', enteredNew);
      curPwInput.value = '';
      newPwInput.value = '';
      confirmPwInput.value = '';
      showMsg('Success: Admin password changed successfully! Remember your new password for your next login.', true);
      showToast('Admin password updated successfully!');
    });

    btnResetPw?.addEventListener('click', () => {
      if (confirm('Reset admin password to default (admin0987)?')) {
        localStorage.removeItem('noreen_admin_password');
        if (curPwInput) curPwInput.value = '';
        if (newPwInput) newPwInput.value = '';
        if (confirmPwInput) confirmPwInput.value = '';
        showMsg('Password has been reset to default: admin0987', true);
        showToast('Password reset to admin0987');
      }
    });
  };

  // ================= 13. JSON IMPORT & EXPORT TAB =================
  const initJsonTab = () => {
    updateRawJsonEditor();

    // Export JSON Button
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      collectAllInputs();
      const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `noreen-portfolio-data-${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('JSON file exported successfully!');
    });

    // Import JSON File
    const fileInput = document.getElementById('json-file-input');
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && typeof parsed === 'object') {
            portfolioData = parsed;
            localStorage.setItem('noreen_portfolio_data', JSON.stringify(portfolioData));
            initDashboard();
            showToast('JSON file successfully imported & applied!');
          } else {
            alert('Invalid JSON file format.');
          }
        } catch (err) {
          alert('Error parsing JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Copy JSON
    document.getElementById('btn-copy-json')?.addEventListener('click', () => {
      const rawText = document.getElementById('raw-json-editor').value;
      navigator.clipboard.writeText(rawText).then(() => {
        showToast('JSON copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy to clipboard.');
      });
    });

    // Apply Raw JSON
    document.getElementById('btn-apply-raw-json')?.addEventListener('click', () => {
      const rawText = document.getElementById('raw-json-editor').value;
      try {
        const parsed = JSON.parse(rawText);
        portfolioData = parsed;
        localStorage.setItem('noreen_portfolio_data', JSON.stringify(portfolioData));
        initDashboard();
        showToast('JSON code edits applied successfully!');
      } catch (err) {
        alert('JSON Syntax Error: ' + err.message);
      }
    });

    // Reset Defaults
    document.getElementById('btn-reset-defaults')?.addEventListener('click', () => {
      if (confirm('Reset all portfolio data to Noreen\'s original defaults? This will restore original settings.')) {
        portfolioData = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA));
        localStorage.setItem('noreen_portfolio_data', JSON.stringify(portfolioData));
        localStorage.setItem('noreen_current_theme', 'tnc-navy');
        initDashboard();
        showToast('Reset to Noreen default data completed!');
      }
    });
  };

  const updateRawJsonEditor = () => {
    const rawEditor = document.getElementById('raw-json-editor');
    if (rawEditor) {
      rawEditor.value = JSON.stringify(portfolioData, null, 2);
    }
  };

  // Collect All Form Inputs into State
  const collectAllInputs = () => {
    // Flyers & Awards Showcase
    collectFlyersInputs();

    // Custom Font Name
    if (!portfolioData.siteConfig) portfolioData.siteConfig = {};
    if (!portfolioData.siteConfig.fontStyle) portfolioData.siteConfig.fontStyle = {};
    const customFontIn = document.getElementById('setting-custom-font-input');
    if (customFontIn) {
      portfolioData.siteConfig.fontStyle.customFontName = customFontIn.value.trim();
    }

    // Profile
    if (!portfolioData.profile) portfolioData.profile = {};
    const profAvatar = document.getElementById('profile-input-avatar')?.value;
    if (profAvatar) {
      portfolioData.profile.avatar = profAvatar;
      if (portfolioData.about) portfolioData.about.image = profAvatar;
    }
    portfolioData.profile.name = document.getElementById('profile-input-name')?.value || portfolioData.profile.name;
    portfolioData.profile.role = document.getElementById('profile-input-role')?.value || portfolioData.profile.role;
    portfolioData.profile.tagline = document.getElementById('profile-input-tagline')?.value || portfolioData.profile.tagline;
    portfolioData.profile.bio = document.getElementById('profile-input-bio')?.value || portfolioData.profile.bio;
    portfolioData.profile.location = document.getElementById('profile-input-location')?.value || portfolioData.profile.location;
    portfolioData.profile.availability = document.getElementById('profile-input-availability')?.value || portfolioData.profile.availability;
    portfolioData.profile.educationBrief = document.getElementById('profile-input-edu-brief')?.value || portfolioData.profile.educationBrief;

    // Contact sync
    if (!portfolioData.siteConfig.contact) portfolioData.siteConfig.contact = {};
    portfolioData.siteConfig.contact.whatsapp = document.getElementById('profile-input-whatsapp')?.value || portfolioData.siteConfig.contact.whatsapp;
    portfolioData.siteConfig.contact.linkedin = document.getElementById('profile-input-linkedin')?.value || portfolioData.siteConfig.contact.linkedin;
    portfolioData.siteConfig.contact.email = document.getElementById('profile-input-email')?.value || portfolioData.siteConfig.contact.email;

    // Header & Announcement
    if (!portfolioData.announcement) portfolioData.announcement = {};
    portfolioData.announcement.enabled = document.getElementById('announcement-enabled-input')?.checked ?? true;
    portfolioData.announcement.text = document.getElementById('announcement-text-input')?.value || portfolioData.announcement.text;
    portfolioData.announcement.badge = document.getElementById('announcement-badge-input')?.value || portfolioData.announcement.badge;
    portfolioData.announcement.linkText = document.getElementById('announcement-linktext-input')?.value || portfolioData.announcement.linkText;
    portfolioData.announcement.linkUrl = document.getElementById('announcement-linkurl-input')?.value || portfolioData.announcement.linkUrl;

    if (!portfolioData.headerConfig) portfolioData.headerConfig = {};
    portfolioData.headerConfig.brandName = document.getElementById('header-brand-name-input')?.value || portfolioData.headerConfig.brandName;
    portfolioData.headerConfig.brandSub = document.getElementById('header-brand-sub-input')?.value || portfolioData.headerConfig.brandSub;
    portfolioData.headerConfig.ctaText = document.getElementById('header-cta-text-input')?.value || portfolioData.headerConfig.ctaText;
    portfolioData.headerConfig.ctaLink = document.getElementById('header-cta-link-input')?.value || portfolioData.headerConfig.ctaLink;

    // Hero
    if (portfolioData.hero) {
      portfolioData.hero.badge = document.getElementById('hero-input-badge')?.value || portfolioData.hero.badge;
      portfolioData.hero.titlePrefix = document.getElementById('hero-input-prefix')?.value || portfolioData.hero.titlePrefix;
      portfolioData.hero.titleHighlight = document.getElementById('hero-input-highlight')?.value || portfolioData.hero.titleHighlight;
      portfolioData.hero.subtitle = document.getElementById('hero-input-subtitle')?.value || portfolioData.hero.subtitle;
      portfolioData.hero.ctaPrimary = document.getElementById('hero-input-cta-primary')?.value || portfolioData.hero.ctaPrimary;
      portfolioData.hero.ctaSecondary = document.getElementById('hero-input-cta-secondary')?.value || portfolioData.hero.ctaSecondary;

      const platStr = document.getElementById('hero-input-platforms')?.value;
      if (platStr) {
        portfolioData.hero.platforms = platStr.split(',').map(s => s.trim()).filter(Boolean);
      }

      document.querySelectorAll('.stat-val-input').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.hero.stats[idx]) {
          portfolioData.hero.stats[idx].value = input.value;
        }
      });
      document.querySelectorAll('.stat-lbl-input').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.hero.stats[idx]) {
          portfolioData.hero.stats[idx].label = input.value;
        }
      });
    }

    // Platforms
    if (portfolioData.platformsSection && portfolioData.platformsSection.items) {
      document.querySelectorAll('.plat-name').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].name = input.value;
        }
      });
      document.querySelectorAll('.plat-tagline').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].tagline = input.value;
        }
      });
      document.querySelectorAll('.plat-badge').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].badge = input.value;
        }
      });
      document.querySelectorAll('.plat-desc').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].description = input.value;
        }
      });
      document.querySelectorAll('.plat-metrics').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].metrics = input.value.split(',').map(s=>s.trim()).filter(Boolean);
        }
      });
      document.querySelectorAll('.plat-capabilities').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.platformsSection.items[idx]) {
          portfolioData.platformsSection.items[idx].capabilities = input.value.split('\n').map(s=>s.trim()).filter(Boolean);
        }
      });
    }

    // Skills
    if (portfolioData.skills && portfolioData.skills.categories) {
      document.querySelectorAll('.skill-cat-title').forEach(input => {
        const cidx = parseInt(input.getAttribute('data-cidx'));
        if (portfolioData.skills.categories[cidx]) {
          portfolioData.skills.categories[cidx].category = input.value;
        }
      });
      document.querySelectorAll('.skill-name-in').forEach(input => {
        const cidx = parseInt(input.getAttribute('data-cidx'));
        const skidx = parseInt(input.getAttribute('data-skidx'));
        if (portfolioData.skills.categories[cidx] && portfolioData.skills.categories[cidx].skills[skidx]) {
          portfolioData.skills.categories[cidx].skills[skidx].name = input.value;
        }
      });
      document.querySelectorAll('.skill-level-in').forEach(input => {
        const cidx = parseInt(input.getAttribute('data-cidx'));
        const skidx = parseInt(input.getAttribute('data-skidx'));
        if (portfolioData.skills.categories[cidx] && portfolioData.skills.categories[cidx].skills[skidx]) {
          portfolioData.skills.categories[cidx].skills[skidx].level = parseInt(input.value) || 90;
        }
      });
    }

    // Education
    if (portfolioData.education && portfolioData.education.items) {
      document.querySelectorAll('.edu-degree-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) portfolioData.education.items[idx].degree = input.value;
      });
      document.querySelectorAll('.edu-inst-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) portfolioData.education.items[idx].institution = input.value;
      });
      document.querySelectorAll('.edu-period-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) portfolioData.education.items[idx].period = input.value;
      });
      document.querySelectorAll('.edu-status-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) portfolioData.education.items[idx].status = input.value;
      });
      document.querySelectorAll('.edu-desc-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) portfolioData.education.items[idx].description = input.value;
      });
      document.querySelectorAll('.edu-hl-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.education.items[idx]) {
          portfolioData.education.items[idx].highlights = input.value.split('\n').map(s=>s.trim()).filter(Boolean);
        }
      });
    }

    // Projects
    if (portfolioData.projects && portfolioData.projects.items) {
      document.querySelectorAll('.proj-title-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].title = input.value;
      });
      document.querySelectorAll('.proj-plat-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].platform = input.value;
      });
      document.querySelectorAll('.proj-cat-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].category = input.value;
      });
      document.querySelectorAll('.proj-img-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].image = input.value;
      });
      document.querySelectorAll('.proj-livelink-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].liveLink = input.value;
      });
      document.querySelectorAll('.proj-vid-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].videoUrl = input.value;
      });
      document.querySelectorAll('.proj-refimgs-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) {
          portfolioData.projects.items[idx].referenceImages = input.value.split(',').map(s=>s.trim()).filter(Boolean);
        }
      });
      document.querySelectorAll('.proj-sum-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].summary = input.value;
      });
      document.querySelectorAll('.proj-chal-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].challenge = input.value;
      });
      document.querySelectorAll('.proj-sol-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) portfolioData.projects.items[idx].solution = input.value;
      });
      document.querySelectorAll('.proj-res-in').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        if (portfolioData.projects.items[idx]) {
          const parts = input.value.split(',').map(s=>s.trim()).filter(Boolean);
          portfolioData.projects.items[idx].results = parts.map(p => {
            const [m, l] = p.split('|');
            return { metric: m ? m.trim() : '', label: l ? l.trim() : '' };
          });
        }
      });
    }

    // Custom Sections
    if (portfolioData.customSections) {
      document.querySelectorAll('.csec-title').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        if (portfolioData.customSections[sidx]) portfolioData.customSections[sidx].title = input.value;
      });
      document.querySelectorAll('.csec-subtitle').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        if (portfolioData.customSections[sidx]) portfolioData.customSections[sidx].subtitle = input.value;
      });
      document.querySelectorAll('.csec-badge').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        if (portfolioData.customSections[sidx]) portfolioData.customSections[sidx].badge = input.value;
      });
      document.querySelectorAll('.csec-media').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        if (portfolioData.customSections[sidx]) portfolioData.customSections[sidx].mediaUrl = input.value;
      });
      document.querySelectorAll('.csec-content').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        if (portfolioData.customSections[sidx]) portfolioData.customSections[sidx].content = input.value;
      });

      document.querySelectorAll('.csec-card-title').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        const itidx = parseInt(input.getAttribute('data-itidx'));
        if (portfolioData.customSections[sidx] && portfolioData.customSections[sidx].items[itidx]) {
          portfolioData.customSections[sidx].items[itidx].title = input.value;
        }
      });
      document.querySelectorAll('.csec-card-icon').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        const itidx = parseInt(input.getAttribute('data-itidx'));
        if (portfolioData.customSections[sidx] && portfolioData.customSections[sidx].items[itidx]) {
          portfolioData.customSections[sidx].items[itidx].icon = input.value;
        }
      });
      document.querySelectorAll('.csec-card-desc').forEach(input => {
        const sidx = parseInt(input.getAttribute('data-sidx'));
        const itidx = parseInt(input.getAttribute('data-itidx'));
        if (portfolioData.customSections[sidx] && portfolioData.customSections[sidx].items[itidx]) {
          portfolioData.customSections[sidx].items[itidx].desc = input.value;
        }
      });
    }

    // Footer
    if (!portfolioData.footerConfig) portfolioData.footerConfig = {};
    portfolioData.footerConfig.aboutText = document.getElementById('footer-about-input')?.value || portfolioData.footerConfig.aboutText;
    portfolioData.footerConfig.copyrightText = document.getElementById('footer-copyright-input')?.value || portfolioData.footerConfig.copyrightText;
  };

  // Run initial check
  checkAuth();
});
