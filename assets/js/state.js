/* state.js — petits « drapeaux » portés par l'adresse de la page (?f=fern).
 * Aucune mémoire côté serveur : le drapeau voyage de lien en lien.
 *
 * GameState.flag("fern")                 → true si le drapeau est dans l'adresse
 * GameState.link(url)                    → url + drapeaux actuels
 * GameState.link(url, { flag: "fern" })  → idem + ajoute le drapeau "fern"
 * GameState.items(liste)                 → cartes du téléphone, liens mis à jour
 * GameState.items(liste, { flag: "fern" }) → idem + ajoute le drapeau "fern"
 */
var GameState = (function () {
  var params = new URLSearchParams(window.location.search);
  var flags = (params.get("f") || "").split(",").filter(Boolean);

  function flag(name) { return flags.indexOf(name) !== -1; }

  function link(url, opts) {
    if (!url || url === "#" || /^https?:/i.test(url)) return url;
    var list = flags.slice();
    if (opts && opts.flag && list.indexOf(opts.flag) === -1) list.push(opts.flag);
    if (!list.length) return url;

    var hashIndex = url.indexOf("#");
    var hash = hashIndex === -1 ? "" : url.slice(hashIndex);
    var base = hashIndex === -1 ? url : url.slice(0, hashIndex);
    var qIndex = base.indexOf("?");
    var q = new URLSearchParams(qIndex === -1 ? "" : base.slice(qIndex + 1));
    var bare = qIndex === -1 ? base : base.slice(0, qIndex);
    q.set("f", list.join(","));
    return bare + "?" + q.toString().replace(/%2C/gi, ",") + hash;
  }

  function items(list, opts) {
    return list.map(function (it) {
      if (it.type !== "location" || !it.url || it.locked || it.current) return it;
      var copy = {};
      for (var k in it) copy[k] = it[k];
      copy.url = link(it.url, opts);
      return copy;
    });
  }

  return { flags: flags, flag: flag, link: link, items: items };
})();
