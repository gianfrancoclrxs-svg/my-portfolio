const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const gallery = document.getElementById("gallery");
const title = document.getElementById("title");

let activeIndex = 0;
let activeExpandedCard = null;

/* =========================
   SIDEBAR BUILDER
========================= */
function renderSidebar() {
  sidebar.innerHTML = "";

  portfolioData.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "sidebar-item";

    if (index === activeIndex) el.classList.add("active");

    el.innerHTML = `<i class="fa-solid ${item.icon}"></i>`;
    el.addEventListener("click", () => setActive(index));

    sidebar.appendChild(el);
  });

  const spacer = document.createElement("div");
  spacer.style.flex = "1";
  sidebar.appendChild(spacer);

  if (window.initSocials) window.initSocials();
}

/* =========================
   SET ACTIVE CATEGORY
========================= */
function setActive(index) {
  activeIndex = index;
  const item = portfolioData[index];

  document.querySelectorAll(".sidebar-item").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  title.textContent = item.name;

  if (item.sections) {
    renderSectionsMasonry(item.sections);
  } else {
    renderGallery(item.items);
  }
}

/* =========================
   RENDER GALLERY
========================= */
function renderGallery(items) {
  gallery.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = `img-card ${item.type}`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${item.img}" loading="lazy" />
        </div>
        <div class="card-back">
          <div class="info">
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <a href="${item.link}" target="_blank" class="btn">
              ${item.type === "website" ? "Visit Website" : "View Project"}
            </a>
          </div>
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

/* =========================
   MASONRY HELPERS
========================= */
function getColumnCount() {
  const width = window.innerWidth;
  if (width < 500) return 1;
  if (width < 800) return 2;
  if (width < 1200) return 3;
  return 4;
}

function getShortestColumn(columns) {
  return columns.reduce((min, col) =>
    parseFloat(col.dataset.height) < parseFloat(min.dataset.height) ? col : min
  , columns[0]);
}

function createMasonryLayout(count, container) {
  const columns = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "masonry-column";
    col.dataset.height = "0";
    columns.push(col);
    container.appendChild(col);
  }
  return columns;
}

/* =========================
   CREATE MASONRY CARD
========================= */
function createMasonryCard(item) {
  const card = document.createElement("div");
  card.className = `img-card ${item.type || ""}`;

  let mediaHTML = "";

  if (item.type === "video") {
    // VIDEO: no flip, just a clickable thumbnail
    const thumb = item.thumb || (
  item.platform === "youtube"
    ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
    : `https://graph.facebook.com/${item.videoId}/picture?type=thumbnail`
);

    mediaHTML = `
      <div class="card-front video-card"
        data-platform="${item.platform}"
        data-id="${item.videoId}"
        data-url="${item.url || ''}">
        <img class="video-thumb" src="${thumb}" 
  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22480%22 height=%22270%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23222%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>▶</text></svg>'" />
        <div class="play-overlay">▶</div>
      </div>
    `;

    card.innerHTML = mediaHTML;

    // Attach click directly to this card element (no flip interference)
    card.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent outside-click-close from firing
      const vcEl = card.querySelector(".video-card");
      if (!vcEl || vcEl.dataset.playing === "true") return;
      vcEl.dataset.playing = "true";
      embedVideo(vcEl);
    });

    return card; // return early — no flip card wrapper needed
  }

  if (item.type === "ppt" || item.type === "printable") {
    mediaHTML = `
      <div class="card-front expandable"
        data-type="${item.type}"
        data-pages='${JSON.stringify(item.pages || [])}'>
        <img src="${item.cover}" loading="lazy" />
      </div>
    `;
  } else {
    mediaHTML = `
      <div class="card-front">
        <img src="${item.img || item.cover}" loading="lazy" />
      </div>
    `;
  }

  card.innerHTML = `
    <div class="card-inner">
      ${mediaHTML}
      <div class="card-back">
        <div class="info">
          <h3>${item.title}</h3>
          ${(item.type === "ppt" || item.type === "printable")
            ? `<span class="click-hint">Click to preview</span>` : ""}
          <p>${item.desc}</p>
          ${item.link
            ? `<a href="${item.link}" target="_blank" class="btn">
                ${item.type === "website" ? "Visit Website" : "View Project"}
               </a>`
            : ""}
        </div>
      </div>
    </div>
  `;

  // PPT / printable expand
  if (item.type === "ppt" || item.type === "printable") {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      e.stopPropagation();
      handleExpandClick(card, item);
    });
  }

  return card;
}

/* =========================
   EMBED VIDEO HELPER
========================= */
function embedVideo(vcEl) {
  const platform = vcEl.dataset.platform;
  const id = vcEl.dataset.id;
  const url = vcEl.dataset.url;

  if (platform === "youtube") {
    vcEl.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
        style="width:100%;aspect-ratio:16/9;display:block;"
      ></iframe>
    `;
  } else if (platform === "facebook") {
    // Use Facebook JS SDK embed — more reliable than plugins/video.php iframe
    const width = vcEl.offsetWidth || 500;

    vcEl.style.cssText = "width:100%;aspect-ratio:16/9;display:block;background:#000;";

    vcEl.innerHTML = `
      <div
        class="fb-video"
        data-href="${url}"
        data-width="${width}"
        data-autoplay="true"
        data-allowfullscreen="true"
        style="width:100%;"
      ></div>
    `;

    // If SDK already loaded, just parse the new element
    if (window.FB) {
      window.FB.XFBML.parse(vcEl);
    } else {
      // Load SDK once, then parse
      if (!document.getElementById("facebook-jssdk")) {
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // fb-root required by SDK
        if (!document.getElementById("fb-root")) {
          const fbRoot = document.createElement("div");
          fbRoot.id = "fb-root";
          document.body.prepend(fbRoot);
        }

        script.onload = () => {
          window.FB && window.FB.XFBML.parse(vcEl);
        };
      }
    }
  }
}

/* =========================
   PPT / PRINTABLE EXPAND
========================= */
function handleExpandClick(card, item) {
  const grid = card.parentElement;
  const isSame = activeExpandedCard === card;

  if (activeExpandedCard) {
    const oldGrid = activeExpandedCard.parentElement;
    oldGrid && oldGrid.querySelectorAll(".page-card").forEach(el => el.remove());
  }

  if (isSame) {
    activeExpandedCard = null;
    return;
  }

  activeExpandedCard = card;
  const insertIndex = Array.from(grid.children).indexOf(card);

  (item.pages || []).forEach((page, i) => {
    const pageCard = document.createElement("div");
    pageCard.className = "img-card page-card";
    pageCard.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${page}" loading="lazy" />
        </div>
      </div>
    `;
    grid.insertBefore(pageCard, grid.children[insertIndex + 1 + i]);
  });
}

/* =========================
   RENDER SECTIONS MASONRY
========================= */
function renderSectionsMasonry(sections) {
  gallery.innerHTML = "";

  sections.forEach(sec => {
    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "section-title";
    sectionTitle.textContent = sec.section || "";
    gallery.appendChild(sectionTitle);

    const coverItems = sec.items.filter(item => item.type === "cover");
    const normalItems = sec.items.filter(item => item.type !== "cover");

    if (coverItems.length > 0) {
      const coverGrid = document.createElement("div");
      coverGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${Math.min(coverItems.length, 2)}, 1fr);
        gap: 16px;
        width: 100%;
        margin-bottom: 16px;
      `;
      coverItems.forEach(item => coverGrid.appendChild(createMasonryCard(item)));
      gallery.appendChild(coverGrid);
    }

    if (normalItems.length > 0) {
      const sectionGrid = document.createElement("div");
      sectionGrid.className = "section-grid";

      const colCount = Math.min(getColumnCount(), normalItems.length);
      const columns = createMasonryLayout(colCount, sectionGrid);

      normalItems.forEach(item => {
        const card = createMasonryCard(item);
        const target = getShortestColumn(columns);
        target.appendChild(card);
        target.dataset.height = String(parseFloat(target.dataset.height) + 200);
      });

      gallery.appendChild(sectionGrid);
    }
  });
}

/* =========================
   OPEN / CLOSE UI
========================= */
function openUI(index = 0) {
  document.body.classList.add("sidebar-open");
  renderSidebar();
  setActive(index);
}

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    document.body.classList.remove("sidebar-open");
  }
});

/* =========================
   MENU CARD TRIGGERS
========================= */
document.querySelectorAll(".card").forEach((card, index) => {
  card.addEventListener("click", () => openUI(index));
});

/* =========================
   OUTSIDE CLICK CLOSE
========================= */
document.addEventListener("click", (e) => {
  const isCard = e.target.closest(".img-card");
  const isSidebar = e.target.closest(".sidebar");
  const isMenu = e.target.closest(".card");

  if (
    !isCard &&
    !isSidebar &&
    !isMenu &&
    document.body.classList.contains("sidebar-open")
  ) {
    document.body.classList.remove("sidebar-open");
  }
});

/* =========================
   RESIZE HANDLER
========================= */
window.addEventListener("resize", () => {
  const item = portfolioData[activeIndex];
  if (!item || !item.sections) return;
  renderSectionsMasonry(item.sections);
});

/* =========================
   ROLE TYPING ANIMATION
========================= */
const text = "Creative Specialist • Frontend Developer • Visual Designer • Filmmaker";
const typingEl = document.getElementById("typing");

let i = 0;
let forward = true;

function typeLoop() {
  if (!typingEl) return;

  if (forward) {
    typingEl.textContent = text.substring(0, i + 1);
    i++;
    if (i === text.length) {
      forward = false;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typingEl.textContent = text.substring(0, i - 1);
    i--;
    if (i === 0) forward = true;
  }

  setTimeout(typeLoop, forward ? 70 : 30);
}

typeLoop();