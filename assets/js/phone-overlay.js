/* ═══════════════════════════════════════════════════════════
   PHONE OVERLAY — moteur réutilisable
   Chaque page appelle : initPhoneOverlay(FEED_ITEMS, { hasNew: true/false })
   FEED_ITEMS est un tableau d'objets :
     - Message :  { type: "message", from: "MIKE", text: "...", attachment: { label: "...", url: "..." } }
     - Lieu :     { type: "location", name: "...", blurb: "...", thumb: null, url: "..." }
   ═══════════════════════════════════════════════════════════ */

function initPhoneOverlay(items, opts) {
  opts = opts || {};
  var imgPath = opts.imgPath || "../assets/images/phone-frame.png";

  // ── Construction du DOM ──────────────────────────────────
  var peekBtn = document.createElement("div");
  peekBtn.id = "phone-peek-btn";
  if (opts.hasNew) peekBtn.classList.add("has-new");
  peekBtn.innerHTML =
    '<div class="peek-badge"></div>' +
    '<img src="' + imgPath + '" alt="Phone">';
  document.body.appendChild(peekBtn);

  var backdrop = document.createElement("div");
  backdrop.id = "phone-overlay-backdrop";
  backdrop.innerHTML =
    '<div id="phone-modal">' +
    '  <button class="phone-close" id="phone-close-btn">✕</button>' +
    '  <img class="phone-frame" src="' + imgPath + '" alt="">' +
    '  <div class="phone-screen">' +
    '    <div class="feed-header"><h1>Copperdale</h1></div>' +
    '    <div class="feed" id="phone-feed"></div>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(backdrop);

  // ── Remplissage du feed ──────────────────────────────────
  var feedEl = document.getElementById("phone-feed");

  items.forEach(function (item) {
    if (item.type === "message") {
      var card = document.createElement("div");
      card.className = "feed-card message";

      var from = document.createElement("p");
      from.className = "msg-from";
      from.textContent = item.from;

      var text = document.createElement("p");
      text.className = "msg-text";
      text.textContent = item.text;

      card.appendChild(from);
      card.appendChild(text);

      if (item.attachment) {
        var att = document.createElement("a");
        att.className = "msg-attachment";
        att.href = item.attachment.url;
        att.textContent = "📎 " + item.attachment.label;
        card.appendChild(att);
      }

      feedEl.appendChild(card);

    } else if (item.type === "location") {
      var loc = document.createElement("a");
      loc.className = "feed-card location";
      loc.href = item.url;

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
      go.textContent = "Go";
      loc.appendChild(go);

      feedEl.appendChild(loc);
    }
  });

  // ── Interactions ──────────────────────────────────────────
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
