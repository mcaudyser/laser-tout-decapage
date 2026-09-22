(function () {
  "use strict";

  /* ===== Mobile menu ===== */
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var isHidden = mobileNav.hasAttribute("hidden");
      if (isHidden) {
        mobileNav.removeAttribute("hidden");
        menuToggle.setAttribute("aria-expanded", "true");
      } else {
        mobileNav.setAttribute("hidden", "");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.setAttribute("hidden", "");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===== Before / after comparator ===== */
  function initComparator(frame) {
    var wrap = frame.querySelector(".compare-before-wrap");
    var handle = frame.querySelector(".compare-handle");
    var dragging = false;

    function setPosition(clientX) {
      var rect = frame.getBoundingClientRect();
      var x = ((clientX - rect.left) / rect.width) * 100;
      x = Math.max(0, Math.min(100, x));
      wrap.style.width = x + "%";
      handle.style.left = x + "%";
    }

    function onPointerDown(e) {
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setPosition(e.clientX);
    }

    function onPointerUp(e) {
      dragging = false;
      if (frame.hasPointerCapture(e.pointerId)) {
        frame.releasePointerCapture(e.pointerId);
      }
    }

    frame.addEventListener("pointerdown", onPointerDown);
    frame.addEventListener("pointermove", onPointerMove);
    frame.addEventListener("pointerup", onPointerUp);
    frame.addEventListener("pointercancel", onPointerUp);

    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "slider");
    frame.setAttribute("aria-label", "Curseur de comparaison avant après");
    frame.setAttribute("aria-valuemin", "0");
    frame.setAttribute("aria-valuemax", "100");

    frame.addEventListener("keydown", function (e) {
      var current = parseFloat(wrap.style.width) || 50;
      var step = 5;
      if (e.key === "ArrowLeft") {
        current = Math.max(0, current - step);
      } else if (e.key === "ArrowRight") {
        current = Math.min(100, current + step);
      } else {
        return;
      }
      e.preventDefault();
      wrap.style.width = current + "%";
      handle.style.left = current + "%";
    });
  }

  document.querySelectorAll(".compare-frame").forEach(initComparator);

  /* ===== CMS content loader (Decap CMS content/*.json) ===== */
  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && typeof acc === "object" ? acc[key] : undefined;
    }, obj);
  }

  function applyContent(root, data) {
    root.querySelectorAll("[data-field]").forEach(function (el) {
      var path = el.getAttribute("data-field");
      var value = get(data, path);
      if (value === undefined || value === null || value === "") return;

      var attr = el.getAttribute("data-field-attr");
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    });
  }

  function loadJSON(url) {
    return fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Impossible de charger " + url);
        return res.json();
      })
      .catch(function () {
        return null;
      });
  }

  loadJSON("content/site.json").then(function (data) {
    if (!data) return;
    applyContent(document, data);

    var phone = get(data, "contact.telephone");
    var phoneLink = document.getElementById("contact-phone");
    if (phone && phoneLink) {
      phoneLink.textContent = phone;
      phoneLink.href = "tel:" + phone.replace(/[^0-9+]/g, "");
    }
  });

  loadJSON("content/comparator.json").then(function (data) {
    if (!data) return;
    document.querySelectorAll(".compare-frame").forEach(function (frame) {
      var material = frame.getAttribute("data-material");
      var entry = data[material];
      if (!entry) return;
      var afterImg = frame.querySelector(".compare-after");
      var beforeImg = frame.querySelector(".compare-before");
      if (entry.apres && afterImg) afterImg.src = entry.apres;
      if (entry.avant && beforeImg) beforeImg.src = entry.avant;
    });
  });
})();
