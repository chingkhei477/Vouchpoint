/* VOUCHPOINT — renders offer cards from window.VP_OFFERS (assets/js/offers-data.js) */
(function () {
  "use strict";

  var offers = Array.isArray(window.VP_OFFERS) ? window.VP_OFFERS.filter(isValid) : [];

  function isValid(o) {
    return o && typeof o.store === "string" && o.store.trim() && typeof o.url === "string" && /^https?:\/\//i.test(o.url);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "className") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function card(o) {
    var mono = el("div", { className: "offer-monogram", "aria-hidden": "true" });
    if (o.logo) {
      mono.appendChild(el("img", { src: o.logo, alt: "", loading: "lazy", width: "50", height: "50" }));
    } else {
      mono.textContent = o.store.trim().charAt(0).toUpperCase();
    }
    var rate = el("div", { className: "offer-rate" }, [document.createTextNode(o.rate || "Cashback")]);
    rate.appendChild(el("small", { text: o.rateNote || "cashback" }));

    var stub = el("div", { className: "offer-stub" }, [mono, rate]);

    var meta = el("div", { className: "offer-meta" }, [
      el("span", { text: o.category || "Offer" }),
      o.expires ? el("span", { text: "Ends " + o.expires }) : null
    ]);
    var body = el("div", { className: "offer-body" }, [
      meta,
      el("h3", { className: "offer-store", text: o.store }),
      o.title ? el("p", { className: "offer-title", text: o.title }) : null
    ]);

    if (Array.isArray(o.terms) && o.terms.length) {
      var list = el("ul");
      o.terms.forEach(function (t) { list.appendChild(el("li", { text: t })); });
      body.appendChild(el("details", null, [el("summary", { text: "Offer terms" }), list]));
    }

    var btn = el("a", {
      className: "btn btn--primary btn--sm",
      href: o.url, target: "_blank", rel: "noopener sponsored nofollow",
      "aria-label": "Activate cashback at " + o.store + " (opens in a new tab)"
    }, [document.createTextNode("Activate cashback")]);

    body.appendChild(el("div", { className: "offer-foot" }, [
      o.confirmTime ? el("span", { className: "offer-time", text: o.confirmTime }) : el("span"),
      btn
    ]));

    return el("article", { className: "offer" }, [stub, body]);
  }

  function emptyState(container, variant) {
    var box = el("div", { className: "empty-state" });
    box.innerHTML =
      '<svg class="empty-ico" viewBox="0 0 84 84" aria-hidden="true">' +
      '<path fill="#FFFBF4" stroke="#16130F" stroke-width="2.5" d="M14 18h56a5 5 0 0 1 5 5v11a8 8 0 0 0 0 16v11a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V50a8 8 0 0 0 0-16V23a5 5 0 0 1 5-5Z"/>' +
      '<path stroke="#E8452C" stroke-width="2.5" stroke-dasharray="3 4" stroke-linecap="round" d="M60 22v40"/>' +
      '<path fill="none" stroke="#164B3E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M22 33l9 18 8-16"/>' +
      '<circle cx="44" cy="29" r="4" fill="#F3B23A"/></svg>' +
      (variant === "search"
        ? '<h3>No offers match that search</h3><p>Try another store name or clear the category filter.</p>'
        : '<h3>Verified offers are on their way</h3>' +
          '<p>We only list offers we have confirmed with the retailer, including the rate and the conditions. ' +
          'New offers will appear here as soon as they are live. Have a store you would like to see? Tell us.</p>' +
          '<div class="btn-row"><a class="btn btn--primary" href="contact.html?topic=store-request">Suggest a store</a>' +
          '<a class="btn btn--ghost" href="how-it-works.html">See how cashback works</a></div>');
    if (variant === "search") {
      var reset = el("button", { className: "btn btn--ghost btn--sm", type: "button", text: "Clear filters" });
      reset.addEventListener("click", function () { container.dispatchEvent(new CustomEvent("vp:reset")); });
      box.appendChild(reset);
    }
    return box;
  }

  /* Home page: featured strip */
  document.querySelectorAll("[data-offers='featured']").forEach(function (grid) {
    var limit = parseInt(grid.getAttribute("data-limit"), 10) || 3;
    var list = offers.filter(function (o) { return o.featured; });
    if (!list.length) list = offers.slice();
    list = list.slice(0, limit);
    grid.innerHTML = "";
    if (!list.length) { grid.appendChild(emptyState(grid, "none")); return; }
    list.forEach(function (o) { grid.appendChild(card(o)); });
  });

  /* Offers page: full list with search, category filter and sort */
  var grid = document.querySelector("[data-offers='all']");
  if (!grid) return;
  var toolbar = document.querySelector("[data-offer-toolbar]");
  var chipsBox = document.querySelector("[data-offer-chips]");
  var search = document.getElementById("offer-search");
  var sort = document.getElementById("offer-sort");
  var countEl = document.querySelector("[data-offer-count]");
  var state = { q: "", cat: "All", sort: "featured" };

  if (!offers.length) {
    if (toolbar) toolbar.classList.add("hidden");
    if (countEl) countEl.classList.add("hidden");
    grid.innerHTML = "";
    grid.appendChild(emptyState(grid, "none"));
    return;
  }

  var cats = ["All"];
  offers.forEach(function (o) { if (o.category && cats.indexOf(o.category) === -1) cats.push(o.category); });
  if (chipsBox) {
    cats.forEach(function (c) {
      var b = el("button", { className: "chip", type: "button", "aria-pressed": c === "All" ? "true" : "false", text: c });
      b.addEventListener("click", function () {
        state.cat = c;
        chipsBox.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        render();
      });
      chipsBox.appendChild(b);
    });
  }

  // Allow links such as offers.html?q=store
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && search) { search.value = params.get("q"); state.q = params.get("q").toLowerCase(); }
  } catch (e) { /* older browsers: ignore */ }

  if (search) search.addEventListener("input", function () { state.q = search.value.trim().toLowerCase(); render(); });
  if (sort) sort.addEventListener("change", function () { state.sort = sort.value; render(); });
  grid.addEventListener("vp:reset", function () {
    state.q = ""; state.cat = "All";
    if (search) search.value = "";
    if (chipsBox) chipsBox.querySelectorAll(".chip").forEach(function (x, i) { x.setAttribute("aria-pressed", i === 0 ? "true" : "false"); });
    render();
  });

  function rateNum(o) { var m = String(o.rate || "").match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; }

  function render() {
    var list = offers.filter(function (o) {
      var hay = [o.store, o.title, o.category].join(" ").toLowerCase();
      return (state.cat === "All" || o.category === state.cat) && (!state.q || hay.indexOf(state.q) !== -1);
    });
    if (state.sort === "az") list.sort(function (a, b) { return a.store.localeCompare(b.store); });
    else if (state.sort === "newest") list.sort(function (a, b) { return String(b.added || "").localeCompare(String(a.added || "")); });
    else if (state.sort === "rate") list.sort(function (a, b) { return rateNum(b) - rateNum(a); });
    else list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });

    grid.innerHTML = "";
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " offer" : " offers");
    if (!list.length) { grid.appendChild(emptyState(grid, "search")); return; }
    list.forEach(function (o) { grid.appendChild(card(o)); });
  }
  render();
})();
