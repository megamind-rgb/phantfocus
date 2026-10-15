'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  let minutes = 45;
  let deadline = 0;
  let interval;
  let selectedApps = ['Notes', 'Safari', 'Figma'];
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    return hours ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  function paintTimer(seconds = minutes * 60) { $('#timer').textContent = formatTime(seconds); }
  function selectDuration(value) {
    minutes = value;
    $$('.durations button').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.minutes) === value)));
    $('#custom-duration').setAttribute('aria-pressed', String(![30, 45, 90].includes(value)));
    $('#custom-minutes').value = String(value);
    paintTimer();
  }
  function stopDemo(complete = false) {
    clearInterval(interval);
    deadline = 0;
    $('.app-window').classList.remove('is-running');
    $('.demo-tag').textContent = 'DEMO';
    $('#timer-label').textContent = 'FOCUS SESSION';
    $('#start-demo').innerHTML = 'Lock in <svg><use href="#arrow"/></svg>';
    $('#demo-status').textContent = complete ? 'Session complete. Ready for another?' : 'Try it. Your apps stay untouched.';
    $$('.durations button, #edit-apps').forEach((button) => { button.disabled = false; });
    paintTimer();
  }
  function tick() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (remaining === 0) stopDemo(true);
    else paintTimer(remaining);
  }
  $('#start-demo').addEventListener('click', () => {
    if (deadline) return stopDemo();
    deadline = Date.now() + minutes * 60 * 1000;
    $('.app-window').classList.add('is-running');
    $('.demo-tag').textContent = 'LIVE DEMO';
    $('#timer-label').textContent = 'SESSION IN PROGRESS';
    $('#start-demo').textContent = 'Reset preview';
    $('#demo-status').textContent = 'Preview running. No apps are blocked.';
    $$('.durations button, #edit-apps').forEach((button) => { button.disabled = true; });
    tick();
    interval = setInterval(tick, 250);
  });
  $$('[data-minutes]').forEach((button) => button.addEventListener('click', () => selectDuration(Number(button.dataset.minutes))));
  $('#custom-duration').addEventListener('click', () => { $('#custom-dialog').showModal(); });
  $('#custom-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#custom-minutes');
    if (!input.checkValidity()) return input.reportValidity();
    selectDuration(Number(input.value));
    $('#custom-dialog').close();
  });
  $('#edit-apps').addEventListener('click', () => {
    $$('#apps-form input').forEach((input) => { input.checked = selectedApps.includes(input.value); });
    $('#apps-error').textContent = '';
    $('#apps-dialog').showModal();
  });
  $('#apps-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const names = $$('#apps-form input:checked').map((input) => input.value);
    if (!names.length) { $('#apps-error').textContent = 'Choose at least one app or website.'; return; }
    $('#allowed-list').replaceChildren(...names.slice(0, 3).map((name) => {
      const row = document.createElement('li'); row.dataset.name = name;
      const icon = document.createElement('span'); icon.className = 'app-letter'; icon.textContent = name[0].toUpperCase();
      row.append(icon, document.createTextNode(name)); return row;
    }));
    // Keep every selected item, including choices beyond the three-row preview.
    selectedApps = names;
    $('#selection-count').textContent = names.length > 3 ? `${names.length} selected · showing the first 3.` : `${names.length} essential${names.length === 1 ? '' : 's'} selected.`;
    $('#apps-dialog').close();
  });
  $$('.close-dialog').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  }));
  const chartData = {
    day: { labels: ['06', '08', '10', '12', '14', '16', '18'], values: [0, 30, 45, 15, 0, 45, 0], total: '2h 15m today' },
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [150, 195, 90, 180, 120, 60, 135], total: '15h 30m this week' },
    month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [690, 810, 1020, 930], total: '57h 30m in 28 days' }
  };
  function paintChart(range) {
    const data = chartData[range];
    const maximum = Math.max(...data.values) * 1.15;
    $('#chart').style.gridTemplateColumns = `repeat(${data.values.length}, 1fr)`;
    $('#chart-labels').style.gridTemplateColumns = `repeat(${data.values.length}, 1fr)`;
    $('#chart').replaceChildren(...data.values.map((value, i) => {
      const bar = document.createElement('button'); bar.type = 'button'; bar.className = 'bar'; bar.style.height = `${Math.max(3, value / maximum * 100)}%`;
      const detail = `${data.labels[i]} · ${value >= 60 ? `${Math.floor(value / 60)}h ${String(value % 60).padStart(2, '0')}m` : `${value}m`} focused`;
      bar.setAttribute('aria-label', `${detail} (sample)`);
      bar.dataset.tip = value >= 60 ? `${Math.floor(value / 60)}h ${value % 60}m` : `${value}m`;
      const inspect = () => {
        $$('#chart .bar').forEach(item => item.classList.remove('is-inspected'));
        bar.classList.add('is-inspected');
        $('#chart-detail').textContent = `${detail} · sample activity`;
      };
      bar.addEventListener('mouseenter', inspect);
      bar.addEventListener('focus', inspect);
      bar.addEventListener('click', inspect);
      return bar;
    }));
    $('#chart-labels').replaceChildren(...data.labels.map((label) => { const node = document.createElement('span'); node.textContent = label; return node; }));
    $('#chart').setAttribute('aria-label', `Sample activity, ${data.total}. ${data.labels.map((label, i) => `${label}: ${data.values[i]} minutes`).join('. ')}`);
    $('#chart-total').textContent = data.total;
    $('#chart-detail').textContent = `Explore ${range === 'day' ? 'a time' : range === 'month' ? 'a week' : 'a day'} to see focused time.`;
    $$('[data-range]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.range === range)));
  }
  $$('[data-range]').forEach((button) => button.addEventListener('click', () => paintChart(button.dataset.range)));
  paintChart('week');
  // A link to a question (#install-question, #update-question) opens its answer.
  function showLinkedQuestion() {
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  $$('a[href="#install-question"]').forEach(link => link.addEventListener('click', () => { $('#install-question').open = true; }));
  window.addEventListener('hashchange', showLinkedQuestion);
  showLinkedQuestion();
  // The release details come from release.js, which scripts/publish_release.sh rewrites
  // for every release. Without it the page keeps the wording written in the HTML.
  function showRelease(release) {
    if (!release || typeof release !== 'object') return;
    const isWebLink = (url) => typeof url === 'string' && url.startsWith('https://');
    const version = /^\d+(\.\d+){0,3}$/.test(release.version) ? `v${release.version}` : '';
    const minimum = /^\d+(\.\d+)*$/.test(release.minimum_macos) ? `macOS ${release.minimum_macos.replace(/(\.0)+$/, '')}+` : '';
    const size = Number(release.size) > 0 ? `${(Number(release.size) / 1e6).toFixed(1)} MB` : '';
    if (isWebLink(release.download)) $$('[data-release-link]').forEach(link => { link.href = release.download; });
    if (isWebLink(release.notes_url)) $$('[data-release="notes"]').forEach(link => { link.href = release.notes_url; });
    if (version) $$('[data-release="version"]').forEach(node => { node.textContent = version; });
    if (minimum) $$('[data-release="minimum"]').forEach(node => { node.textContent = minimum; });
    // Size 0 means unknown: the size, and the separator kept with it, stay hidden.
    $$('[data-release="size"]').forEach(node => { node.textContent = size; });
    $$('[data-release-if="size"]').forEach(node => { node.hidden = !size; });
  }
  showRelease(window.PHANTFOCUS_RELEASE);
  // The download goes on in the background (the zip is on GitHub, so the page stays);
  // meanwhile the guide says how to open it the first time.
  $$('[data-release-link]').forEach(link => link.addEventListener('click', () => {
    $('#download-dialog').showModal();
  }));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && deadline) tick();
  });
  const sectionLinks = $$('.site-header nav a');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -45% 0px'});
    sectionLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) sectionObserver.observe(section); });
  }
})();
