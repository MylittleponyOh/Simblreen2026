// Language helper shared by every page.
var FR_UI = {
  "Next": "Suivant",
  "Continue": "Continuer",
  "Skip": "Passer",
  "Messages": "Messages",
  "Notes": "Notes",
  "Files": "Fichiers",
  "Locations": "Lieux",
  "Apps": "Applis",
  "New": "Nouveau",
  "Photo": "Photo",
  "Tap to read": "Appuyer pour lire",
  "Tap to record": "Appuyer pour enregistrer",
  "Recording…": "Enregistrement…",
  "Voice Recorder": "Dictaphone",
  "Go": "Y aller",
  "Visited": "Visité",
  "Here": "Ici",
  "Closed": "Fermé",
  "(coming soon)": "(bientôt disponible)",
  "Ashley's note": "Note d’Ashley",
  "← Previous": "← Précédent",
  "Next →": "Suivant →"
};

var Lang = {
  get: function () {
    try {
      var l = localStorage.getItem("lang");
      if (l === "fr" || l === "en") return l;
    } catch (e) {}
    return "en";
  },

  t: function (s) {
    if (this.get() === "fr" && FR_UI[s] !== undefined) return FR_UI[s];
    return s;
  },

  slides: function (slides) {
    if (this.get() !== "fr") return slides;
    function one(o) {
      if (o.fr !== undefined) o.text = o.fr;
      if (o.speakerFr !== undefined) o.speaker = o.speakerFr;
    }
    slides.forEach(function (sl) {
      one(sl);
      if (sl.lines) sl.lines.forEach(one);
      if (sl.choices) sl.choices.forEach(function (c) { if (c.fr !== undefined) c.label = c.fr; });
    });
    return slides;
  },

  // Phone items FR
  items: function (items) {
    if (this.get() !== "fr") return items;
    var self = this;
    items.forEach(function (it) {
      if (it.fr && typeof it.fr === "object") {
        for (var k in it.fr) it[k] = it.fr[k];
      }
      if (it.attachment && it.attachment.fr !== undefined) it.attachment.label = it.attachment.fr;
      if (it.data) self.report(it.data);
    });
    return items;
  },

  // Report & diary
  report: function (data) {
    if (this.get() !== "fr") return data;
    if (data.fr) for (var k in data.fr) data[k] = data.fr[k];
    (data.sections || []).forEach(function (sec) {
      if (sec.fr) for (var j in sec.fr) sec[j] = sec.fr[j];
    });
    return data;
  },

  //  warning page
  apply: function (dict) {
    var lang = this.get();
    document.documentElement.lang = lang;
    var d = dict && dict[lang];
    if (!d) return;
    if (d._title) document.title = d._title;
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      if (d[key] !== undefined) els[i].innerHTML = d[key];
    }
  }
};
