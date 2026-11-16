// Noreen Portfolio - Front-End Logic
// Works 100% on Cloudflare Pages (Pure Static Client-Side)

document.addEventListener('DOMContentLoaded', () => {
  // Load Portfolio Data
  const getPortfolioData = () => {
    try {
      const stored = localStorage.getItem('noreen_portfolio_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using default data:', e);
    }
    return window.DEFAULT_PORTFOLIO_DATA;
  };

  const data = getPortfolioData();

  // Dynamic Google Font Ingestion Engine
  const loadCustomGoogleFont = (fontFamilyName) => {
    if (!fontFamilyName) return;
    const cleanName = fontFamilyName.replace(/['",]/g, '').trim();
    if (!cleanName) return;

    const fontId = 'dynamic-google-font-' + cleanName.toLowerCase().replace(/\s+/g, '-');
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&display=swap`;
      document.head.appendChild(link);
    }
  };

  // Apply Theme & Font Styles (Supporting Bold + Italic & Custom Fonts)
  const applyStylesAndTheme = () => {
    const currentTheme = localStorage.getItem('noreen_current_theme') || (data.siteConfig && data.siteConfig.theme) || 'tnc-navy';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (data.siteConfig && data.siteConfig.fontStyle) {
      const fs = data.siteConfig.fontStyle;

      // Check if user set a custom font name
      const activeFont = (fs.customFontName && fs.customFontName.trim()) ? `'${fs.customFontName.trim()}', sans-serif` : (fs.fontFamily || "'Plus Jakarta Sans', sans-serif");
      
      if (fs.customFontName && fs.customFontName.trim()) {
        loadCustomGoogleFont(fs.customFontName.trim());
      } else if (fs.fontFamily) {
        loadCustomGoogleFont(fs.fontFamily.replace(/['",]/g, '').split(' ')[0]);
      }

      document.documentElement.style.setProperty('--font-family', activeFont);

      // Heading Style Combinations (normal, bold, italic, bold-italic)
      const hStyle = fs.headingStyle || 'bold-italic';
      if (hStyle === 'bold-italic') {
        document.documentElement.style.setProperty('--heading-font-style', 'italic');
        document.documentElement.style.setProperty('--heading-font-weight', '800');
      } else if (hStyle === 'italic') {
        document.documentElement.style.setProperty('--heading-font-style', 'italic');
        document.documentElement.style.setProperty('--heading-font-weight', fs.headingWeight || '600');
      } else if (hStyle === 'bold') {
        document.documentElement.style.setProperty('--heading-font-style', 'normal');
        document.documentElement.style.setProperty('--heading-font-weight', '800');
      } else {
        document.documentElement.style.setProperty('--heading-font-style', 'normal');
        document.documentElement.style.setProperty('--heading-font-weight', fs.headingWeight || '600');
      }

      // Body Style Combinations
      const bStyle = fs.bodyStyle || 'normal';
      if (bStyle === 'bold-italic') {
        document.documentElement.style.setProperty('--body-font-style', 'italic');
        document.documentElement.style.setProperty('--body-font-weight', '600');
      } else if (bStyle === 'italic') {
        document.documentElement.style.setProperty('--body-font-style', 'italic');
        document.documentElement.style.setProperty('--body-font-weight', '400');
      } else if (bStyle === 'bold') {
        document.documentElement.style.setProperty('--body-font-style', 'normal');
        document.documentElement.style.setProperty('--body-font-weight', '600');
      } else {
        document.documentElement.style.setProperty('--body-font-style', 'normal');
        document.documentElement.style.setProperty('--body-font-weight', '400');
      }
    }
  };

  applyStylesAndTheme();

  // Populate 10 Themes in Dropdown
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeBtn = document.getElementById('theme-btn');
  const quickThemeBtn = document.getElementById('btn-theme-quick');

  if (themeDropdown && window.THEMES) {
    const currentTheme = localStorage.getItem('noreen_current_theme') || (data.siteConfig && data.siteConfig.theme) || 'tnc-navy';
    themeDropdown.innerHTML = window.THEMES.map(t => `
      <div class="theme-option ${t.id === currentTheme ? 'active' : ''}" data-theme-id="${t.id}">
        <span class="theme-dot" style="background: ${t.primary}; border-color: ${t.accent};"></span>
        <div style="display:flex; flex-direction:column;">
          <strong style="font-size:0.83rem;">${t.name}</strong>
          <span style="font-size:0.7rem; color:var(--text-muted);">${t.description.substring(0, 32)}...</span>
        </div>
      </div>
    `).join('');

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      themeDropdown.classList.remove('show');
    });

    themeDropdown.querySelectorAll('.theme-option').forEach(el => {
      el.addEventListener('click', () => {
        const selectedId = el.getAttribute('data-theme-id');
        document.documentElement.setAttribute('data-theme', selectedId);
        localStorage.setItem('noreen_current_theme', selectedId);
        
        try {
          const current = getPortfolioData();
          current.siteConfig.theme = selectedId;
          localStorage.setItem('noreen_portfolio_data', JSON.stringify(current));
        } catch(e) {}

        themeDropdown.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
        themeDropdown.classList.remove('show');
      });
    });

    quickThemeBtn?.addEventListener('click', () => {
      const activeThemeId = document.documentElement.getAttribute('data-theme') || 'tnc-navy';
      const currentIndex = window.THEMES.findIndex(t => t.id === activeThemeId);
      const nextIndex = (currentIndex + 1) % window.THEMES.length;
      const nextTheme = window.THEMES[nextIndex];

      document.documentElement.setAttribute('data-theme', nextTheme.id);
      localStorage.setItem('noreen_current_theme', nextTheme.id);

      themeDropdown.querySelectorAll('.theme-option').forEach(opt => {
        if (opt.getAttribute('data-theme-id') === nextTheme.id) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('show'));
    });
  }

  // Smooth Scroll & Active Nav Highlights
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });

    const backToTopBtn = document.getElementById('btn-back-to-top');
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.style.display = 'flex';
      } else {
        backToTopBtn.style.display = 'none';
      }
    }
  });

  document.getElementById('btn-back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Render Announcement Bar
  const renderAnnouncement = () => {
    const bar = document.getElementById('top-announcement-bar');
    if (!bar) return;

    const ann = data.announcement;
    if (!ann || ann.enabled === false) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'block';
    const textEl = document.getElementById('announcement-text');
    if (textEl && ann.text) textEl.innerHTML = `<strong>Open for Opportunities:</strong> ${ann.text}`;

    const badgeEl = document.getElementById('announcement-badge');
    if (badgeEl && ann.badge) badgeEl.textContent = ann.badge;

    const linkEl = document.getElementById('announcement-link');
    if (linkEl) {
      if (ann.linkUrl) linkEl.href = ann.linkUrl;
      const linkText = document.getElementById('announcement-link-text');
      if (linkText && ann.linkText) linkText.textContent = ann.linkText;
    }
  };

  // Render Header Config
  const renderHeader = () => {
    const hc = data.headerConfig || {};
    const nameEl = document.getElementById('nav-brand-name');
    if (nameEl && hc.brandName) nameEl.textContent = hc.brandName;

    const subEl = document.getElementById('nav-brand-sub');
    if (subEl && hc.brandSub) subEl.textContent = hc.brandSub;

    const ctaText = document.getElementById('header-cta-text');
    if (ctaText && hc.ctaText) ctaText.textContent = hc.ctaText;

    const ctaBtn = document.getElementById('header-cta-btn');
    if (ctaBtn && hc.ctaLink) ctaBtn.href = hc.ctaLink;
  };

  // Render Prominent Large Flyers & Awards Carousel
  const renderFlyers = () => {
    const section = document.getElementById('flyers-showcase-section');
    const container = document.getElementById('flyers-slider-container');
    const dotsWrap = document.getElementById('flyer-dots-container');
    const prevBtn = document.getElementById('flyer-prev-btn');
    const nextBtn = document.getElementById('flyer-next-btn');

    if (!section || !container) return;

    const fs = data.flyersSection;
    if (!fs || fs.enabled === false || !fs.items || fs.items.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    // Remove existing slide items before buttons
    container.querySelectorAll('.flyer-slide-item').forEach(el => el.remove());

    fs.items.forEach((item, idx) => {
      const slide = document.createElement('div');
      slide.className = `flyer-slide-item ${idx === 0 ? 'active' : ''}`;
      slide.setAttribute('data-index', idx);
      slide.innerHTML = `
        <div class="flyer-slide-body">
          <div class="flyer-badge">${item.badge || '🏆 Official Award'}</div>
          <h2 class="flyer-slide-title">${item.title}</h2>
          <p class="flyer-slide-desc">${item.subtitle || ''}</p>
          <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
            ${item.linkUrl ? `
              <a href="${item.linkUrl}" class="btn btn-primary btn-sm">
                <span>${item.linkText || 'Explore Details'}</span>
                <i class="ri-arrow-right-line"></i>
              </a>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="openLightbox('${item.image}', '${item.title} - Official Certificate')">
              <i class="ri-zoom-in-line"></i> View Full Flyer
            </button>
          </div>
        </div>
        <div class="flyer-slide-media-wrap" onclick="openLightbox('${item.image}', '${item.title} - Official Certificate')">
          <img src="${item.image}" alt="${item.title}" class="flyer-slide-media">
          <div class="flyer-zoom-hint">
            <i class="ri-fullscreen-line"></i> Click to Zoom
          </div>
        </div>
      `;
      container.insertBefore(slide, prevBtn);
    });

    // Render Dots
    if (dotsWrap) {
      dotsWrap.innerHTML = fs.items.map((_, i) => `
        <div class="flyer-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
      `).join('');
    }

    // Carousel Slider Logic
    let currentSlide = 0;
    const slides = container.querySelectorAll('.flyer-slide-item');
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.flyer-dot') : [];
    const total = slides.length;

    const showSlide = (n) => {
      currentSlide = (n + total) % total;
      slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    };

    prevBtn?.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn?.addEventListener('click', () => showSlide(currentSlide + 1));

    dots.forEach((d, idx) => {
      d.addEventListener('click', () => showSlide(idx));
    });

    // Auto Advance every 6 seconds
    if (window._flyerAutoInterval) clearInterval(window._flyerAutoInterval);
    if (total > 1) {
      window._flyerAutoInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000);
    }
  };

  // Render Dedicated Profile Section
  const renderProfileSection = () => {
    const prof = data.profile || {};
    const imgEl = document.getElementById('profile-large-img');
    if (imgEl && prof.avatar) imgEl.src = prof.avatar;

    const nameEl = document.getElementById('profile-full-name');
    if (nameEl && prof.name) nameEl.textContent = prof.name;

    const roleEl = document.getElementById('profile-headline-role');
    if (roleEl && prof.role) roleEl.textContent = prof.role;

    const bioEl = document.getElementById('profile-detailed-bio');
    if (bioEl && prof.bio) bioEl.textContent = prof.bio;

    const locEl = document.getElementById('profile-location-text');
    if (locEl && prof.location) locEl.textContent = prof.location;

    const eduEl = document.getElementById('profile-education-text');
    if (eduEl && prof.educationBrief) eduEl.textContent = prof.educationBrief;

    const availEl = document.getElementById('profile-availability-text');
    if (availEl && prof.availability) availEl.textContent = prof.availability;

    // Contact buttons
    const whatsappNum = (data.siteConfig && data.siteConfig.contact && data.siteConfig.contact.whatsapp) || '923000000000';
    const waBtn = document.getElementById('profile-whatsapp-btn');
    if (waBtn) waBtn.href = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`;

    const liBtn = document.getElementById('profile-linkedin-btn');
    const liUrl = (data.siteConfig && data.siteConfig.contact && data.siteConfig.contact.linkedin) || '#';
    if (liBtn) liBtn.href = liUrl;
  };

  // Render Hero
  const renderHero = () => {
    if (!data.hero) return;
    const h = data.hero;

    const badgeEl = document.getElementById('hero-badge-text');
    if (badgeEl && h.badge) badgeEl.textContent = h.badge;

    const prefixEl = document.getElementById('hero-prefix');
    if (prefixEl && h.titlePrefix) prefixEl.textContent = h.titlePrefix;

    const highlightEl = document.getElementById('hero-highlight');
    if (highlightEl && h.titleHighlight) highlightEl.textContent = h.titleHighlight;

    const subEl = document.getElementById('hero-subtitle');
    if (subEl && h.subtitle) subEl.textContent = h.subtitle;

    const ctaPrimary = document.getElementById('hero-cta-primary');
    if (ctaPrimary && h.ctaPrimary) ctaPrimary.querySelector('span').textContent = h.ctaPrimary;

    const ctaSecondary = document.getElementById('hero-cta-secondary');
    if (ctaSecondary && h.ctaSecondary) ctaSecondary.querySelector('span').textContent = h.ctaSecondary;

    // Sync Avatar in Hero Card
    const avatarImg = document.getElementById('hero-avatar-img');
    const avatarSrc = (data.profile && data.profile.avatar) || (data.about && data.about.image);
    if (avatarImg && avatarSrc) avatarImg.src = avatarSrc;

    // Platform Pills
    const platformsBar = document.getElementById('hero-platforms-bar');
    if (platformsBar && h.platforms) {
      platformsBar.innerHTML = h.platforms.map(p => `
        <span class="hero-platform-pill">
          <i class="ri-check-line"></i> ${p}
        </span>
      `).join('');
    }

    // Stats Grid
    const statsGrid = document.getElementById('hero-stats-grid');
    if (statsGrid && h.stats) {
      statsGrid.innerHTML = h.stats.map(s => `
        <div class="stat-box">
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');
    }
  };

  // Render Methodology: From Consultation to Scale
  const renderProcess = () => {
    const grid = document.getElementById('process-grid');
    if (!grid || !data.processSection || !data.processSection.steps) return;

    grid.innerHTML = data.processSection.steps.map(step => `
      <div class="process-card">
        <div class="process-number">${step.number}</div>
        <div class="process-icon">
          <i class="${step.icon || 'ri-rocket-line'}"></i>
        </div>
        <h4>${step.title}</h4>
        <p>${step.desc}</p>
      </div>
    `).join('');
  };

  // Render About
  const renderAbout = () => {
    if (!data.about) return;
    const a = data.about;

    const badgeEl = document.getElementById('about-badge');
    if (badgeEl && a.badge) badgeEl.textContent = a.badge;

    const titleEl = document.getElementById('about-title');
    if (titleEl && a.title) titleEl.textContent = a.title;

    const leadEl = document.getElementById('about-lead');
    if (leadEl && a.leadParagraph) leadEl.textContent = a.leadParagraph;

    const bodyEl = document.getElementById('about-body');
    if (bodyEl && a.bodyParagraph) bodyEl.textContent = a.bodyParagraph;

    const quoteEl = document.getElementById('about-quote');
    if (quoteEl && a.quote) quoteEl.textContent = `"${a.quote}"`;

    const imgEl = document.getElementById('about-image');
    if (imgEl && a.image) imgEl.src = a.image;

    const highlightsGrid = document.getElementById('about-highlights-grid');
    if (highlightsGrid && a.highlights) {
      const icons = ['ri-medal-line', 'ri-team-line', 'ri-brain-line', 'ri-shield-check-line'];
      highlightsGrid.innerHTML = a.highlights.map((h, i) => `
        <div class="highlight-card">
          <div class="highlight-icon">
            <i class="${icons[i % icons.length]}"></i>
          </div>
          <h4>${h.title}</h4>
          <p>${h.desc}</p>
        </div>
      `).join('');
    }
  };

  // Render Platforms Showcase
  const renderPlatforms = () => {
    if (!data.platformsSection) return;
    const ps = data.platformsSection;

    const badge = document.getElementById('platforms-badge');
    if (badge && ps.badge) badge.textContent = ps.badge;

    const title = document.getElementById('platforms-title');
    if (title && ps.title) title.textContent = ps.title;

    const subtitle = document.getElementById('platforms-subtitle');
    if (subtitle && ps.subtitle) subtitle.textContent = ps.subtitle;

    const grid = document.getElementById('platforms-grid');
    if (grid && ps.items) {
      grid.innerHTML = ps.items.map(item => `
        <div class="platform-card">
          <div class="platform-card-header">
            <div class="platform-icon-wrap">
              <i class="${item.icon || 'ri-store-3-line'}"></i>
            </div>
            <span class="platform-badge">${item.badge}</span>
          </div>

          <h3 class="platform-title">${item.name}</h3>
          <div class="platform-tagline">${item.tagline}</div>
          <p class="platform-desc">${item.description}</p>

          <div class="platform-metrics">
            ${(item.metrics || []).map(m => `<span class="platform-metric-tag"><i class="ri-arrow-up-circle-fill" style="color:#10b981;"></i> ${m}</span>`).join('')}
          </div>

          <div class="platform-checklist">
            ${(item.capabilities || []).map(c => `
              <div class="platform-check-item">
                <i class="ri-checkbox-circle-fill"></i>
                <span>${c}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  };

  // Render Skills
  const renderSkills = () => {
    if (!data.skills) return;
    const s = data.skills;

    const badge = document.getElementById('skills-badge');
    if (badge && s.badge) badge.textContent = s.badge;

    const title = document.getElementById('skills-title');
    if (title && s.title) title.textContent = s.title;

    const subtitle = document.getElementById('skills-subtitle');
    if (subtitle && s.subtitle) subtitle.textContent = s.subtitle;

    const grid = document.getElementById('skills-grid');
    if (grid && s.categories) {
      grid.innerHTML = s.categories.map(cat => `
        <div class="skill-category-card">
          <div class="skill-category-header">
            <div class="skill-category-icon">
              <i class="${cat.icon || 'ri-tools-fill'}"></i>
            </div>
            <h3 style="font-size: 1.25rem;">${cat.category}</h3>
          </div>

          <div>
            ${(cat.skills || []).map(sk => `
              <div class="skill-item">
                <div class="skill-label-wrap">
                  <span>${sk.name}</span>
                  <span style="color: var(--accent); font-weight:700;">${sk.level}%</span>
                </div>
                <div class="skill-progress-bar">
                  <div class="skill-progress-fill" style="width: ${sk.level}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  };

  // Render Education
  const renderEducation = () => {
    if (!data.education) return;
    const e = data.education;

    const badge = document.getElementById('education-badge');
    if (badge && e.badge) badge.textContent = e.badge;

    const title = document.getElementById('education-title');
    if (title && e.title) title.textContent = e.title;

    const subtitle = document.getElementById('education-subtitle');
    if (subtitle && e.subtitle) subtitle.textContent = e.subtitle;

    const grid = document.getElementById('education-grid');
    if (grid && e.items) {
      grid.innerHTML = e.items.map(item => `
        <div class="education-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="edu-tag"><i class="ri-graduation-cap-line"></i> ${item.status}</span>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">${item.period}</span>
          </div>

          <h3 class="edu-degree">${item.degree}</h3>
          <div class="edu-institution"><i class="ri-building-line"></i> ${item.institution}</div>
          <p class="edu-desc">${item.description}</p>

          <div class="edu-points">
            ${(item.highlights || []).map(h => `
              <div class="edu-point">
                <i class="ri-check-double-line"></i>
                <span>${h}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  };

  // Render Experience Timeline
  const renderExperience = () => {
    if (!data.experience) return;
    const exp = data.experience;

    const badge = document.getElementById('experience-badge');
    if (badge && exp.badge) badge.textContent = exp.badge;

    const title = document.getElementById('experience-title');
    if (title && exp.title) title.textContent = exp.title;

    const subtitle = document.getElementById('experience-subtitle');
    if (subtitle && exp.subtitle) subtitle.textContent = exp.subtitle;

    const timeline = document.getElementById('experience-timeline');
    if (timeline && exp.timeline) {
      timeline.innerHTML = exp.timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-header">
              <div>
                <h3 class="timeline-role">${item.role}</h3>
                <div class="timeline-company">${item.company} • <span style="color:var(--text-muted); font-size:0.85rem;">${item.type || 'Full-Time'}</span></div>
              </div>
              <span class="timeline-period">${item.period}</span>
            </div>

            <p class="timeline-desc">${item.description}</p>

            <div class="timeline-achievements">
              ${(item.achievements || []).map(a => `
                <div class="timeline-achieve-item">
                  <i class="ri-checkbox-circle-fill"></i>
                  <span>${a}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');
    }
  };

  // Render Projects & Case Studies (With Reference Images & Live Links)
  const renderProjects = () => {
    if (!data.projects) return;
    const p = data.projects;

    const badge = document.getElementById('projects-badge');
    if (badge && p.badge) badge.textContent = p.badge;

    const title = document.getElementById('projects-title');
    if (title && p.title) title.textContent = p.title;

    const subtitle = document.getElementById('projects-subtitle');
    if (subtitle && p.subtitle) subtitle.textContent = p.subtitle;

    const grid = document.getElementById('projects-grid');
    if (!grid || !p.items) return;

    const renderFiltered = (filter) => {
      const filtered = filter === 'all' 
        ? p.items 
        : p.items.filter(item => item.platform && item.platform.toLowerCase().includes(filter.toLowerCase()));

      grid.innerHTML = filtered.map(item => `
        <div class="project-card" data-project-id="${item.id}">
          <div class="project-media-wrap">
            <img src="${item.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'}" alt="${item.title}" class="project-media">
            <span class="project-platform-badge">${item.platform}</span>
          </div>

          <div class="project-body">
            <div style="font-size:0.75rem; color:var(--accent); font-weight:700; text-transform:uppercase; margin-bottom:0.35rem;">
              ${item.category || 'Case Study'}
            </div>
            <h3 class="project-title">${item.title}</h3>
            <p class="project-summary">${item.summary}</p>

            <div class="project-metrics-grid">
              ${(item.results || []).map(r => `
                <div>
                  <div class="proj-metric-val">${r.metric}</div>
                  <div class="proj-metric-lbl">${r.label}</div>
                </div>
              `).join('')}
            </div>

            ${item.referenceImages && item.referenceImages.length > 0 ? `
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:0.35rem;">
                <i class="ri-image-2-line"></i> Reference Proof Screenshots:
              </div>
              <div class="project-ref-strip">
                ${item.referenceImages.map((img, refIdx) => `
                  <img src="${img}" alt="Screenshot Proof ${refIdx+1}" class="ref-thumb" onclick="openLightbox('${img}', '${item.title} - Reference Screenshot')">
                `).join('')}
              </div>
            ` : ''}

            <div class="project-card-actions">
              <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openProjectModal('${item.id}')">
                <span>View Details</span>
                <i class="ri-arrow-right-line"></i>
              </button>
              ${item.liveLink ? `
                <a href="${item.liveLink}" target="_blank" class="btn btn-outline btn-sm" title="Open Store / External Link">
                  <i class="ri-external-link-line"></i> Store
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    };

    renderFiltered('all');

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFiltered(btn.getAttribute('data-filter'));
      });
    });
  };

  // Render Dynamic Custom Sections (Created from Admin)
  const renderCustomSections = () => {
    const container = document.getElementById('dynamic-custom-sections');
    if (!container) return;

    if (!data.customSections || data.customSections.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = data.customSections.map(sec => `
      <section class="custom-section" id="${sec.id || 'sec-' + Math.random().toString(36).substr(2, 6)}">
        <div class="container">
          <div class="section-header">
            ${sec.badge ? `<div class="section-badge">${sec.badge}</div>` : ''}
            <h2 class="section-title">${sec.title}</h2>
            ${sec.subtitle ? `<p class="section-subtitle">${sec.subtitle}</p>` : ''}
          </div>

          ${sec.content ? `<div style="max-width: 820px; margin: 0 auto 2.5rem; text-align: center; font-size: 1.05rem; color: var(--text-muted);">${sec.content}</div>` : ''}

          ${sec.mediaUrl ? `
            <div class="custom-media-frame" style="max-width: 850px; margin: 0 auto 2.5rem;">
              ${sec.mediaUrl.includes('youtube') || sec.mediaUrl.includes('vimeo') 
                ? `<iframe src="${sec.mediaUrl}" allowfullscreen></iframe>`
                : `<img src="${sec.mediaUrl}" alt="${sec.title}" style="width:100%; height:100%; object-fit:cover;">`
              }
            </div>
          ` : ''}

          ${sec.items && sec.items.length > 0 ? `
            <div class="custom-cards-grid">
              ${sec.items.map(it => `
                <div class="custom-card-item">
                  <div class="custom-card-icon">
                    <i class="${it.icon || 'ri-star-line'}"></i>
                  </div>
                  <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${it.title}</h3>
                  <p style="font-size: 0.92rem; color: var(--text-muted);">${it.desc || it.description || ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </section>
    `).join('');
  };

  // Render Testimonials
  const renderTestimonials = () => {
    const grid = document.getElementById('testimonials-grid');
    if (!grid || !data.testimonials) return;

    grid.innerHTML = data.testimonials.map(t => `
      <div class="testimonial-card">
        <div class="stars">
          ${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}
        </div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <img src="${t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" alt="${t.name}" class="author-avatar">
          <div class="author-info">
            <h4>${t.name}</h4>
            <p>${t.role} • <span style="color:var(--text-muted);">${t.platform}</span></p>
          </div>
        </div>
      </div>
    `).join('');
  };

  // Render FAQ
  const renderFAQ = () => {
    const wrap = document.getElementById('faq-wrap');
    if (!wrap || !data.faq) return;

    wrap.innerHTML = data.faq.map((item, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}">
        <button class="faq-question">
          <span>${item.q}</span>
          <i class="ri-arrow-down-s-line faq-icon"></i>
        </button>
        <div class="faq-answer">
          <p>${item.a}</p>
        </div>
      </div>
    `).join('');

    wrap.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        item.classList.toggle('active');
      });
    });
  };

  // Render Contact Info
  const renderContact = () => {
    if (!data.siteConfig || !data.siteConfig.contact) return;
    const c = data.siteConfig.contact;

    const emailLink = document.getElementById('contact-email-link');
    if (emailLink && c.email) {
      emailLink.href = `mailto:${c.email}`;
      emailLink.textContent = c.email;
    }

    const whatsappLink = document.getElementById('contact-whatsapp-link');
    if (whatsappLink && c.whatsapp) {
      whatsappLink.href = `https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`;
      whatsappLink.textContent = c.phone || c.whatsapp;
    }

    const loc = document.getElementById('contact-location-text');
    if (loc && c.location) loc.textContent = c.location;

    const avail = document.getElementById('contact-availability-text');
    if (avail && c.availability) avail.textContent = c.availability;
  };

  // Render Footer Config
  const renderFooter = () => {
    const fc = data.footerConfig || {};
    const hc = data.headerConfig || {};

    const brandName = document.getElementById('footer-brand-name');
    if (brandName) brandName.textContent = hc.brandName || "Noreen";

    const brandSub = document.getElementById('footer-brand-sub');
    if (brandSub) brandSub.textContent = hc.brandSub || "eCommerce Account Lead";

    const aboutText = document.getElementById('footer-about-text');
    if (aboutText && fc.aboutText) aboutText.textContent = fc.aboutText;

    const copyText = document.getElementById('footer-copyright-text');
    if (copyText && fc.copyrightText) copyText.textContent = fc.copyrightText;

    const currentYear = document.getElementById('current-year');
    if (currentYear) currentYear.textContent = new Date().getFullYear();
  };

  // Handle Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;
      const platform = document.getElementById('form-platform').value;
      const revenue = document.getElementById('form-revenue').value;
      const message = document.getElementById('form-message').value;

      const whatsappNum = (data.siteConfig && data.siteConfig.contact && data.siteConfig.contact.whatsapp) || '923000000000';
      const cleanNum = whatsappNum.replace(/[^0-9]/g, '');

      const textMsg = `*New Inquiry for Noreen — eCommerce Account Lead*%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Email:* ${encodeURIComponent(email)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        `*Target Platform:* ${encodeURIComponent(platform)}%0A` +
        `*Monthly Revenue:* ${encodeURIComponent(revenue)}%0A` +
        `*Message:* ${encodeURIComponent(message)}`;

      const statusEl = document.getElementById('form-status');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#10b981';
        statusEl.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Thank you ${name}! Opening direct connection via WhatsApp/Email...`;
      }

      setTimeout(() => {
        window.open(`https://wa.me/${cleanNum}?text=${textMsg}`, '_blank');
      }, 800);
    });
  }

  // Execute all renders
  renderAnnouncement();
  renderHeader();
  renderFlyers();
  renderProfileSection();
  renderHero();
  renderProcess();
  renderAbout();
  renderPlatforms();
  renderSkills();
  renderEducation();
  renderExperience();
  renderProjects();
  renderCustomSections();
  renderTestimonials();
  renderFAQ();
  renderContact();
  renderFooter();
});

// Modal Logic for Projects
window.openProjectModal = (projId) => {
  const modal = document.getElementById('project-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  const data = JSON.parse(localStorage.getItem('noreen_portfolio_data') || 'null') || window.DEFAULT_PORTFOLIO_DATA;
  const project = data.projects.items.find(p => p.id === projId);

  if (!project) return;

  body.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <span class="project-platform-badge" style="position:static; display:inline-block; margin-bottom:0.75rem;">${project.platform}</span>
      <h2 style="font-size: 1.6rem; margin-bottom: 0.5rem;">${project.title}</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem;">${project.summary}</p>
    </div>

    ${project.videoUrl ? `
      <div style="aspect-ratio: 16/9; margin-bottom: 1.5rem; border-radius: var(--radius-md); overflow:hidden; border:1px solid var(--border-color);">
        <iframe src="${project.videoUrl}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
      </div>
    ` : project.image ? `
      <img src="${project.image}" alt="${project.title}" style="width:100%; border-radius: var(--radius-md); margin-bottom: 1.5rem; max-height:300px; object-fit:cover; border:1px solid var(--border-color);">
    ` : ''}

    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
      <h4 style="color: #ef4444; font-size: 0.95rem; margin-bottom: 0.35rem;"><i class="ri-alert-line"></i> The Challenge</h4>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${project.challenge || 'Client faced sub-optimal sales and account health bottlenecks.'}</p>

      <h4 style="color: #10b981; font-size: 0.95rem; margin-bottom: 0.35rem;"><i class="ri-lightbulb-line"></i> Strategic Solution</h4>
      <p style="font-size: 0.9rem; color: var(--text-muted);">${project.solution || 'Implemented data-driven repricing, catalog revamp, and targeted advertising.'}</p>
    </div>

    <h4 style="font-size: 1rem; margin-bottom: 0.75rem;">Verified Key Results:</h4>
    <div class="project-metrics-grid" style="margin-bottom: 1.5rem;">
      ${(project.results || []).map(r => `
        <div>
          <div class="proj-metric-val">${r.metric}</div>
          <div class="proj-metric-lbl">${r.label}</div>
        </div>
      `).join('')}
    </div>

    ${project.referenceImages && project.referenceImages.length > 0 ? `
      <h4 style="font-size: 1rem; margin-bottom: 0.75rem;"><i class="ri-gallery-line"></i> Reference Proof Screenshots (Click to Zoom):</h4>
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        ${project.referenceImages.map((img, idx) => `
          <img src="${img}" alt="Proof ${idx+1}" style="width:100px; height:65px; border-radius:6px; object-fit:cover; border:1px solid var(--border-color); cursor:pointer;" onclick="openLightbox('${img}', '${project.title} - Screenshot ${idx+1}')">
        `).join('')}
      </div>
    ` : ''}

    <div style="display:flex; justify-content: space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      ${project.liveLink ? `
        <a href="${project.liveLink}" target="_blank" class="btn btn-secondary btn-sm">
          <i class="ri-external-link-line"></i> Visit Storefront Link
        </a>
      ` : '<div></div>'}
      <a href="#contact" class="btn btn-primary btn-sm" onclick="document.getElementById('project-modal').classList.remove('active')">
        <i class="ri-message-3-line"></i> Request Similar Results
      </a>
    </div>
  `;

  modal.classList.add('active');
};

document.getElementById('modal-close')?.addEventListener('click', () => {
  document.getElementById('project-modal')?.classList.remove('active');
});

document.getElementById('project-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'project-modal') {
    e.target.classList.remove('active');
  }
});

// Lightbox Zoom Logic
window.openLightbox = (imgSrc, caption = '') => {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (!modal || !img) return;

  img.src = imgSrc;
  if (cap) cap.textContent = caption;
  modal.classList.add('active');
};

document.getElementById('lightbox-close')?.addEventListener('click', () => {
  document.getElementById('lightbox-modal')?.classList.remove('active');
});

document.getElementById('lightbox-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'lightbox-modal') {
    e.target.classList.remove('active');
  }
});
