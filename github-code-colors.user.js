// ==UserScript==
// @name          GitHub Code Colors
// @version       1.0.0
// @description   A userscript that adds a color swatch next to the code color definition
// @license       https://creativecommons.org/licenses/by-sa/4.0/
// @namespace     http://github.com/Mottie
// @include       https://github.com/*
// @grant         GM_addStyle
// @run-at        document-idle
// @author        Rob Garrison
// @updateURL     https://raw.githubusercontent.com/Mottie/GitHub-userscripts/master/github-code-colors.user.js
// @downloadURL   https://raw.githubusercontent.com/Mottie/GitHub-userscripts/master/github-code-colors.user.js
// ==/UserScript==
/* global GM_addStyle */
(function() {
  "use strict";

  GM_addStyle(".ghcc-block { width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px; border:1px solid #555; }");

  var busy = false,

  namedColors = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond",
    "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral",
    "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
    "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred",
    "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink",
    "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro",
    "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred",
    "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
    "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon",
    "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen",
    "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
    "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred",
    "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive",
    "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise",
    "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple",
    "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
    "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue",
    "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
    "yellowgreen"
  ].join("|"),

  addColors = function() {
    busy = true;
    if (document.querySelector(".highlight")) {
      var addNode, loop,
      indx = 0,
      regexNamed = new RegExp("^(" + namedColors + ")$"),
      // #123 or #123456
      regexHex = /^#([0-9A-F]{6}|[0-9A-F]{3})$/i,
      // rgb(0,0,0) or rgba(0,0,0,0.2)
      regexRGB = /^rgba?$/i,
      // hsl(0,0%,0%) or hsla(0,0%,0%,0.2);
      regexHSL = /^hsla?$/i,

      els = document.querySelectorAll(".pl-c1"),
      len = els.length,

      // don't use a div, because GitHub-Dark adds a :hover background color definition on divs
      block = document.createElement("span");
      block.className = "ghcc-block";

      addNode = function(el, val) {
        var node = block.cloneNode();
        node.style.backgroundColor = val;
        el.insertBefore(node, el.childNodes[0]);
      };

      // loop with delay to allow user interaction
      loop = function() {
        var el, txt, tmp,
        // max number of DOM insertions per loop
        max = 0;
        while ( max < 20 && indx < len ) {
          if (indx >= len) { return; }
          el = els[indx];
          txt = el.textContent;
          if (regexHex.test(txt) || regexNamed.test(txt)) {
            if (!el.querySelector(".ghcc-block")) {
              addNode(el, txt);
              max++;
            }
          } else if (regexRGB.test(txt)) {
            if (!el.querySelector(".ghcc-block")) {
              addNode(el, txt += "(" + els[++indx].textContent + ")");
              max++;
            }
          } else if (regexHSL.test(txt)) {
            if (!el.querySelector(".ghcc-block")) {
              tmp = /a$/i.test(txt);
              // traverse this HTML... & els only contains the pl-c1 nodes
              // <span class="pl-c1">hsl</span>(<span class="pl-c1">1</span>,
              // <span class="pl-c1">1</span><span class="pl-k">%</span>,
              // <span class="pl-c1">1</span><span class="pl-k">%</span>);
              txt += "(" + els[++indx].textContent + "," + els[++indx].textContent + "%," +
                els[++indx].textContent + "%" + (tmp ? "," + els[++indx].textContent : "") + ")";
              // sometimes (previews only?) the .pl-k span is nested inside the .pl-c1 span,
              // so we end up with "%%"
              addNode(el, txt.replace(/%%/g, "%"));
              max++;
            }
          }
          indx++;
        }
        if (indx < len) {
          setTimeout(function(){
            loop();
          }, 200);
        }
      };
      loop();
    }
    busy = false;
  },
  targets = document.querySelectorAll("#js-repo-pjax-container, #js-pjax-container, .js-preview-body");

  Array.prototype.forEach.call(targets, function(target) {
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // preform checks before adding code wrap to minimize function calls
        if (!busy && mutation.target === target) {
          addColors();
        }
      });
    }).observe(target, {
      childList: true,
      subtree: true
    });
  });

  addColors();

})();