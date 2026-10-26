(function () {
  'use strict';

  var grid = document.getElementById('book-grid');
  if (!grid) {
    return;
  }

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.book-card'));
  var q = document.getElementById('browse-q');
  var year = document.getElementById('year');
  var company = document.getElementById('company');
  var status = document.getElementById('status');
  var sizeType = document.getElementById('size_type');
  var sort = document.getElementById('sort');
  var count = document.getElementById('visible-count');
  var clear = document.getElementById('clear-filters');
  var empty = document.getElementById('no-results');

  function compare(left, right) {
    var mode = sort.value;
    if (mode === 'date_asc') {
      return left.dataset.datetime.localeCompare(right.dataset.datetime);
    }
    if (mode === 'price_desc' || mode === 'price_asc') {
      var lp = left.dataset.price === '' ? null : Number(left.dataset.price);
      var rp = right.dataset.price === '' ? null : Number(right.dataset.price);
      if (lp === null && rp === null) { return left.dataset.id.localeCompare(right.dataset.id); }
      if (lp === null) { return 1; }
      if (rp === null) { return -1; }
      return mode === 'price_desc' ? rp - lp : lp - rp;
    }
    if (mode === 'title') {
      return left.dataset.title.localeCompare(right.dataset.title, 'zh-CN');
    }
    return right.dataset.datetime.localeCompare(left.dataset.datetime);
  }

  function applyFilters() {
    var query = (q.value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var matched =
        (!query || card.dataset.search.toLowerCase().indexOf(query) >= 0) &&
        (!year.value || card.dataset.year === year.value) &&
        (!company.value || card.dataset.company === company.value) &&
        (!status.value || card.dataset.status === status.value) &&
        (!sizeType.value || card.dataset.size === sizeType.value);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    cards.slice().sort(compare).forEach(function (card) {
      grid.appendChild(card);
    });
    count.textContent = visible;
    empty.hidden = visible !== 0;
    grid.hidden = visible === 0;
  }

  [q, year, company, status, sizeType, sort].forEach(function (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });
  clear.addEventListener('click', function () {
    q.value = '';
    year.value = '';
    company.value = '';
    status.value = '';
    sizeType.value = '';
    sort.value = 'date_desc';
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    applyFilters();
    q.focus();
  });

  var requestedStatus = new URLSearchParams(window.location.search).get('status');
  if (requestedStatus) {
    status.value = requestedStatus;
  }
  applyFilters();
})();
