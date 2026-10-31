/* state.js — petits « drapeaux » portés par l'adresse de la page (?f=fern).
 * Aucune mémoire côté serveur : le drapeau voyage de lien en lien.
 *
 * GameState.flag("fern")                 → true si le drapeau est dans l'adresse
 * GameState.link(url)                    → url + drapeaux actuels
 * GameState.link(url, { flag: "fern" })  → idem + ajoute le drapeau "fern"
 *                                            (flag peut aussi être une liste : ["fern","motel"])
 * GameState.items(liste)                 → cartes du téléphone, liens mis à jour
 * GameState.items(liste, { flag: "fern" }) → idem + ajoute le drapeau "fern"
 *   + « Visited » automatique : le lieu actuel est mémorisé (drapeau "v_<dossier>")
 *     et les cartes des lieux déjà visités reçoivent visited:true
 */
var GameState = (function () {
  var params = new URLSearchParams(window.location.search);
  var flags = (params.get("f") || "").split(",").filter(Boolean);

  function flag(name) { return flags.indexOf(name) !== -1; }

  function link(url, opts) {
    if (!url || url === "#" || /^https?:/i.test(url)) return url;
    var list = flags.slice();
    [].concat((opts && opts.flag) || []).forEach(function (f) {
      if (f && list.indexOf(f) === -1) list.push(f);
    });
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

  // Dernier dossier d'une url : "../bar-3/?x=1" -> "bar-3"
  function folderOf(url) {
    var u = String(url || "").split("#")[0].split("?")[0];
    var parts = u.split("/").filter(function (p) { return p && p !== "." && p !== ".." && !/\.html?$/i.test(p); });
    return parts.length ? parts[parts.length - 1] : "";
  }

  function items(list, opts) {
    // Lieu où se trouve le joueur : la carte "current", sinon le dossier de la page.
    var here = "";
    list.forEach(function (it) { if (it.type === "location" && it.current && it.url) here = folderOf(it.url); });
    if (!here) here = folderOf(window.location.pathname);
    var hereFlag = here ? "v_" + here : "";

    return list.map(function (it) {
      if (it.type !== "location" || !it.url || it.locked || it.current) return it;
      var copy = {};
      for (var k in it) copy[k] = it[k];
      // "Visited" si le drapeau de ce lieu voyage déjà dans l'adresse
      if (flags.indexOf("v_" + folderOf(it.url)) !== -1) copy.visited = true;
      // le lieu actuel est ajouté aux drapeaux pour la page suivante
      var withHere = link(it.url, { flag: [].concat(hereFlag || [], (opts && opts.flag) || []) });
      copy.url = withHere;
      return copy;
    });
  }

  return { flags: flags, flag: flag, link: link, items: items };
})();
