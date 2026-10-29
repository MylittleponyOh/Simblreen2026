function initPhoneOverlay(items, opts) {
  opts = opts || {};

  // Voice Recorder Style
  if (!document.getElementById("phone-recorder-style")) {
    var recCss = document.createElement("style");
    recCss.id = "phone-recorder-style";
    recCss.textContent =
      ".feed-card.recorder{display:flex;align-items:center;gap:0.6rem;cursor:pointer;background:#2a2d38;border-color:rgba(255,255,255,0.18);}" +
      ".feed-card.recorder .report-icon{font-size:1.7rem;flex-shrink:0;}" +
      ".feed-card.recorder .loc-info{flex:1;min-width:0;}" +
      ".feed-card.recorder .loc-name{margin:0;color:#f2efe9;font-size:0.85rem;font-weight:600;}" +
      ".feed-card.recorder .loc-blurb{margin:0.15rem 0 0;color:#b9bccb;font-size:0.72rem;}" +
      ".feed-card.recorder .go-btn{flex-shrink:0;white-space:nowrap;background:#f2efe9;color:#b3261e;font-size:0.6rem;letter-spacing:0.06em;text-transform:uppercase;padding:0.3rem 0.6rem;border-radius:14px;}" +
      ".feed-card.recorder.is-recording{cursor:default;}" +
      ".feed-card.recorder.is-recording .go-btn{background:#e5322d;color:#fff;animation:recBlink 1s ease-in-out infinite;}" +
      ".feed-card.recorder.is-recording .loc-blurb{color:#ff8a84;}" +
      "@keyframes recBlink{50%{opacity:.5}}";
    document.head.appendChild(recCss);
  }

  var imgPath = opts.imgPath || "../assets/images/phone-frame.png";

  var peekBtn = document.getElementById("phone-peek-btn");
  var alreadyExists = !!peekBtn;

  // DOM
  if (!alreadyExists) {
    peekBtn = document.createElement("div");
    peekBtn.id = "phone-peek-btn";
    peekBtn.innerHTML =
      '<div class="peek-screen-fill"><div class="peek-notif-pill" id="peek-notif-pill" style="display:none;"><span class="peek-notif-count" id="peek-notif-count">1</span>New</div></div>' +
      '<img src="' + imgPath + '" alt="Phone">';
    document.body.appendChild(peekBtn);

    var backdrop = document.createElement("div");
    backdrop.id = "phone-overlay-backdrop";
    backdrop.innerHTML =
      '<div id="phone-modal">' +
      '  <button class="phone-close" id="phone-close-btn">✕</button>' +
      '  <img class="phone-frame" src="' + imgPath + '" alt="">' +
      '  <div class="phone-screen">' +
      '    <div class="feed" id="phone-feed"></div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(backdrop);

    function openPhone() {
      backdrop.classList.add("open");
      peekBtn.classList.remove("has-new");
    }
    function closePhone() {
      backdrop.classList.remove("open");
    }

    peekBtn.addEventListener("click", openPhone);
    document.getElementById("phone-close-btn").addEventListener("click", closePhone);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closePhone();
    });
  }

  // Mise à jour badge "new"
  peekBtn.classList.toggle("has-new", !!opts.hasNew);
  var pillEl = document.getElementById("peek-notif-pill");
  var countEl = document.getElementById("peek-notif-count");
  if (pillEl) pillEl.style.display = opts.hasNew ? "flex" : "none";
  if (countEl) countEl.textContent = opts.newCount || 1;

  // Remplissage du feed (à chaque appel : tout est regen)
  var feedEl = document.getElementById("phone-feed");
  feedEl.innerHTML = "";

  var SECTION_LABELS = { message: "Messages", note: "Notes", report: "Files", location: "Locations", recorder: "Apps" };
  var lastType = null;

  // Regroupe par type (ordre de première apparition) ; dans chaque groupe,
  // isNew: true en haut de liste. 
  var typeOrder = [];
  var groups = {};
  items.forEach(function (item) {
    if (!groups[item.type]) { groups[item.type] = []; typeOrder.push(item.type); }
    groups[item.type].push(item);
  });
  var ordered = [];
  typeOrder.forEach(function (t) {
    var fresh = groups[t].filter(function (i) { return i.isNew; });
    var older = groups[t].filter(function (i) { return !i.isNew; });
    ordered = ordered.concat(fresh, older);
  });

  ordered.forEach(function (item) {
    if (item.type !== lastType) {
      var label = document.createElement("p");
      label.className = "feed-section-label";
      label.textContent = SECTION_LABELS[item.type] || "";
      feedEl.appendChild(label);
      lastType = item.type;
    }

    if (item.type === "message" || item.type === "note") {
      var card = document.createElement("div");
      card.className = "feed-card message";
      if (item.isNew) card.classList.add("is-new");

      var from = document.createElement("p");
      from.className = "msg-from";
      from.textContent = item.from;

      var text = document.createElement("p");
      text.className = "msg-text";
      text.textContent = item.text;

      card.appendChild(from);
      card.appendChild(text);

      if (item.image) {
        var img = document.createElement("img");
        img.className = "msg-image";
        img.src = item.image;
        img.alt = "";
        card.appendChild(img);
      }

      if (item.attachment) {
        var att = document.createElement("a");
        att.className = "msg-attachment";
        att.href = item.attachment.url;
        att.target = "_blank";
        att.rel = "noopener";
        att.textContent = "🔗 " + item.attachment.label;
        card.appendChild(att);
      }

      feedEl.appendChild(card);

    } else if (item.type === "location") {
      var inert = item.locked || item.current; // carte non cliquable
      var loc = document.createElement(inert ? "div" : "a");
      loc.className = "feed-card location";
      if (item.isNew) loc.classList.add("is-new");
      if (inert) {
        loc.classList.add("is-locked");
        if (item.current) loc.classList.add("is-current");
      } else {
        loc.href = item.url;
      }

      if (item.thumb) {
        var img = document.createElement("img");
        img.className = "loc-thumb";
        img.src = item.thumb;
        loc.appendChild(img);
      } else {
        var ph = document.createElement("div");
        ph.className = "loc-thumb-placeholder";
        ph.textContent = "Photo";
        loc.appendChild(ph);
      }

      var info = document.createElement("div");
      info.className = "loc-info";
      var name = document.createElement("p");
      name.className = "loc-name";
      name.textContent = item.name;
      var blurb = document.createElement("p");
      blurb.className = "loc-blurb";
      blurb.textContent = item.blurb || "";
      info.appendChild(name);
      info.appendChild(blurb);
      loc.appendChild(info);

      var go = document.createElement("span");
      go.className = "go-btn";
      go.textContent = inert ? (item.lockedLabel || (item.current ? "Here" : "Closed")) : "Go";
      loc.appendChild(go);

      feedEl.appendChild(loc);

    } else if (item.type === "recorder") {
      var recCard = document.createElement("div");
      recCard.className = "feed-card recorder";
      if (item.isNew) recCard.classList.add("is-new");
      recCard.innerHTML =
        '<span class="report-icon">🎙️</span>' +
        '<div class="loc-info">' +
        '  <p class="loc-name">' + (item.label || "Voice Recorder") + '</p>' +
        '  <p class="loc-blurb rec-status">Tap to record</p>' +
        '</div>' +
        '<span class="go-btn rec-btn">● Rec</span>';
      var recStatus = recCard.querySelector(".rec-status");
      var recBtnEl = recCard.querySelector(".rec-btn");
      var recRunning = false;
      recCard.addEventListener("click", function () {
        if (recRunning) return;
        recRunning = true;
        recCard.classList.add("is-recording");
        recBtnEl.textContent = "■ Rec";
        var sec = 0;
        recStatus.textContent = "Recording… 00:00";
        var tick = setInterval(function () {
          sec++;
          recStatus.textContent = "Recording… 00:0" + Math.min(sec, 9);
          if (sec === 3) {
            setTimeout(function () {
              clearInterval(tick);
              var bd = document.getElementById("phone-overlay-backdrop");
              if (bd) bd.classList.remove("open");
              if (item.onDone) item.onDone();
            }, 700);
          }
        }, 1000);
      });
      feedEl.appendChild(recCard);

    } else if (item.type === "report") {
      var rep = document.createElement("div");
      rep.className = "feed-card report";
      if (item.isNew) rep.classList.add("is-new");
      rep.innerHTML =
        '<span class="report-icon">📄</span>' +
        '<div class="loc-info">' +
        '  <p class="loc-name">' + item.label + '</p>' +
        '  <p class="loc-blurb">Tap to read</p>' +
        '</div>';
      rep.addEventListener("click", function () {
        // Ferme le téléphone, ouvre le rapport en plein format
        var backdrop = document.getElementById("phone-overlay-backdrop");
        if (backdrop) backdrop.classList.remove("open");
        openReport(item.data);
      });
      feedEl.appendChild(rep);
    }
  });
}
