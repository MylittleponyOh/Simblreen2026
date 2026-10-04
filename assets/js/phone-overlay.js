/* ═══════════════════════════════════════════════════════════
   PHONE OVERLAY — moteur réutilisable
   Chaque page appelle : initPhoneOverlay(FEED_ITEMS, { hasNew: true/false })
   FEED_ITEMS est un tableau d'objets :
     - Message :  { type: "message", from: "MIKE", text: "...", attachment: { label: "...", url: "..." } }
     - Lieu :     { type: "location", name: "...", blurb: "...", thumb: null, url: "..." }
                  (optionnel : isNew: true → en tête + tag NEW ;
                   current: true → le lieu où se trouve Ashley : non cliquable, pastille "Here" ;
                   locked: true → affiché mais non visitable, non cliquable, pastille "Closed" ;
                   lockedLabel: "..." pour changer le texte de la pastille)

   Peut être appelé PLUSIEURS FOIS sur la même page (ex: depuis
   onSlideChange d'un diaporama) : le premier appel crée le téléphone,
   les suivants mettent juste à jour son contenu sans le dupliquer.
   ═══════════════════════════════════════════════════════════ */

function initPhoneOverlay(items, opts) {
  opts = opts || {};
  var imgPath = opts.imgPath || "../assets/images/phone-frame.png";

  var peekBtn = document.getElementById("phone-peek-btn");
  var alreadyExists = !!peekBtn;

  // ── Construction du DOM (uniquement au premier appel) ────
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

  // ── Mise à jour du badge "nouveau" ────────────────────────
  peekBtn.classList.toggle("has-new", !!opts.hasNew);
  var pillEl = document.getElementById("peek-notif-pill");
  var countEl = document.getElementById("peek-notif-count");
  if (pillEl) pillEl.style.display = opts.hasNew ? "flex" : "none";
  if (countEl) countEl.textContent = opts.newCount || 1;

  // ── Remplissage du feed (à chaque appel : on regénère tout) ─
  var feedEl = document.getElementById("phone-feed");
  feedEl.innerHTML = "";

  var SECTION_LABELS = { message: "Messages", report: "Files", location: "Locations" };
  var lastType = null;

  // Regroupe par type (ordre de première apparition) ; dans chaque groupe,
  // les items marqués isNew: true passent en premier, le reste garde son ordre.
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

    if (item.type === "message") {
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
        att.textContent = "📎 " + item.attachment.label;
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
