// ---------- category setup ----------
var CATEGORIES = [
  { slug: "sagar", label: "Sagar Highway" },
  { slug: "vijayawada", label: "Vijayawada Highway" },
  { slug: "srisailam", label: "Srisailam Highway" },
  { slug: "warangal", label: "Warangal Highway" },
  { slug: "futurecity", label: "Future City" },
  { slug: "westhyderabad", label: "West Hyderabad" }
];

function catLabel(slug) {
  for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].slug === slug) return CATEGORIES[i].label;
  return slug;
}
function catSlugFromLabel(label) {
  var norm = (label || "").toLowerCase();
  for (var i = 0; i < CATEGORIES.length; i++) {
    if (norm.indexOf(CATEGORIES[i].label.toLowerCase().split(" ")[0]) !== -1) return CATEGORIES[i].slug;
  }
  return "";
}
function slugify(s) {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------- CSV parsing (handles quoted fields with commas) ----------
function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = "";
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  var headers = rows[0].map(function (h) { return h.trim(); });
  return rows.slice(1).filter(function (r) { return r.some(function (v) { return v.trim() !== ""; }); })
    .map(function (r) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = (r[i] || "").trim(); });
      return obj;
    });
}

function findField(obj, partial) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase().indexOf(partial.toLowerCase()) !== -1) return obj[keys[i]];
  }
  return "";
}

function youtubeId(url) {
  if (!url) return "";
  var m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

// ---------- data ----------
var PROJECTS = [];
var GALLERY = []; // { url, ventureName }, aggregated from all ventures' photos, max 50
var GREETING = null; // { imageUrl, caption, link } or null when there's nothing active to show
var carouselTimer = null;
var carouselIndex = 0;

function buildGallery() {
  var items = [];
  PROJECTS.forEach(function (p) {
    p.photos.forEach(function (url) {
      if (items.length < 50) items.push({ url: url, ventureName: p.name });
    });
  });
  GALLERY = items;
}

// Converts Google Drive share links (or any comma-separated list of them)
// into direct-view image URLs so <img> tags can actually display them.
function convertDriveLinks(rawLinks) {
  if (!rawLinks) return "";

  // Handles multiple files separated by commas
  var links = rawLinks.split(",");
  var converted = [];

  for (var i = 0; i < links.length; i++) {
    var link = links[i].trim();
    if (!link) continue;

    // Extract the file ID from any Drive link format
    var match = link.match(/[-\w]{25,}/); // Drive file IDs are long alphanumeric strings
    if (match) {
      var fileId = match[0];
      // Google disabled the old "uc?export=view" embed format (it now
      // returns 403 Forbidden for most accounts). The "thumbnail" endpoint
      // is the current working way to hotlink a Drive image in an <img> tag.
      converted.push("https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000");
    } else {
      converted.push(link); // fallback: keep original if pattern not found
    }
  }

  return converted.join(",");
}

function loadProjects(cb) {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.indexOf("PASTE_") === 0) {
    PROJECTS = [];
    cb();
    return;
  }
  fetch(SHEET_CSV_URL)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var objs = rowsToObjects(parseCSV(text));
      PROJECTS = objs.map(function (o) {
        var name = findField(o, "project name") || findField(o, "name");
        var catLbl = findField(o, "category");
        var photos = convertDriveLinks(findField(o, "photo")).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        return {
          name: name,
          slug: slugify(name),
          category: catSlugFromLabel(catLbl) || slugify(catLbl),
          categoryLabel: catLbl,
          rera: findField(o, "rera"),
          lp: findField(o, "lp no"),
          acres: findField(o, "acres"),
          plots: findField(o, "plots"),
          price: findField(o, "market price"),
          govtPrice: findField(o, "govt price"),
          location: findField(o, "location") || findField(o, "maps"),
          photos: photos,
          video: findField(o, "video"),
          brochure: findField(o, "brochure")
        };
      });
      buildGallery();
      cb();
    })
    .catch(function () { PROJECTS = []; cb(); });
}

// Loads the home page greeting/quote banner from its own published Sheet
// tab. Picks the first row marked Active (yes/blank counts as active, "no"
// hides it) that has an image URL. Any other row is simply ignored — no
// need to delete old rows, just flip Active to "no" or leave it blank.
function loadGreeting(cb) {
  if (!GREETING_CSV_URL || GREETING_CSV_URL.indexOf("PASTE_") === 0) {
    GREETING = (typeof GREETING_IMAGE_URL !== "undefined" && GREETING_IMAGE_URL)
      ? { imageUrl: GREETING_IMAGE_URL, caption: (typeof GREETING_CAPTION !== "undefined" ? GREETING_CAPTION : ""), link: "" }
      : null;
    cb();
    return;
  }
  fetch(GREETING_CSV_URL)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var objs = rowsToObjects(parseCSV(text));
      var picked = null;
      for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        var active = (findField(o, "active") || "yes").toLowerCase();
        var img = convertDriveLinks(findField(o, "image")).split(",")[0];
        if (active !== "no" && active !== "false" && img) {
          picked = {
            imageUrl: img,
            caption: findField(o, "caption") || findField(o, "message"),
            link: findField(o, "link")
          };
          break;
        }
      }
      GREETING = picked;
      cb();
    })
    .catch(function () { GREETING = null; cb(); });
}

// ---------- rendering ----------
var app = document.getElementById("app");

function greetingHtml() {
  if (!GREETING) return "";
  var img = '<img src="' + GREETING.imageUrl + '" alt="' + (GREETING.caption || "Greetings") + '" onerror="this.closest(\'.hero-greeting-card\').style.display=\'none\'">';
  var captionHtml = GREETING.caption ? '<div class="hero-greeting-caption">' + GREETING.caption + '</div>' : "";
  var content = img + captionHtml;
  return GREETING.link
    ? '<a href="' + GREETING.link + '" target="_blank" rel="noopener" class="hero-greeting-card">' + content + '</a>'
    : '<div class="hero-greeting-card">' + content + '</div>';
}

function ventureRow(p) {
  var img = p.photos[0]
    ? '<img class="venture-photo" src="' + p.photos[0] + '" alt="' + p.name + '">'
    : '<div class="venture-photo-ph">Photo coming soon</div>';
  return '' +
    '<div class="venture-row" data-slug="' + p.slug + '">' +
      img +
      '<div class="venture-info">' +
        '<div class="venture-cat">' + (p.categoryLabel || catLabel(p.category)) + '</div>' +
        '<h3>' + p.name + '</h3>' +
        '<div class="venture-meta">' +
          (p.acres ? '<span><b>' + p.acres + '</b> acres</span>' : '') +
          (p.plots ? '<span><b>' + p.plots + '</b> plots</span>' : '') +
          (p.rera ? '<span>RERA <b>' + p.rera + '</b></span>' : '') +
        '</div>' +
        (p.price ? '<div class="venture-price">Rs ' + p.price + ' / sq yd</div>' : '') +
      '</div>' +
    '</div>';
}

function carouselHtml() {
  if (!GALLERY.length) return "";
  var slides = GALLERY.map(function (g, i) {
    return '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' +
      '<div class="carousel-bg" style="background-image:url(\'' + g.url + '\')"></div>' +
      '<img src="' + g.url + '" alt="' + g.ventureName + '">' +
      '<div class="carousel-caption">' + g.ventureName + '</div>' +
    '</div>';
  }).join("");
  var dotsHtml = "";
  if (GALLERY.length <= 12) {
    var dots = GALLERY.map(function (g, i) {
      return '<span' + (i === 0 ? ' class="active"' : '') + '></span>';
    }).join("");
    dotsHtml = '<div class="carousel-dots">' + dots + '</div>';
  }
  return '<div class="carousel" id="home-carousel">' + slides + dotsHtml + '</div>';
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
}

function startCarousel() {
  stopCarousel();
  carouselIndex = 0;
  if (GALLERY.length < 2) return;
  carouselTimer = setInterval(function () {
    var el = document.getElementById("home-carousel");
    if (!el) { stopCarousel(); return; }
    var slides = el.querySelectorAll(".carousel-slide");
    var dots = el.querySelectorAll(".carousel-dots span");
    slides[carouselIndex].classList.remove("active");
    if (dots[carouselIndex]) dots[carouselIndex].classList.remove("active");
    carouselIndex = (carouselIndex + 1) % GALLERY.length;
    slides[carouselIndex].classList.add("active");
    if (dots[carouselIndex]) dots[carouselIndex].classList.add("active");
  }, 3500); // slides every 3.5s
}

function renderHome() {
  var statsHtml = '' +
    '<div class="hero-stat"><div class="num">' + CATEGORIES.length + '</div><div class="label">Highway corridors</div></div>' +
    '<div class="hero-stat"><div class="num">' + PROJECTS.length + '</div><div class="label">Active ventures</div></div>' +
    '<div class="hero-stat"><div class="num">RERA</div><div class="label">Approved layouts</div></div>';

  var shieldIcon = '<svg class="hwy-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>';
  var routeHtml = CATEGORIES.map(function (c) {
    return '<div class="route-stop"><a href="#/category/' + c.slug + '">' + shieldIcon + ' ' + c.label + '</a></div>';
  }).join("");

  var featured = PROJECTS.slice(0, 5);
  var featuredHtml = featured.length
    ? featured.map(ventureRow).join("")
    : '<div class="empty-state">Ventures will appear here once the Projects sheet has entries.</div>';

  app.innerHTML = '' +
    '<section class="hero">' +
      '<div class="hero-inner">' +
        '<div class="hero-copy">' +
          '<h1>Own land on the road to Hyderabad\'s next <span class="accent">boomtowns</span></h1>' +
          '<p class="lede">RERA-approved open plots planted directly along national highway growth corridors — where connectivity arrives first, and land value follows.</p>' +
        '</div>' +
        '<div class="hero-right">' +
          '<div class="hero-stats">' + statsHtml + '</div>' +
          greetingHtml() +
        '</div>' +
      '</div>' +
    '</section>' +
    carouselHtml() +
    '<div class="route-nav">' + '<div class="route-inner">' + routeHtml + '</div></div>' +
    '<section class="highway-strip"><div class="highway-strip-inner">' +
      '<div class="hwy-point"><span class="hwy-num">01</span><h4>Highway-first connectivity</h4><p>Every venture sits directly on a national/state highway corridor — no last-mile guesswork.</p></div>' +
      '<div class="hwy-point"><span class="hwy-num">02</span><h4>Appreciation follows infrastructure</h4><p>Land along growth corridors historically outpaces interior plots as roads, industry and townships expand.</p></div>' +
      '<div class="hwy-point"><span class="hwy-num">03</span><h4>Clean title, RERA approved</h4><p>Every layout carries full approvals — the same legal clarity we stand behind on every venture.</p></div>' +
    '</div></section>' +
    '<section class="section">' +
      '<div class="section-head"><h2>Featured ventures</h2><p>A look across our current corridors</p></div>' +
      featuredHtml +
    '</section>';

  bindVentureClicks();
  startCarousel();
}

function renderCategory(slug) {
  var list = PROJECTS.filter(function (p) { return p.category === slug; });
  var html = list.length
    ? list.map(ventureRow).join("")
    : '<div class="empty-state">No ventures listed in ' + catLabel(slug) + ' yet.</div>';

  app.innerHTML = '' +
    '<section class="section">' +
      '<a href="#/" class="back-link">&larr; All corridors</a>' +
      '<div class="section-head"><h2>' + catLabel(slug) + '</h2><p>' + list.length + ' venture(s)</p></div>' +
      html +
    '</section>';

  bindVentureClicks();
}

function renderVenture(slug) {
  var p = PROJECTS.filter(function (x) { return x.slug === slug; })[0];
  if (!p) { app.innerHTML = '<div class="empty-state">Venture not found.</div>'; return; }

  var galleryHtml = p.photos.length
    ? '<div class="gallery">' + p.photos.map(function (u) { return '<img src="' + u + '" alt="' + p.name + '">'; }).join("") + '</div>'
    : "";

  var yid = youtubeId(p.video);
  var videoHtml = yid
    ? '<div class="video-embed"><iframe src="https://www.youtube.com/embed/' + yid + '" title="' + p.name + ' video" allowfullscreen></iframe></div>'
    : "";

  var specRows = [
    ["RERA no.", p.rera], ["LP no.", p.lp], ["Total acres", p.acres],
    ["Available plots", p.plots], ["Market price", p.price ? "Rs " + p.price + " / sq yd" : ""],
    ["Govt price", p.govtPrice ? "Rs " + p.govtPrice + " / sq yd" : ""]
  ].filter(function (r) { return r[1]; })
   .map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("");

  var mapsBtn = p.location ? '<a class="side-btn outline" target="_blank" href="' + p.location + '">View location</a>' : "";
  var brochureBtn = p.brochure ? '<a class="side-btn outline" target="_blank" href="' + p.brochure + '">Download brochure</a>' : "";

  app.innerHTML = '' +
    '<section class="detail-hero"><div class="detail-hero-inner">' +
      '<a href="#/category/' + p.category + '" class="back-link" style="color:var(--brass-light)">&larr; ' + catLabel(p.category) + '</a>' +
      '<div class="venture-cat">' + (p.categoryLabel || catLabel(p.category)) + '</div>' +
      '<h1>' + p.name + '</h1>' +
    '</div></section>' +
    '<section class="section">' +
      galleryHtml +
      '<div class="detail-grid">' +
        '<div>' +
          videoHtml +
          '<div class="detail-block"><h3>Venture details</h3><table class="spec-table">' + specRows + '</table></div>' +
        '</div>' +
        '<div class="side-panel">' +
          '<h3>Interested in ' + p.name + '?</h3>' +
          '<a class="side-btn" href="#" id="detail-enquire">Enquire About This Project</a>' +
          mapsBtn + brochureBtn +
        '</div>' +
      '</div>' +
    '</section>';

  var eb = document.getElementById("detail-enquire");
  if (eb) eb.addEventListener("click", function (e) { e.preventDefault(); openEnquiry(p.name); });

  updateWhatsappButton("Hi, I'm interested in " + p.name + ". Could you share more details?");
}

function bindVentureClicks() {
  document.querySelectorAll(".venture-row").forEach(function (el) {
    el.addEventListener("click", function () {
      location.hash = "#/venture/" + el.getAttribute("data-slug");
    });
  });
}

function renderAbout() {
  app.innerHTML = '' +
    '<section class="section">' +
      '<div class="static-page">' +
        '<h1>About Us</h1>' +
        '<p>realestate4u is a marketing and service oriented company. We undertake and promote projects that carry all required approvals, with no legal issues attached to the land — so our customers can invest with confidence.</p>' +
        '<p>We work across five growth corridors around Hyderabad, connecting buyers with RERA-approved open plot ventures, and staying with them through the entire process — from site visits to registration.</p>' +
        '<h2>What we stand for</h2>' +
        '<p>Transparency in documentation, clear pricing, and long-term support even after the sale — because for us, every plot sold is the start of a relationship, not the end of one.</p>' +
      '</div>' +
    '</section>';
}

function renderPrivacy() {
  app.innerHTML = '' +
    '<section class="section">' +
      '<div class="static-page">' +
        '<h1>Privacy Policy</h1>' +
        '<p>This policy explains how realestate4u collects and uses the information you share with us through this website.</p>' +
        '<h2>Information we collect</h2>' +
        '<p>When you submit an enquiry, we collect your name, phone number, email (if provided), and the venture you are interested in, so our team can respond to you.</p>' +
        '<h2>How we use it</h2>' +
        '<p>Your details are used only to contact you about the venture(s) you enquire about. We do not sell or share your information with unrelated third parties.</p>' +
        '<h2>Contact</h2>' +
        '<p>For any questions about your data, or to request it be removed, please reach out to us using the contact details shared on this site.</p>' +
      '</div>' +
    '</section>';
}

// ---------- router ----------
function route() {
  var hash = location.hash || "#/";
  var parts = hash.replace("#/", "").split("/").filter(Boolean);
  window.scrollTo(0, 0);
  stopCarousel();
  if (parts[0] === "category" && parts[1]) { renderCategory(parts[1]); updateWhatsappButton(); }
  else if (parts[0] === "venture" && parts[1]) renderVenture(parts[1]); // sets its own message
  else if (parts[0] === "about") { renderAbout(); updateWhatsappButton(); }
  else if (parts[0] === "privacy") { renderPrivacy(); updateWhatsappButton(); }
  else { renderHome(); updateWhatsappButton(); }
}
window.addEventListener("hashchange", route);

// ---------- WhatsApp floating button ----------
function updateWhatsappButton(message) {
  var msgText = message || "Hi, I'd like to know more about your open plot projects.";
  var href = WHATSAPP_NUMBER ? ("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msgText)) : "#";
  var headerBtn = document.getElementById("header-whatsapp");
  if (headerBtn && WHATSAPP_NUMBER) headerBtn.href = href;

  var el = document.getElementById("whatsapp-float");
  if (!el || !WHATSAPP_NUMBER) return;
  var msg = message || "Hi, I'm interested in your open plot projects. Could you share more details?";
  el.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
}

// ---------- enquiry modal ----------
var modal = document.getElementById("enquiry-modal");
var frame = document.getElementById("enquiry-frame");

function openEnquiry(ventureName) {
  if (!ENQUIRY_FORM_URL || ENQUIRY_FORM_URL.indexOf("PASTE_") === 0) {
    alert("Enquiry form link not configured yet.");
    return;
  }
  var url = ENQUIRY_FORM_URL;
  if (ventureName && ENQUIRY_VENTURE_FIELD) {
    url += (url.indexOf("?") === -1 ? "?" : "&") + ENQUIRY_VENTURE_FIELD + "=" + encodeURIComponent(ventureName);
  }
  frame.src = url;
  modal.classList.add("open");
}
document.getElementById("header-enquire").addEventListener("click", function (e) { e.preventDefault(); openEnquiry(""); });
document.getElementById("modal-close").addEventListener("click", function () { modal.classList.remove("open"); frame.src = ""; });
modal.addEventListener("click", function (e) { if (e.target === modal) { modal.classList.remove("open"); frame.src = ""; } });

// ---------- init ----------
document.getElementById("year").textContent = new Date().getFullYear();
var pendingLoads = 2;
function afterInitialLoad() {
  pendingLoads--;
  if (pendingLoads === 0) route();
}
loadProjects(afterInitialLoad);
loadGreeting(afterInitialLoad);
