// Language
var Lang = {
  get: function () {
    try {
      var l = localStorage.getItem("lang");
      if (l === "fr" || l === "en") return l;
    } catch (e) {}
    return "en";
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
