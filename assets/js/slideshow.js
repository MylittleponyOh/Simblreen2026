function initSlideshow(SLIDES, opts) {
  opts = opts || {};
  var typeSpeed = opts.typeSpeed || 35;


  var root = document.createElement("div");
  root.id = "slideshow-root";


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
  });


  var bottomRow = document.createElement("div");
  bottomRow.className = "slideshow-bottom-row";

  var dialogueBoxEl = document.createElement("div");
  dialogueBoxEl.className = "dialogue-box";
  var linesEl = document.createElement("div");
  dialogueBoxEl.appendChild(linesEl);

  var musicLink = document.createElement("a");
  musicLink.className = "slide-music-link";
  musicLink.target = "ash-music";
  musicLink.rel = "noopener";
  musicLink.style.display = "none";
  dialogueBoxEl.appendChild(musicLink);

  var controlsEl = document.createElement("div");
  controlsEl.className = "slideshow-controls";

  var skipBtn = document.createElement("button");
  skipBtn.className = "skip-btn";
  skipBtn.textContent = opts.skipLabel || "Skip";
  if (!opts.skipUrl) skipBtn.style.visibility = "hidden";

  var nextBtn = document.createElement("button");
  nextBtn.className = "next-btn";
  nextBtn.textContent = "Next";

  var choicesEl = document.createElement("div");
  choicesEl.className = "slideshow-choices";

  controlsEl.appendChild(skipBtn);
  controlsEl.appendChild(nextBtn);
  controlsEl.appendChild(choicesEl);

  bottomRow.appendChild(dialogueBoxEl);
  bottomRow.appendChild(controlsEl);
  root.appendChild(bottomRow);

  document.body.appendChild(root);


  var current = 0;
  var isTyping = false;
  var typeTimeouts = [];
  var updateActionButtons = function () {};

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

    if (opts.onSlideChange) opts.onSlideChange(current);

    clearTypeTimeouts();

    var slide = SLIDES[current];
    var lines = slide.lines || [{ speaker: slide.speaker, text: slide.text, tone: slide.tone }];
    var hasContent = lines.some(function (l) { return l.speaker || l.text; });


    dialogueBoxEl.style.display = hasContent ? "block" : "none";
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
      if (l.tone) tx.classList.add("tone-" + l.tone);

      wrap.appendChild(sp);
      wrap.appendChild(tx);
      linesEl.appendChild(wrap);
      if (textEls.length > 0) wrap.style.visibility = "hidden";

      textEls.push(tx);
      fullTexts.push(l.text || "");
    });

    nextBtn.textContent = (current === SLIDES.length - 1) ? "Continue" : "Next";

    choicesEl.innerHTML = "";
    if (slide.choices) {
      slide.choices.forEach(function (choice) {
        var btn = document.createElement("button");
        btn.className = "next-btn choice-btn";
        btn.textContent = choice.label;
        btn.addEventListener("click", function () {
          window.location.href = choice.url;
        });
        choicesEl.appendChild(btn);
      });
    }

    
    updateActionButtons = function () {
      if (slide.choices && !isTyping) {
        nextBtn.style.display = "none";
        choicesEl.style.display = "flex";
      } else {
        var isLastSlideWithNoNext = (current === SLIDES.length - 1) && (opts.nextUrl === "#") && !slide.choices;
        nextBtn.style.display = isLastSlideWithNoNext ? "none" : "inline-block";
        choicesEl.style.display = "none";
      }
    }

    if (slide.musicUrl) {
      musicLink.href = slide.musicUrl;
      musicLink.textContent = slide.musicLabel || "🎵 Listen";
      musicLink.style.display = "inline-block";
    } else {
      musicLink.style.display = "none";
    }

    isTyping = hasContent;
    updateActionButtons();

    var lineIndex = 0;
    var pauseBetweenLines = 500;
    function typeNextLine() {
      if (lineIndex >= textEls.length) {
        isTyping = false;
        updateActionButtons();
        return;
      }
      textEls[lineIndex].parentNode.style.visibility = "visible";
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
    var lines = slide.lines || [{ speaker: slide.speaker, text: slide.text, tone: slide.tone }];
    var textEls = linesEl.querySelectorAll(".dialogue-text");
    lines.forEach(function (l, i) {
      if (textEls[i]) {
        textEls[i].textContent = l.text || "";
        textEls[i].parentNode.style.visibility = "visible";
      }
    });
    isTyping = false;
    updateActionButtons();
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
