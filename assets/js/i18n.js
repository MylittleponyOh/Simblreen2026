var Lang = {
  get: function () {
    try {
      var l = localStorage.getItem("lang");
      if (l === "fr" || l === "en") return l;
    } catch (e) {}
    return "en";
  },

  slides: function (slides) {
    if (this.get() !== "fr") return slides;
    slides.forEach(function (sl) {
      if (sl.fr !== undefined) sl.text = sl.fr;
      if (sl.lines) sl.lines.forEach(function (l) { if (l.fr !== undefined) l.text = l.fr; });
      if (sl.choices) sl.choices.forEach(function (c) { if (c.fr !== undefined) c.label = c.fr; });
    });
    return slides;
  },

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
