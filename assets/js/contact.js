/* VOUCHPOINT — contact form validation and delivery
   This is a static site with no server, so a valid form opens the
   visitor's email app with a pre-filled message to support@vouchpoint.in.
   To receive submissions directly instead, set FORM_ENDPOINT to a form
   service URL that accepts JSON POST requests. */
(function () {
  "use strict";

  var SUPPORT_EMAIL = "support@vouchpoint.in";
  var FORM_ENDPOINT = ""; // optional, e.g. "https://your-form-service.example/submit"

  var form = document.getElementById("contact-form");
  if (!form) return;
  var wrap = form.closest(".form");
  var topic = form.querySelector("#topic");
  var orderField = form.querySelector("[data-order-field]");
  var success = document.querySelector(".form-success");
  var fallback = document.querySelector("[data-mail-fallback]");

  var TOPICS = {
    "general": "General question",
    "missing-cashback": "Missing cashback",
    "withdrawal": "Withdrawal help",
    "store-request": "Store suggestion",
    "partnership": "Partnership enquiry",
    "privacy": "Privacy request",
    "other": "Other"
  };

  // Preselect topic from ?topic=... (used by links across the site)
  try {
    var t = new URLSearchParams(window.location.search).get("topic");
    if (t && TOPICS[t] && topic) topic.value = t;
  } catch (e) { /* ignore */ }

  function syncOrder() {
    if (!orderField || !topic) return;
    var show = topic.value === "missing-cashback";
    orderField.classList.toggle("hidden", !show);
    var input = orderField.querySelector("input");
    if (input) { input.required = show; if (!show) clearError(input); }
  }
  if (topic) topic.addEventListener("change", syncOrder);
  syncOrder();

  function fieldOf(input) { return input.closest(".field"); }
  function setError(input, msg) {
    var f = fieldOf(input); if (!f) return;
    f.classList.add("has-error");
    var e = f.querySelector(".error"); if (e) e.textContent = msg;
    input.setAttribute("aria-invalid", "true");
  }
  function clearError(input) {
    var f = fieldOf(input); if (!f) return;
    f.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
  }

  function validate(input) {
    var v = (input.type === "checkbox") ? input.checked : input.value.trim();
    if (input.required && !v) { setError(input, input.getAttribute("data-msg") || "This field is required."); return false; }
    if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setError(input, "Please enter a valid email address."); return false; }
    if (input.name === "message" && v && v.length < 15) { setError(input, "Please add a little more detail (at least 15 characters)."); return false; }
    clearError(input); return true;
  }

  form.querySelectorAll("input, select, textarea").forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value || input.type === "checkbox") validate(input); });
    input.addEventListener("input", function () { if (fieldOf(input) && fieldOf(input).classList.contains("has-error")) validate(input); });
  });

  function buildBody(data) {
    var lines = [
      "Name: " + data.name,
      "Email: " + data.email,
      "Topic: " + (TOPICS[data.topic] || data.topic)
    ];
    if (data.order) lines.push("Order ID / date: " + data.order);
    if (data.store) lines.push("Store: " + data.store);
    lines.push("", data.message);
    return lines.join("\n");
  }

  function showSuccess(mailto) {
    if (wrap) wrap.classList.add("is-sent");
    if (success) { success.classList.add("is-visible"); success.setAttribute("tabindex", "-1"); success.focus(); }
    if (fallback && mailto) fallback.setAttribute("href", mailto);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector("[name='company']").value) return; // honeypot: bots fill hidden fields
    var ok = true, first = null;
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      if (input.name === "company" || input.closest(".hidden")) return;
      if (!validate(input)) { ok = false; if (!first) first = input; }
    });
    if (!ok) { first.focus(); return; }

    var data = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      topic: topic ? topic.value : "general",
      order: form.elements["order"] ? form.elements["order"].value.trim() : "",
      store: form.elements["store"] ? form.elements["store"].value.trim() : "",
      message: form.elements["message"].value.trim()
    };
    var subject = "[VOUCHPOINT] " + (TOPICS[data.topic] || "Message") + " — " + data.name;
    var mailto = "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildBody(data));

    if (FORM_ENDPOINT) {
      var btn = form.querySelector("[type='submit']");
      btn.disabled = true; btn.textContent = "Sending…";
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error("Request failed"); showSuccess(null); })
        .catch(function () { window.location.href = mailto; showSuccess(mailto); })
        .finally(function () { btn.disabled = false; btn.textContent = "Send message"; });
    } else {
      window.location.href = mailto;
      showSuccess(mailto);
    }
  });

  var again = document.querySelector("[data-form-reset]");
  if (again) again.addEventListener("click", function () {
    form.reset(); syncOrder();
    if (wrap) wrap.classList.remove("is-sent");
    if (success) success.classList.remove("is-visible");
    form.querySelector("input").focus();
  });

  var copyBtn = document.querySelector("[data-copy-email]");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var done = function () { copyBtn.textContent = "Copied!"; setTimeout(function () { copyBtn.textContent = "Copy email"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(SUPPORT_EMAIL).then(done, function () {});
    else { var ta = document.createElement("textarea"); ta.value = SUPPORT_EMAIL; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (er) {} ta.remove(); }
  });
})();
