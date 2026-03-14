document.addEventListener('DOMContentLoaded', () => {

  // Theme toggle: persist preference and respect OS setting
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeToggleIcon = document.getElementById('themeToggleIcon');

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark'){
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'true');
      if (themeToggleIcon){ themeToggleIcon.classList.remove('bi-moon'); themeToggleIcon.classList.add('bi-sun'); }
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label','Switch to light mode');
    } else {
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'false');
      if (themeToggleIcon){ themeToggleIcon.classList.remove('bi-sun'); themeToggleIcon.classList.add('bi-moon'); }
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label','Switch to dark mode');
    }
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  // Update if OS preference changes but user hasn't explicitly set a theme
  if (window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  if (themeToggleBtn){
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch(e){}
    });
  }

  // Swachh Bharat Video Audio Toggle
  const audioToggleBtn = document.getElementById('audioToggle');
  const swachhVideo = document.getElementById('swachhVideo');
  let isAudioOn = false;

  if (audioToggleBtn && swachhVideo) {
    audioToggleBtn.addEventListener('click', () => {
      isAudioOn = !isAudioOn;
      
      if (isAudioOn) {
        // Enable audio
        swachhVideo.style.opacity = '1';
        audioToggleBtn.querySelector('.audio-text').textContent = 'Audio ON';
        audioToggleBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i><span class="audio-text">Audio ON</span>';
        // Note: YouTube iframe audio cannot be directly controlled via JavaScript
        // This is a UI indicator for user understanding
      } else {
        // Disable audio (mute effect)
        audioToggleBtn.querySelector('.audio-text').textContent = 'Audio OFF';
        audioToggleBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i><span class="audio-text">Audio OFF</span>';
      }
    });
  }

  // Count-up animation for Swachh Bharat statistics
  function animateCountUp(element, target, duration = 2000) {
    const startValue = 0;
    const difference = target - startValue;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + difference * easeProgress);
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    }

    requestAnimationFrame(updateCount);
  }

  // Intersection Observer for scroll-triggered animations and count-up
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';

        // Handle stats-container count-up animation
        if (entry.target.classList.contains('stats-container')) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach(stat => {
            const targetValue = parseInt(stat.dataset.target, 10);
            if (!isNaN(targetValue)) {
              animateCountUp(stat, targetValue, 2000);
            }
          });
        }

        // Handle AOS animate elements (fade-in + slide animations)
        if (entry.target.classList.contains('aos-animate')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      }
    });
  }, observerOptions);

  // Observe stats container and all aos-animate elements
  const statsContainer = document.querySelector('.stats-container');
  if (statsContainer) {
    animationObserver.observe(statsContainer);
  }

  const aosElements = document.querySelectorAll('.aos-animate');
  aosElements.forEach(el => {
    animationObserver.observe(el);
  });

  // Set footer year dynamically
  const footerYearEl = document.getElementById('footerYear');
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // Ensure the #home section fills the viewport minus the navbar so the poster fits without scrolling
  function adjustHomeHeight(){
    const navbar = document.querySelector('.navbar');
    const home = document.getElementById('home');
    if (!home) return;
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    // Reserve space for the fixed navbar so subsequent content starts below it
    document.body.style.paddingTop = navbarHeight + 'px';
    document.documentElement.style.setProperty('--home-nav-h', navbarHeight + 'px');
    const targetHeight = Math.max(0, window.innerHeight - navbarHeight);
    home.style.height = targetHeight + 'px';
    home.style.minHeight = targetHeight + 'px';
  }
  window.addEventListener('resize', adjustHomeHeight);
  window.addEventListener('orientationchange', adjustHomeHeight);
  // run once to set initial size
  adjustHomeHeight();

  // Initialize auth UI (replace login/signup with profile when signed in)
  if (window.cleanSightAuth && typeof window.cleanSightAuth.initAuthUI === 'function'){
    try{ window.cleanSightAuth.initAuthUI(); }catch(e){}
  }

  // --- Real-time Impact Polling ---
  const recentList = document.getElementById('recentList');
  const totalReportsEl = document.getElementById('totalReports');
  const resolvedCountEl = document.getElementById('resolvedCount');
  const avgResponseTimeEl = document.getElementById('avgResponseTime');
  const wasteManagedEl = document.getElementById('wasteManaged');
  const verifiedPercentEl = document.getElementById('verifiedPercent');
  const insightsList = document.getElementById('insightsList');
  const refreshBtn = document.getElementById('refreshImpact');

  function timeAgo(date){
    if (!date) return '';
    const d = new Date(date);
    const s = Math.floor((Date.now() - d.getTime())/1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  }

  function formatMinutes(ms){
    if (ms == null) return '--';
    const mins = Math.round(ms/60000);
    return mins + 'm';
  }

  // smooth count animation
  function animateCount(el, to, duration=800){
    if (!el) return;
    const start = Number(el.textContent.replace(/[^0-9]/g,'')) || 0;
    const diff = to - start;
    const startTime = performance.now();
    function step(now){
      const t = Math.min(1, (now - startTime)/duration);
      const val = Math.floor(start + diff * t);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function fetchImpact(){
    try{
      const res = await fetch('http://localhost:5000/api/reports/all');
      const body = await res.json();
      if (!body || !body.data) return;
      const data = body.data;
      // totals
      const total = data.length;
      const resolved = data.filter(r => (r.status||'').toLowerCase() === 'resolved').length;

      // average response time (if createdAt & resolvedAt present)
      let times = [];
      data.forEach(r => {
        if (r.createdAt && r.resolvedAt){
          const t = new Date(r.resolvedAt) - new Date(r.createdAt);
          if (!isNaN(t) && t>0) times.push(t);
        }
      });
      const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : null;

      // waste managed: sum known numeric fields (weightKg, weight, amount)
      let waste = 0; let wasteCount = 0;
      data.forEach(r => {
        const keys = ['weightKg','weight','amount','kg'];
        for (const k of keys){ if (r[k] && !isNaN(Number(r[k]))){ waste += Number(r[k]); wasteCount++; break; } }
      });

      // verified percent: resolved/total
      const verifiedPct = total ? Math.round((resolved/total)*100) : 0;

      // update UI (animated counters)
      if (totalReportsEl) animateCount(totalReportsEl, total);
      if (resolvedCountEl) animateCount(resolvedCountEl, resolved);
      if (avgResponseTimeEl) avgResponseTimeEl.innerText = avg ? Math.round(avg/60000) + 'm' : '--';
      if (wasteManagedEl) {
        const numeric = Math.round(waste);
        if (wasteManagedEl) animateCount(wasteManagedEl, numeric);
        // append unit after small delay
        setTimeout(()=>{ if (wasteManagedEl) wasteManagedEl.innerText = (numeric).toLocaleString() + ' kg'; }, 900);
      }
      if (verifiedPercentEl) verifiedPercentEl.innerText = verifiedPct + '%';

      // recent list (show latest 8)
      if (recentList){
        recentList.innerHTML = '';
        const sorted = data.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
        (sorted.slice(0,8)).forEach(r => {
          const status = r.status || 'Unknown';
          const li = document.createElement('div'); li.className = 'list-group-item d-flex justify-content-between align-items-start';
          const left = document.createElement('div');
          left.innerHTML = `<div class="fw-bold">${r.issueType || 'Issue'}</div><div class="small text-muted">${r.location || 'Unknown location'}</div>`;
          const right = document.createElement('div');
          const created = r.createdAt ? timeAgo(r.createdAt) : ''; const resp = (r.createdAt && r.resolvedAt) ? formatMinutes(new Date(r.resolvedAt)-new Date(r.createdAt)) : '--';
          right.innerHTML = `<div class="text-end"><span class="badge ${status.toLowerCase()==='resolved'?'bg-success':'bg-secondary'}">${status}</span></div><div class="small text-muted mt-1">${created} • ${resp}</div>`;
          li.appendChild(left); li.appendChild(right);
          recentList.appendChild(li);
        });
      }

      // insights
      if (insightsList){
        insightsList.innerHTML = '';
        insightsList.appendChild(Object.assign(document.createElement('li'),{innerText:`${total} reports total` }));
        insightsList.appendChild(Object.assign(document.createElement('li'),{innerText:`${resolved} resolved (${verifiedPct}%)`}));
        if (avg) insightsList.appendChild(Object.assign(document.createElement('li'),{innerText:`Avg resolution: ${Math.round(avg/60000)} minutes`}));
      }
    }catch(err){
      console.error('impact fetch error', err);
      if (recentList) recentList.innerHTML = '<div class="list-group-item text-danger">Live data unavailable</div>';
    }
  }

  // initial fetch & polling
  fetchImpact();
  let impactInterval = setInterval(fetchImpact, 8000);
  if (refreshBtn) refreshBtn.addEventListener('click', ()=>{ fetchImpact(); clearInterval(impactInterval); impactInterval = setInterval(fetchImpact, 8000); });
  // Take Action form handling
  const takeActionForm = document.getElementById('takeActionForm');
  const taFeedback = document.getElementById('taFeedback');
  if (takeActionForm){
    takeActionForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nameEl = document.getElementById('taName');
      const messageEl = document.getElementById('taMessage');
      // simple validation
      if (!nameEl.value.trim()){
        nameEl.classList.add('is-invalid');
        return;
      } else { nameEl.classList.remove('is-invalid'); }
      if (!messageEl.value.trim()){
        messageEl.classList.add('is-invalid');
        return;
      } else { messageEl.classList.remove('is-invalid'); }

      if (taFeedback) taFeedback.innerHTML = '<div class="alert alert-success">Thanks! We received your message. We will reach out soon.</div>';
      takeActionForm.reset();
      // collapse the form after submit
      const collapseEl = document.getElementById('actionForm');
      if (collapseEl){
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
        bsCollapse.hide();
      }
    });
  }

  // Hero CTA: open the action form and scroll to it
  const heroBtn = document.getElementById('heroTakeActionBtn');
  if (heroBtn){
    heroBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const collapseEl = document.getElementById('actionForm');
      if (collapseEl){
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
        bsCollapse.show();
        const target = document.querySelector('.take-action-section') || collapseEl;
        const navH = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
        const top = (target.getBoundingClientRect().top + window.scrollY) - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  // Require authentication before allowing "Report Issue"
  const reportBtn = document.getElementById('reportIssueBtn');
  if (reportBtn){
    // Direct link to /report
    // Removed auth check for direct redirect
  }

  // Final CTA Button - Same functionality as Report Issue
  const finalCtaBtn = document.getElementById('finalCtaBtn');
  if (finalCtaBtn) {
    // Direct link to /report
    // Removed auth check for direct redirect
  }

});
