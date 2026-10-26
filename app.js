(function () {
  var cfg = window.SEAT_FINDER_CONFIG || {};
  var form = document.getElementById('searchForm');
  var input = document.getElementById('regInput');
  var btn = document.getElementById('searchBtn');
  var statusEl = document.getElementById('status');
  var resultsEl = document.getElementById('results');
  var todayBadgeEl = document.getElementById('todayBadge');

  if (cfg.COLLEGE_NAME) document.getElementById('collegeName').textContent = cfg.COLLEGE_NAME;

  // Format today's date as DD-MM-YYYY (e.g. 28-10-2026) to match the Google Sheet tab name updated
  function getTodaySheetName() {
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  }

  var todaySheet = getTodaySheetName();
  if (todayBadgeEl) {
    todayBadgeEl.textContent = "Today's Exam Date: " + todaySheet;
  }

  // Allow direct links like ?reg=C5PSCS2101
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

  // Normalize any date string ("28/10/2026" or "28-10-2026") to "DD-MM-YYYY"
  function normalizeDateTab(s) {
    var m = String(s || '').trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (!m) return '';
    return m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0') + '-' + m[3];
  }

  function search(raw) {
    var reg = String(raw || '').replace(/\s+/g, '').toUpperCase();
    if (!reg) return;
    if (!cfg.WEB_APP_URL || cfg.WEB_APP_URL.indexOf('http') !== 0) {
      setStatus('Seat finder is not configured yet. Please contact the Examination Cell.', true);
      return;
    }

    var currentToday = getTodaySheetName();
    btn.disabled = true;
    resultsEl.innerHTML = '';
    setStatus('Searching today\'s (' + currentToday + ') seat allocation for ' + reg + '...');

    var url = cfg.WEB_APP_URL + '?reg=' + encodeURIComponent(reg) + '&date=' + encodeURIComponent(currentToday);

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status !== 'success') throw new Error(data.error || 'Server error');
        // Strictly filter to ONLY today's exam sheet (e.g. 28-10-2026)
        var targetTab = data.today || currentToday;
        var filtered = (data.results || []).filter(function (item) {
          var itemTab = normalizeDateTab(item.date);
          return !itemTab || itemTab === targetTab;
        });
        render(reg, filtered, targetTab);
      })
      .catch(function (err) {
        console.error(err);
        setStatus('Could not fetch seat details. Please check your internet connection and try again.', true);
      })
      .then(function () { btn.disabled = false; });
  }

  function render(reg, list, todayTab) {
    if (!list.length) {
      setStatus('No seat allocation found for ' + reg + ' on today\'s exam date (' + todayTab + '). Seat allocations are visible only on the day of the examination.', true);
      return;
    }

    setStatus('Found ' + list.length + ' seat allocation' + (list.length > 1 ? 's' : '') + ' for ' + reg + ' (' + todayTab + ')');

    resultsEl.innerHTML = list.map(function (s) {
      var displayDate = String(s.date || todayTab).replace(/\//g, '-');
      return '<article class="card seat-card">' +
        '<div class="date">' + escapeHtml(displayDate) +
          (s.session ? ' <span>&middot; ' + escapeHtml(s.session) + '</span>' : '') +
          '<span class="badge">TODAY</span>' +
        '</div>' +
        '<div class="course">' + escapeHtml(s.course_name || s.course_code) +
          (s.course_code && s.course_name ? '<small>' + escapeHtml(s.course_code) + '</small>' : '') +
        '</div>' +
       
        '<div class="grid">' +
          '<div class="box">' +
            '<div class="k">Room</div>' +
            '<div class="v">' + escapeHtml(s.room) + '</div>' +
          '</div>' +
          '<div class="box">' +
            '<div class="k">Seat No</div>' +
            '<div class="v">' + escapeHtml(s.seat) + '</div>' +
            '<div class="k row-desk-label">' +
              escapeHtml(s.row_desk || '') +
            '</div>' +
          '</div>' +
        '</div>' +


      '</article>';
    }).join('');
  }
})();
