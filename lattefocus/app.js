(() => {
  'use strict';

  const preview = document.querySelector('#app-preview');
  const timer = document.querySelector('#timer');
  const startButton = document.querySelector('#start-focus');
  const resetButton = document.querySelector('#reset-focus');
  const caption = document.querySelector('#timer-caption');
  const focusTitle = document.querySelector('#focus-title');
  const focusHint = document.querySelector('#focus-hint');
  const demoNote = document.querySelector('#demo-note');
  const durationButtons = [...document.querySelectorAll('[data-minutes]')];
  const customButton = document.querySelector('#custom-button');
  const customPanel = document.querySelector('#custom-duration');
  const customRange = document.querySelector('#custom-range');
  const themeButton = document.querySelector('#theme-toggle');
  const editSpaceButton = document.querySelector('#edit-space');
  const dialog = document.querySelector('#space-dialog');
  const saveSpaceButton = document.querySelector('#save-space');
  let chosenApps = ['Notes', 'Safari', 'Figma'];
  let minutes = 45;
  let secondsLeft = minutes * 60;
  let deadline = 0;
  let running = false;
  let started = false;
  let ticker;

  function renderClock() {
    const hours = Math.floor(secondsLeft / 3600);
    const mins = Math.floor(secondsLeft / 60) % 60;
    const secs = secondsLeft % 60;
    timer.textContent = hours ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timer.setAttribute('aria-label', `${Math.floor(secondsLeft / 60)} minutes and ${secs} seconds remaining`);
  }

  function setDuration(value) {
    if (started) return;
    minutes = Math.min(360, Math.max(5, Math.round(value / 5) * 5));
    secondsLeft = minutes * 60;
    const isCustom = ![30, 45, 90].includes(minutes);
    durationButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.minutes) === minutes)));
    customButton.textContent = isCustom ? `${minutes} min` : 'Custom';
    customButton.setAttribute('aria-pressed', String(isCustom));
    customRange.value = String(minutes);
    document.querySelector('#custom-value').textContent = `${minutes} min`;
    renderClock();
  }

  function closeCustom() {
    customPanel.hidden = true;
    customButton.setAttribute('aria-expanded', 'false');
  }

  function renderSession() {
    durationButtons.forEach(button => button.disabled = started);
    customButton.disabled = started;
    editSpaceButton.disabled = started;
    editSpaceButton.title = started ? 'End the browser demo before editing your focus space.' : 'Choose your example focus apps';
    startButton.disabled = !chosenApps.length;
    preview.classList.toggle('is-running', running);
    resetButton.hidden = !started;
    startButton.querySelector('span').textContent = running ? 'End demo' : 'Start focus';
    startButton.querySelector('svg').style.display = running ? 'none' : '';
    caption.textContent = running ? 'FOCUS IN PROGRESS' : 'YOUR FOCUS MOMENT';
    focusTitle.innerHTML = running ? 'Focus in progress.<br>At your pace.' : 'Your space.<br>Your pace.';
    focusHint.textContent = running ? `${chosenApps.length} essentials. One focus.` : chosenApps.length ? 'Ready when you are.' : 'Choose at least one app to begin.';
  }

  function tick() {
    if (!running) return;
    secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    renderClock();
    if (secondsLeft === 0) {
      clearInterval(ticker);
      running = false;
      started = false;
      renderSession();
      resetButton.hidden = false;
      focusTitle.innerHTML = 'A moment<br>well spent.';
      focusHint.textContent = 'Ready for your next session?';
      caption.textContent = 'DEMO SESSION COMPLETE';
      startButton.querySelector('span').textContent = 'Start again';
      demoNote.textContent = 'Your browser demo is complete. Download the Mac app for focus sessions, app controls, and your own activity history.';
    }
  }

  durationButtons.forEach(button => button.addEventListener('click', () => { setDuration(Number(button.dataset.minutes)); closeCustom(); }));
  customButton.addEventListener('click', () => {
    customPanel.hidden = !customPanel.hidden;
    customButton.setAttribute('aria-expanded', String(!customPanel.hidden));
    if (!customPanel.hidden) customRange.focus();
  });
  customRange.addEventListener('input', () => { document.querySelector('#custom-value').textContent = `${customRange.value} min`; });
  document.querySelector('#set-custom').addEventListener('click', () => { setDuration(Number(customRange.value)); closeCustom(); customButton.focus(); });
  document.addEventListener('click', event => { if (!customPanel.hidden && !customPanel.contains(event.target) && event.target !== customButton) closeCustom(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !customPanel.hidden) { closeCustom(); customButton.focus(); } });

  startButton.addEventListener('click', () => {
    if (!chosenApps.length) return;
    closeCustom();
    if (running) {
      running = false;
      started = false;
      secondsLeft = minutes * 60;
      clearInterval(ticker);
      demoNote.textContent = 'Browser demo ended. Choose another duration or change your focus space before starting again.';
    } else {
      if (secondsLeft === 0) secondsLeft = minutes * 60;
      running = true;
      started = true;
      deadline = Date.now() + secondsLeft * 1000;
      ticker = setInterval(tick, 250);
      demoNote.textContent = 'Your browser demo is running. No apps are blocked and no activity is tracked. End or reset the demo at any time.';
    }
    renderSession();
    renderClock();
  });

  resetButton.addEventListener('click', () => {
    clearInterval(ticker);
    running = false;
    started = false;
    secondsLeft = minutes * 60;
    renderSession();
    renderClock();
    demoNote.textContent = 'Browser demo with sample activity. No apps are blocked or activity tracked.';
  });

  function setDark(dark) {
    preview.classList.toggle('is-dark', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch preview to ${dark ? 'light' : 'dark'} appearance`);
    themeButton.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }
  themeButton.addEventListener('click', () => setDark(!preview.classList.contains('is-dark')));
  document.querySelector('#explore-dark').addEventListener('click', () => setDark(true));

  const periods = {
    day: { labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'], values: [0, 45, 30, 45, 15, 0, 0], highlight: 3 },
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [75, 110, 60, 135, 95, 35, 55], highlight: 3 },
    month: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], values: [480, 570, 450, 635], highlight: 3 }
  };
  function renderChart(period) {
    const sample = periods[period];
    const max = Math.max(...sample.values) * 1.12;
    const chart = document.querySelector('#activity-chart');
    const total = sample.values.reduce((sum, value) => sum + value, 0);
    const formatMinutes = value => value >= 60 ? `${Math.floor(value / 60)}h${value % 60 ? ` ${value % 60}m` : ''}` : `${value}m`;
    const summary = document.querySelector('#chart-summary');
    summary.textContent = `${formatMinutes(total)} this ${period} · sample activity`;
    chart.setAttribute('role', 'group');
    chart.setAttribute('aria-label', `Sample ${period} activity. Select a bar to explore focused time.`);
    chart.replaceChildren(...sample.values.map((value, index) => {
      const column = document.createElement('button');
      column.type = 'button';
      column.className = `chart-column${sample.highlight === index ? ' is-highlight' : ''}`;
      column.title = `${sample.labels[index]}: ${value} focused minutes (sample)`;
      column.setAttribute('aria-label', column.title);
      column.setAttribute('aria-pressed', String(sample.highlight === index));
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${Math.max(3, value / max * 82)}%`;
      const amount = document.createElement('span');
      amount.className = 'chart-value';
      amount.textContent = formatMinutes(value);
      bar.append(amount);
      const label = document.createElement('span');
      label.className = 'chart-label';
      label.textContent = sample.labels[index];
      column.append(bar, label);
      column.addEventListener('click', () => {
        chart.querySelectorAll('.chart-column').forEach(other => {
          other.classList.toggle('is-highlight', other === column);
          other.setAttribute('aria-pressed', String(other === column));
        });
        summary.textContent = `${sample.labels[index]}: ${formatMinutes(value)} · ${period} total ${formatMinutes(total)} (sample)`;
      });
      return column;
    }));
    document.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === period)));
  }
  document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => renderChart(button.dataset.period)));
  renderChart('week');

  function renderSelectionStatus() {
    const count = dialog.querySelectorAll('[name="demo-app"]:checked').length;
    saveSpaceButton.disabled = count === 0 || started;
    document.querySelector('#selection-status').textContent = count ? `${count} ${count === 1 ? 'app' : 'apps'} selected.` : 'Choose at least one app for your focus space.';
  }
  dialog.querySelectorAll('[name="demo-app"]').forEach(input => input.addEventListener('change', renderSelectionStatus));
  dialog.querySelector('form').addEventListener('submit', event => {
    if (event.submitter === saveSpaceButton && (started || !dialog.querySelector('[name="demo-app"]:checked'))) event.preventDefault();
  });
  editSpaceButton.addEventListener('click', () => {
    if (started) return;
    document.querySelectorAll('[name="demo-app"]').forEach(input => input.checked = chosenApps.includes(input.value));
    renderSelectionStatus();
    dialog.showModal();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close('cancel'); } });
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'save' || started) return;
    const selection = [...document.querySelectorAll('[name="demo-app"]:checked')].map(input => input.value);
    if (!selection.length) return;
    chosenApps = selection;
    const apps = document.querySelector('#selected-apps');
    apps.setAttribute('aria-label', chosenApps.length ? `Example focus apps: ${chosenApps.join(', ')}` : 'No example apps selected');
    apps.replaceChildren(...chosenApps.map(name => {
      const icon = document.createElement('span');
      icon.className = `app-icon ${name.toLowerCase()}`;
      icon.title = name;
      if (name === 'Figma') for (let i = 0; i < 5; i++) icon.append(document.createElement('i'));
      else if (name === 'Pages') icon.textContent = 'P';
      else icon.append(document.createElement('span'));
      return icon;
    }));
    document.querySelector('#space-description').textContent = `${chosenApps.length} ${chosenApps.length === 1 ? 'essential' : 'essentials'} selected.`;
    document.querySelector('#space-summary').textContent = chosenApps.join(' · ');
    renderSession();
  });

  function openLinkedQuestion() {
    const id = location.hash.slice(1);
    const target = id && document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  document.querySelectorAll('a[href="#install-faq"]').forEach(link => link.addEventListener('click', () => { document.querySelector('#install-faq').open = true; }));
  window.addEventListener('hashchange', openLinkedQuestion);
  openLinkedQuestion();
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.ritual-grid article, .comfort-copy, .appearance-art, .privacy-section, .download-card').forEach(element => {
      element.classList.add('reveal');
      reveal.observe(element);
    });
  }
  // The release details come from ../release.js, which scripts/publish_release.sh rewrites
  // for every release. Without it the page keeps the wording written in the HTML.
  function showRelease(release) {
    if (!release || typeof release !== 'object') return;
    const all = selector => document.querySelectorAll(selector);
    const isWebLink = url => typeof url === 'string' && url.startsWith('https://');
    const version = /^\d+(\.\d+){0,3}$/.test(release.version) ? `v${release.version}` : '';
    const minimum = /^\d+(\.\d+)*$/.test(release.minimum_macos) ? `macOS ${release.minimum_macos.replace(/(\.0)+$/, '')}+` : '';
    const size = Number(release.size) > 0 ? `${(Number(release.size) / 1e6).toFixed(1)} MB` : '';
    if (isWebLink(release.download)) all('[data-release-link]').forEach(link => { link.href = release.download; });
    if (isWebLink(release.notes_url)) all('[data-release="notes"]').forEach(link => { link.href = release.notes_url; });
    if (version) all('[data-release="version"]').forEach(node => { node.textContent = version; });
    if (minimum) all('[data-release="minimum"]').forEach(node => { node.textContent = minimum; });
    // Size 0 means unknown: the size, and the separator kept with it, stay hidden.
    all('[data-release="size"]').forEach(node => { node.textContent = size; });
    all('[data-release-if="size"]').forEach(node => { node.hidden = !size; });
  }
  showRelease(window.PHANTFOCUS_RELEASE);
  // The download goes on in the background (the zip is on GitHub, so the page stays).
  let toastTimeout;
  document.querySelectorAll('[data-release-link]').forEach(link => link.addEventListener('click', () => {
    const toast = document.querySelector('#download-toast');
    toast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.hidden = true; }, 6500);
  }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.addEventListener('pagehide', () => clearInterval(ticker));
  window.addEventListener('pageshow', event => {
    if (event.persisted && running) {
      tick();
      if (running) ticker = setInterval(tick, 250);
    }
  });
})();
