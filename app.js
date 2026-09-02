(function () {
  let DATA = null;
  const root = document.getElementById("app-root");

  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function findCategory(id) {
    return DATA.categories.find(function (c) { return c.id === id; });
  }

  function youtubeEmbed(id) {
    const wrap = el("div", "video-wrap");
    wrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id +
      '" title="Venture video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    return wrap;
  }

  function localVideoEl(src) {
    const wrap = el("div", "video-wrap video-wrap-local");
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    wrap.appendChild(video);
    return wrap;
  }

  function mediaCount(item) {
    return (item.photos ? item.photos.length : 0) +
      (item.youtube ? item.youtube.length : 0) +
      (item.localVideos ? item.localVideos.length : 0);
  }

  // Combined list of homepage/nav destinations: every venture category
  // plus the resale-plots section, in one consistent shape.
  function menuDestinations() {
    const items = DATA.categories.map(function (cat) {
      return { routeLabel: cat.routeLabel, name: cat.name, href: "#/category/" + cat.id };
    });
    if (DATA.resale) {
      items.push({ routeLabel: DATA.resale.routeLabel, name: DATA.resale.name, href: "#/resale" });
    }
    return items;
  }

  /* ---------- Header: site name + Projects dropdown ---------- */
  function renderHeader() {
    document.getElementById("site-name").textContent = DATA.siteName;
    document.getElementById("footer-name").textContent = DATA.siteName;
    document.getElementById("site-tagline").textContent = DATA.tagline;
    document.title = DATA.siteName + " — Open Plot Ventures";
    if (DATA.contactPhone) {
      document.getElementById("call-link").href = "tel:" + DATA.contactPhone.replace(/[^0-9+]/g, "");
    }

    const dropdown = document.getElementById("projects-dropdown");
    dropdown.innerHTML = "";
    menuDestinations().forEach(function (item) {
      const a = el("a", "dropdown-item", item.name);
      a.href = item.href;
      dropdown.appendChild(a);
    });

    const trigger = document.getElementById("projects-trigger");
    const navItem = document.getElementById("projects-nav");
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      navItem.classList.toggle("open");
    });
    document.addEventListener("click", function () {
      navItem.classList.remove("open");
    });
  }

  /* ---------- Home view ---------- */
  function viewHome() {
    const wrap = el("div", "home-view");

    const hero = el("section", "home-split");
    const videoCol = el("div", "home-video-col");
    videoCol.appendChild(el("h2", null, DATA.highlightVideoTitle || "Highlights"));
    if (DATA.highlightVideo) {
      videoCol.appendChild(youtubeEmbed(DATA.highlightVideo));
    } else {
      videoCol.appendChild(el("div", "video-placeholder", "Highlight video will appear here — add a YouTube ID to <code>highlightVideo</code> in data.js"));
    }
    hero.appendChild(videoCol);

    const menuCol = el("div", "home-menu-col");
    menuCol.appendChild(el("h2", null, "Projects"));
    const menuGrid = el("div", "menu-grid");
    menuDestinations().forEach(function (item) {
      const card = el("a", "menu-card bubble-card");
      card.href = item.href;
      card.innerHTML = '<span class="menu-card-route">' + item.routeLabel + '</span><span class="menu-card-name">' + item.name + '</span>';
      menuGrid.appendChild(card);
    });
    menuCol.appendChild(menuGrid);
    hero.appendChild(menuCol);

    wrap.appendChild(hero);
    return wrap;
  }

  /* ---------- Category view: list of ventures ---------- */
  function viewCategory(catId) {
    const category = findCategory(catId);
    const wrap = el("div", "category-view");
    if (!category) {
      wrap.appendChild(el("p", "empty-note", "That project category couldn't be found."));
      wrap.appendChild(backLink("#/", "Back to home"));
      return wrap;
    }

    wrap.appendChild(backLink("#/", "← Home"));
    const head = el("div", "category-head",
      "<h1>" + category.name + "</h1><span class='category-route-code'>" + category.routeLabel + "</span>");
    wrap.appendChild(head);
    wrap.appendChild(el("p", "category-blurb", category.blurb || ""));

    const grid = el("div", "venture-grid");
    category.ventures.forEach(function (venture, idx) {
      const card = el("a", "venture-card bubble-card");
      card.href = "#/venture/" + category.id + "/" + idx;
      card.appendChild(el("div", "venture-stop", "Stop " + (idx + 1) + " · " + category.routeLabel));
      card.appendChild(el("h3", null, venture.name));

      const stats = el("div", "venture-stats");
      stats.innerHTML =
        "<div>Available<br><strong>" + (venture.availablePlots || "—") + " plots</strong></div>" +
        "<div>Market price<br><strong>" + (venture.marketPricePerSqYd || "—") + "</strong></div>";
      card.appendChild(stats);

      const count = mediaCount(venture);
      card.appendChild(el("div", "venture-media-count",
        count ? (count + " photo" + (count === 1 ? "" : "s") + "/video" + (count === 1 ? "" : "s")) : "View details"));

      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  /* ---------- Venture detail view ---------- */
  function viewVenture(catId, index) {
    const category = findCategory(catId);
    const venture = category && category.ventures[index];
    const wrap = el("div", "venture-view");

    if (!category || !venture) {
      wrap.appendChild(el("p", "empty-note", "That venture couldn't be found."));
      wrap.appendChild(backLink("#/", "Back to home"));
      return wrap;
    }

    wrap.appendChild(backLink("#/category/" + category.id, "← " + category.name));
    wrap.appendChild(el("h1", null, venture.name));
    wrap.appendChild(el("p", "m-location", venture.location || ""));

    if (venture.mapLink) {
      const mapBtn = el("a", "map-btn", "View on map");
      mapBtn.href = venture.mapLink;
      mapBtn.target = "_blank";
      mapBtn.rel = "noopener";
      wrap.appendChild(mapBtn);
    }

    if (venture.description) {
      wrap.appendChild(el("p", "m-desc", venture.description));
    }

    const specs = [
      ["RERA No.", venture.rera],
      ["LP No.", venture.lp],
      ["Total acres", venture.totalAcres],
      ["Total plots", venture.totalPlots],
      ["Available plots", venture.availablePlots],
      ["Market price / sq. yd", venture.marketPricePerSqYd],
      ["Govt. price / sq. yd", venture.govtPricePerSqYd]
    ];
    const table = el("table", "spec-table");
    specs.forEach(function (row) {
      if (!row[1]) return;
      table.appendChild(el("tr", null, "<td>" + row[0] + "</td><td>" + row[1] + "</td>"));
    });
    wrap.appendChild(table);

    const hasYoutube = venture.youtube && venture.youtube.length;
    const hasLocalVideos = venture.localVideos && venture.localVideos.length;
    if (hasYoutube || hasLocalVideos) {
      wrap.appendChild(el("h3", "section-label", "Videos"));
      if (hasYoutube) venture.youtube.forEach(function (id) { wrap.appendChild(youtubeEmbed(id)); });
      if (hasLocalVideos) venture.localVideos.forEach(function (src) { wrap.appendChild(localVideoEl(src)); });
    }

    if (venture.photos && venture.photos.length) {
      wrap.appendChild(el("h3", "section-label", "Photos"));
      const gallery = el("div", "gallery");
      venture.photos.forEach(function (src) {
        const img = el("img");
        img.src = src;
        img.alt = venture.name;
        gallery.appendChild(img);
      });
      wrap.appendChild(gallery);
    }

    if ((!venture.photos || !venture.photos.length) && !hasYoutube && !hasLocalVideos) {
      wrap.appendChild(el("p", "empty-note", "Photos and videos for this venture will be added soon."));
    }

    const actions = el("div", "venture-actions");
    if (venture.brochure) {
      const brochureBtn = el("a", "brochure-btn", "Download brochure");
      brochureBtn.href = venture.brochure;
      brochureBtn.target = "_blank";
      brochureBtn.rel = "noopener";
      actions.appendChild(brochureBtn);
    }
    if (DATA.contactWhatsapp) {
      const wa = el("a", "wa-btn", "Enquire on WhatsApp");
      wa.href = "https://wa.me/" + DATA.contactWhatsapp +
        "?text=" + encodeURIComponent("Hi, I'm interested in " + venture.name);
      wa.target = "_blank";
      wa.rel = "noopener";
      actions.appendChild(wa);
    }
    wrap.appendChild(actions);

    return wrap;
  }

  function backLink(href, label) {
    const a = el("a", "back-link", label);
    a.href = href;
    return a;
  }

  /* ---------- Resale plots: list view ---------- */
  function viewResale() {
    const resale = DATA.resale;
    const wrap = el("div", "category-view");
    if (!resale) {
      wrap.appendChild(el("p", "empty-note", "Resale listings couldn't be found."));
      wrap.appendChild(backLink("#/", "Back to home"));
      return wrap;
    }

    wrap.appendChild(backLink("#/", "← Home"));
    const head = el("div", "category-head",
      "<h1>" + resale.name + "</h1><span class='category-route-code'>" + resale.routeLabel + "</span>");
    wrap.appendChild(head);
    wrap.appendChild(el("p", "category-blurb", resale.blurb || ""));

    const grid = el("div", "venture-grid resale-grid");
    (resale.listings || []).forEach(function (listing, idx) {
      const card = el("a", "venture-card resale-card bubble-card");
      card.href = "#/resale/" + idx;
      card.appendChild(el("h3", null, listing.title));

      const stats = el("div", "venture-stats resale-stats");
      stats.innerHTML =
        "<div>Size<br><strong>" + (listing.size || "—") + "</strong></div>" +
        "<div>Dimensions<br><strong>" + (listing.dimensions || "—") + "</strong></div>" +
        "<div>Price<br><strong>" + (listing.price || "—") + "</strong></div>";
      card.appendChild(stats);

      const count = mediaCount(listing);
      card.appendChild(el("div", "venture-media-count",
        count ? (count + " photo" + (count === 1 ? "" : "s") + "/video" + (count === 1 ? "" : "s")) : "View details"));

      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  /* ---------- Resale plots: detail view ---------- */
  function viewResaleDetail(index) {
    const resale = DATA.resale;
    const listing = resale && resale.listings[index];
    const wrap = el("div", "venture-view");

    if (!resale || !listing) {
      wrap.appendChild(el("p", "empty-note", "That listing couldn't be found."));
      wrap.appendChild(backLink("#/", "Back to home"));
      return wrap;
    }

    wrap.appendChild(backLink("#/resale", "← " + resale.name));
    wrap.appendChild(el("h1", null, listing.title));
    wrap.appendChild(el("p", "m-location", listing.location || ""));

    if (listing.mapLink) {
      const mapBtn = el("a", "map-btn", "View on map");
      mapBtn.href = listing.mapLink;
      mapBtn.target = "_blank";
      mapBtn.rel = "noopener";
      wrap.appendChild(mapBtn);
    }

    if (listing.description) {
      wrap.appendChild(el("p", "m-desc", listing.description));
    }

    const specs = [
      ["Size", listing.size],
      ["Dimensions", listing.dimensions],
      ["Price", listing.price],
      ["Facing", listing.facing]
    ];
    const table = el("table", "spec-table");
    specs.forEach(function (row) {
      if (!row[1]) return;
      table.appendChild(el("tr", null, "<td>" + row[0] + "</td><td>" + row[1] + "</td>"));
    });
    wrap.appendChild(table);

    const hasYoutube = listing.youtube && listing.youtube.length;
    const hasLocalVideos = listing.localVideos && listing.localVideos.length;
    if (hasYoutube || hasLocalVideos) {
      wrap.appendChild(el("h3", "section-label", "Videos"));
      if (hasYoutube) listing.youtube.forEach(function (id) { wrap.appendChild(youtubeEmbed(id)); });
      if (hasLocalVideos) listing.localVideos.forEach(function (src) { wrap.appendChild(localVideoEl(src)); });
    }

    if (listing.photos && listing.photos.length) {
      wrap.appendChild(el("h3", "section-label", "Photos"));
      const gallery = el("div", "gallery");
      listing.photos.forEach(function (src) {
        const img = el("img");
        img.src = src;
        img.alt = listing.title;
        gallery.appendChild(img);
      });
      wrap.appendChild(gallery);
    }

    if ((!listing.photos || !listing.photos.length) && !hasYoutube && !hasLocalVideos) {
      wrap.appendChild(el("p", "empty-note", "Photos and videos for this plot will be added soon."));
    }

    if (DATA.contactWhatsapp) {
      const actions = el("div", "venture-actions");
      const wa = el("a", "wa-btn", "Enquire on WhatsApp");
      wa.href = "https://wa.me/" + DATA.contactWhatsapp +
        "?text=" + encodeURIComponent("Hi, I'm interested in " + listing.title);
      wa.target = "_blank";
      wa.rel = "noopener";
      actions.appendChild(wa);
      wrap.appendChild(actions);
    }

    return wrap;
  }

  /* ---------- Privacy policy view ---------- */
  function viewPrivacy() {
    const policy = DATA.privacyPolicy;
    const wrap = el("div", "venture-view privacy-view");
    wrap.appendChild(backLink("#/", "← Home"));
    wrap.appendChild(el("h1", null, "Privacy Policy"));

    if (!policy) {
      wrap.appendChild(el("p", "empty-note", "Privacy policy content coming soon."));
      return wrap;
    }

    if (policy.lastUpdated) {
      wrap.appendChild(el("p", "m-location", "Last updated: " + policy.lastUpdated));
    }
    if (policy.intro) {
      wrap.appendChild(el("p", "m-desc", policy.intro));
    }
    (policy.sections || []).forEach(function (section) {
      wrap.appendChild(el("h3", "section-label", section.heading));
      wrap.appendChild(el("p", "m-desc", section.body));
    });

    return wrap;
  }

  /* ---------- Router ---------- */
  function render() {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean);
    root.innerHTML = "";

    if (parts.length === 0) {
      root.appendChild(viewHome());
    } else if (parts[0] === "category" && parts[1]) {
      root.appendChild(viewCategory(parts[1]));
    } else if (parts[0] === "venture" && parts[1] && parts[2] !== undefined) {
      root.appendChild(viewVenture(parts[1], Number(parts[2])));
    } else if (parts[0] === "resale" && parts[1] !== undefined) {
      root.appendChild(viewResaleDetail(Number(parts[1])));
    } else if (parts[0] === "resale") {
      root.appendChild(viewResale());
    } else if (parts[0] === "privacy") {
      root.appendChild(viewPrivacy());
    } else {
      root.appendChild(viewHome());
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", render);

  fetch("data.json")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      DATA = json;
      renderHeader();
      render();
    })
    .catch(function (err) {
      root.innerHTML = '<p class="empty-note">Could not load site content (data.json). ' +
        'If you just edited data.json, check it is still valid JSON.</p>';
      console.error("Failed to load data.json:", err);
    });
})();
