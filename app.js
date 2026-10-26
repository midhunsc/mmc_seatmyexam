(function () {
  var cfg = window.SEAT_FINDER_CONFIG || {};
  var form = document.getElementById('searchForm');
  var input = document.getElementById('regInput');
  var btn = document.getElementById('searchBtn');
  var statusEl = document.getElementById('status');
  var resultsEl = document.getElementById('results');

  if (cfg.COLLEGE_NAME) document.getElementById('collegeName').textContent = cfg.COLLEGE_NAME;

  // Allow direct links like ?reg=MM25CCAR001
  var params = new URLSearchParams(location.search);
  if (params.get('reg')) { input.value = params.get('reg'); search(params.get('reg')); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    search(input.value);
  });

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (isError ? ' error' : '');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // "25/09/2026" -> Date
  function parseDate(s) {
    var m = String(s).match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }

  function search(raw) {
    var reg = String(raw || '').replace(/\s+/g, '').toUpperCase();
    if (!reg) return;
    if (!cfg.WEB_APP_URL || cfg.WEB_APP_URL.indexOf('http') !== 0) {
      setStatus('Seat finder is not configured yet. Please contact the Examination Cell.', true);
      return;
    }

    btn.disabled = true;
    resultsEl.innerHTML = '';
    setStatus('Searching seat allocation for ' + reg + '...');

    fetch(cfg.WEB_APP_URL + '?reg=' + encodeURIComponent(reg))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status !== 'success') throw new Error(data.error || 'Server error');
        render(reg, data.results || []);
      })
      .catch(function (err) {
        console.error(err);
        setStatus('Could not fetch seat details. Please check your internet connection and try again.', true);
      })
      .then(function () { btn.disabled = false; });
  }

  function render(reg, list) {
    if (!list.length) {
      setStatus('No seat allocation found for ' + reg + '. Check the register number, or seats may not be published yet.', true);
      return;
    }

    var today = new Date(); today.setHours(0, 0, 0, 0);
    // Upcoming exams first (nearest date first), then past exams
    list.sort(function (a, b) {
      var da = parseDate(a.date) || 0, db = parseDate(b.date) || 0;
      var pa = da < today, pb = db < today;
      if (pa !== pb) return pa ? 1 : -1;
      return pa ? db - da : da - db;
    });

    setStatus('Found ' + list.length + ' exam seat' + (list.length > 1 ? 's' : '') + ' for ' + reg);

    resultsEl.innerHTML = list.map(function (s) {
      var d = parseDate(s.date);
      var isPast = d && d < today;
      var isToday = d && d.getTime() === today.getTime();
      return '<article class="card seat-card' + (isPast ? ' past' : '') + '">' +
        '<div class="date">' + escapeHtml(s.date) +
          (s.session ? ' <span>&middot; ' + escapeHtml(s.session) + '</span>' : '') +
          (isToday ? '<span class="badge">TODAY</span>' : '') +
        '</div>' +
        '<div class="course">' + escapeHtml(s.course_name || s.course_code) +
          (s.course_code && s.course_name ? '<small>' + escapeHtml(s.course_code) + '</small>' : '') +
        '</div>' +
        '<div class="grid">' +
          '<div class="box"><div class="k">Room</div><div class="v">' + escapeHtml(s.room) + '</div></div>' +
          '<div class="box"><div class="k">Seat No</div><div class="v">' + escapeHtml(s.seat) + '</div></div>' +
        '</div>' +
      '</article>';
    }).join('');
  }
})();
