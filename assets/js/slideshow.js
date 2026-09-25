/* ═══════════════════════════════════════════════════════════
   SLIDESHOW ENGINE
   Chaque page appelle : initSlideshow(SLIDES, { nextUrl: "...", skipUrl: "..." })

   SLIDES est un tableau d'objets, 3 formats possibles par slide :
     1) Une seule réplique : { img: "...", speaker: "ASHLEY", text: "..." }
     2) Plusieurs répliques : { img: "...", lines: [ {speaker, text}, {speaker, text} ] }
     3) Pas de dialogue : speaker/text vides (ou omets lines) → boîte cachée

   opts :
     nextUrl          (obligatoire) — où aller après la dernière slide
     skipUrl           (optionnel) — si fourni, affiche un bouton "Skip"
     skipLabel          (optionnel) — texte du bouton skip, défaut "Skip"
     typeSpeed          (optionnel) — ms par caractère, défaut 25
     showFullscreenBtn (optionnel) — défaut true
   ═══════════════════════════════════════════════════════════ */

function initSlideshow(SLIDES, opts) {
  opts = opts || {};
  var typeSpeed = opts.typeSpeed || 25;
  var showFullscreen = opts.showFullscreenBtn !== false;

  // ── Construction du DOM racine ───────────────────────────
  var root = document.createElement("div");
  root.id = "slideshow-root";

  var progressEl = document.createElement("div");
  progressEl.className = "slideshow-progress";
  root.appendChild(progressEl);

  var dialogueBoxEl = document.createElement("div");
  dialogueBoxEl.className = "dialogue-box";
  var linesEl = document.createElement("div");
  dialogueBoxEl.appendChild(linesEl);

  var controlsEl = document.createElement("div");
  controlsEl.className = "slideshow-controls";

  var skipBtn = document.createElement("button");
  skipBtn.className = "skip-btn";
  skipBtn.textContent = opts.skipLabel || "Skip";
  if (!opts.skipUrl) skipBtn.style.visibility = "hidden";

  var nextBtn = document.createElement("button");
  nextBtn.className = "next-btn";
  nextBtn.textContent = "Next";

  controlsEl.appendChild(skipBtn);
  controlsEl.appendChild(nextBtn);

  if (showFullscreen) {
    var fsBtn = document.createElement("button");
    fsBtn.className = "fullscreen-btn";
    fsBtn.textContent = "⛶ Fullscreen";
    fsBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
    root.appendChild(fsBtn);
  }

  // Génère les slides (image ou placeholder)
  SLIDES.forEach(function (slide, i) {
    var div = document.createElement("div");
    div.className = "slide";

    if (slide.img) {
      var img = document.createElement("img");
      img.src = slide.img;
      img.alt = "";
      div.appendChild(img);
    } else {
      var ph = document.createElement("div");
      ph.className = "slide-placeholder";
      ph.textContent = "Image " + (i + 1) + " / " + SLIDES.length;
      div.appendChild(ph);
    }

    root.appendChild(div);

    var dot = document.createElement("div");
    dot.className = "dot";
    progressEl.appendChild(dot);
  });

  dialogueBoxEl.appendChild(controlsEl);
  root.appendChild(dialogueBoxEl);
  document.body.appendChild(root);

  // ── Effet machine à écrire ────────────────────────────────
  var current = 0;
  var isTyping = false;
  var typeTimeouts = [];

  function clearTypeTimeouts() {
    typeTimeouts.forEach(function (id) { clearTimeout(id); });
    typeTimeouts = [];
  }

  function typeLine(el, text, onDone) {
    el.textContent = "";
    var i = 0;
    function step() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        typeTimeouts.push(setTimeout(step, typeSpeed));
      } else if (onDone) {
        onDone();
      }
    }
    step();
  }

  function render() {
    var slides = root.querySelectorAll(".slide");
    slides.forEach(function (el, i) {
      el.classList.toggle("active", i === current);
    });
    var dots = progressEl.querySelectorAll(".dot");
    dots.forEach(function (dot, i) {
      dot.classList.toggle("done", i <= current);
    });

    clearTypeTimeouts();

    var slide = SLIDES[current];
    var lines = slide.lines || [{ speaker: slide.speaker, text: slide.text }];
    var hasContent = lines.some(function (l) { return l.speaker || l.text; });

    linesEl.style.display = hasContent ? "block" : "none";
    linesEl.innerHTML = "";

    var textEls = [];
    var fullTexts = [];

    lines.forEach(function (l) {
      var wrap = document.createElement("div");
      wrap.className = "dialogue-line";

      var sp = document.createElement("div");
      sp.className = "dialogue-speaker";
      sp.textContent = l.speaker || "";

      var tx = document.createElement("div");
      tx.className = "dialogue-text";

      wrap.appendChild(sp);
      wrap.appendChild(tx);
      linesEl.appendChild(wrap);

      textEls.push(tx);
      fullTexts.push(l.text || "");
    });

    nextBtn.textContent = (current === SLIDES.length - 1) ? "Continue" : "Next";

    isTyping = hasContent;
    var lineIndex = 0;
    var pauseBetweenLines = 500; // ms de pause avant la réplique suivante
    function typeNextLine() {
      if (lineIndex >= textEls.length) {
        isTyping = false;
        return;
      }
      typeLine(textEls[lineIndex], fullTexts[lineIndex], function () {
        lineIndex++;
        typeTimeouts.push(setTimeout(typeNextLine, pauseBetweenLines));
      });
    }
    typeNextLine();
  }

  function skipTyping() {
    clearTypeTimeouts();
    var slide = SLIDES[current];
    var lines = slide.lines || [{ speaker: slide.speaker, text: slide.text }];
    var textEls = linesEl.querySelectorAll(".dialogue-text");
    lines.forEach(function (l, i) {
      if (textEls[i]) textEls[i].textContent = l.text || "";
    });
    isTyping = false;
  }

  function goNext() {
    if (isTyping) {
      skipTyping();
      return;
    }
    if (current < SLIDES.length - 1) {
      current++;
      render();
    } else {
      window.location.href = opts.nextUrl;
    }
  }

  nextBtn.addEventListener("click", goNext);
  if (opts.skipUrl) {
    skipBtn.addEventListener("click", function () {
      window.location.href = opts.skipUrl;
    });
  }

  render();
}
