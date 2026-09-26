/* ═══════════════════════════════════════════════════════════
   REPORT VIEWER
   Structure attendue pour openReport(data) :
   {
     title: "CASE FILE #21071994/M-B",
     subtitle: "Melissa Bliss — Missing Person",
     sections: [
       {
         heading: "Jodie Merrick (46) — Mother",
         body: "Texte officiel du témoignage...",
         note: "Commentaire d'Ashley (optionnel, piste/indice)"
       },
       ...
     ]
   }
   ═══════════════════════════════════════════════════════════ */

function openReport(data) {
  var backdrop = document.getElementById("report-backdrop");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "report-backdrop";
    backdrop.innerHTML =
      '<div id="report-paper">' +
      '  <button id="report-close-btn">✕</button>' +
      '  <div id="report-content"></div>' +
      '</div>';
    document.body.appendChild(backdrop);

    document.getElementById("report-close-btn").addEventListener("click", closeReport);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeReport();
    });
  }

  var contentEl = document.getElementById("report-content");
  contentEl.innerHTML = "";

  var title = document.createElement("p");
  title.className = "report-title";
  title.textContent = data.title || "";
  contentEl.appendChild(title);

  if (data.subtitle) {
    var subtitle = document.createElement("p");
    subtitle.className = "report-subtitle";
    subtitle.textContent = data.subtitle;
    contentEl.appendChild(subtitle);
  }

  (data.sections || []).forEach(function (sec) {
    var wrap = document.createElement("div");
    wrap.className = "report-section";

    if (sec.heading) {
      var h = document.createElement("h3");
      h.textContent = sec.heading;
      wrap.appendChild(h);
    }

    if (sec.body) {
      var p = document.createElement("p");
      p.textContent = sec.body;
      wrap.appendChild(p);
    }

    if (sec.note) {
      var note = document.createElement("div");
      note.className = "report-note";
      note.textContent = sec.note;
      wrap.appendChild(note);
    }

    contentEl.appendChild(wrap);
  });

  backdrop.classList.add("open");
}

function closeReport() {
  var backdrop = document.getElementById("report-backdrop");
  if (backdrop) backdrop.classList.remove("open");
}
