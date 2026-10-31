/* ═══════════════════════════════════════════════════════════
   REPORT VIEWER & DIARY
   ═══════════════════════════════════════════════════════════ */

function buildSectionEl(sec) {
  var wrap = document.createElement("div");
  wrap.className = "report-section";

  if (sec.heading) {
    var h = document.createElement("h3");
    h.className = "report-name-trigger";
    h.textContent = sec.heading;

    if (sec.note) {
      h.classList.add("has-note");
      var note = document.createElement("div");
      note.className = "report-note";
      note.innerHTML = '<span class="report-note-label">Ashley\'s note</span>';
      var noteText = document.createElement("span");
      noteText.textContent = sec.note;
      note.appendChild(noteText);
      h.appendChild(note);
    }

    wrap.appendChild(h);
  }

  if (sec.body) {
    var p = document.createElement("p");
    p.textContent = sec.body;
    wrap.appendChild(p);
  }

  return wrap;
}

function openReport(data) {
  var backdrop = document.getElementById("report-backdrop");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "report-backdrop";
    backdrop.innerHTML =
      '<div id="report-paper-stack">' +
      '  <div id="report-paper">' +
      '    <button id="report-close-btn">✕</button>' +
      '    <div id="report-header"></div>' +
      '    <div id="report-pages"></div>' +
      '    <div id="report-pagination"></div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(backdrop);

    document.getElementById("report-close-btn").addEventListener("click", closeReport);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeReport();
    });
  }

  // Look du document : "diary"
  var paperEl = document.getElementById("report-paper");
  var isDiary = data.style === "diary";
  paperEl.classList.toggle("is-diary", isDiary);
  if (isDiary && !document.getElementById("diary-font")) {
    var fontLink = document.createElement("link");
    fontLink.id = "diary-font";
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";
    document.head.appendChild(fontLink);
  }

  // En-tête (titre/sous-titre), toujours visible, hors pagination
  var headerEl = document.getElementById("report-header");
  headerEl.innerHTML = "";

  var title = document.createElement("p");
  title.className = "report-title";
  title.textContent = data.title || "";
  headerEl.appendChild(title);

  if (data.subtitle) {
    var subtitle = document.createElement("p");
    subtitle.className = "report-subtitle";
    subtitle.textContent = data.subtitle;
    headerEl.appendChild(subtitle);
  }

  // Découpage des sections en pages
  var perPage = data.sectionsPerPage || 4;
  var sections = data.sections || [];
  var pages = [];
  for (var i = 0; i < sections.length; i += perPage) {
    pages.push(sections.slice(i, i + perPage));
  }
  if (pages.length === 0) pages.push([]);

  var pagesEl = document.getElementById("report-pages");
  pagesEl.innerHTML = "";

  pages.forEach(function (pageSections, pageIndex) {
    var pageEl = document.createElement("div");
    pageEl.className = "report-page";
    pageEl.dataset.page = pageIndex;
    pageSections.forEach(function (sec) {
      pageEl.appendChild(buildSectionEl(sec));
    });
    pagesEl.appendChild(pageEl);
  });

  var currentPage = 0;

  function renderPage() {
    var pageEls = pagesEl.querySelectorAll(".report-page");
    pageEls.forEach(function (el, i) {
      el.classList.toggle("active", i === currentPage);
    });

    var paginationEl = document.getElementById("report-pagination");
    paginationEl.innerHTML = "";

    if (pages.length > 1) {
      var prevBtn = document.createElement("button");
      prevBtn.className = "report-page-btn";
      prevBtn.textContent = "← Previous";
      prevBtn.disabled = currentPage === 0;
      prevBtn.addEventListener("click", function () {
        currentPage--;
        renderPage();
      });

      var indicator = document.createElement("span");
      indicator.className = "report-page-indicator";
      indicator.textContent = (currentPage + 1) + " / " + pages.length;

      var nextBtn = document.createElement("button");
      nextBtn.className = "report-page-btn";
      nextBtn.textContent = "Next →";
      nextBtn.disabled = currentPage === pages.length - 1;
      nextBtn.addEventListener("click", function () {
        currentPage++;
        renderPage();
      });

      paginationEl.appendChild(prevBtn);
      paginationEl.appendChild(indicator);
      paginationEl.appendChild(nextBtn);
    }
  }

  renderPage();
  backdrop.classList.add("open");
}

function closeReport() {
  var backdrop = document.getElementById("report-backdrop");
  if (backdrop) backdrop.classList.remove("open");
}
