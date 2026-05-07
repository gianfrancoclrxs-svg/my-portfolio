/* =========================
   SOCIALS MODULE (JS ONLY)
========================= */

function injectSocialStyles() {
  if (document.getElementById("socials-style")) return;

  const style = document.createElement("style");
  style.id = "socials-style";

  style.innerHTML = `
    .socials {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  list-style: none;
  padding-bottom: 20px;
  margin: 0;
}

    .icon-content {
      position: relative;
    }

    .icon-content a {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      color: #333;
      position: relative;
      overflow: hidden;
      transition: 0.3s ease;
      text-decoration: none;
    }

    .icon-content a i {
      font-size: 18px;
      z-index: 2;
    }

    .icon-content a .filled {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0;
      transition: 0.3s ease;
      z-index: 1;
    }

    .icon-content a:hover .filled {
      height: 100%;
    }

    .icon-content a:hover {
      color: white;
    }

    /* TOOLTIP RIGHT SIDE */
    .icon-content .tooltip {
      position: absolute;
      left: 65px;
      top: 50%;
      transform: translateY(-50%);
      color: #fff;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      opacity: 0;
      transition: 0.3s ease;
      white-space: nowrap;
      pointer-events: none;
    }

/* TOOLTIP COLORS MATCH SOCIAL BRAND */

/* Gmail */
.icon-content a[data-social="gmail"] ~ .tooltip {
  background: #ea4335;
}

/* Viber */
.icon-content a[data-social="viber"] ~ .tooltip {
  background: #7360f2;
}

/* Instagram */
.icon-content a[data-social="instagram"] ~ .tooltip {
  background: linear-gradient(
    45deg,
    #405de6,#5b51db,#b33ab4,#c135b4,#e1306c,#fd1f1f
  );
}

/* GitHub */
.icon-content a[data-social="github"] ~ .tooltip {
  background: #24262a;
}

    .icon-content:hover .tooltip {
      opacity: 1;
      transform: translateY(-50%) translateX(5px);
    }

    /* COLORS */
    .icon-content a[data-social="gmail"] .filled {
      background: #ea4335;
    }

    .icon-content a[data-social="viber"] .filled {
      background: #7360f2;
    }

    .icon-content a[data-social="instagram"] .filled {
      background: linear-gradient(
        45deg,
        #405de6,#5b51db,#b33ab4,#c135b4,#e1306c,#fd1f1f
      );
    }

    .icon-content a[data-social="github"] .filled {
      background: #24262a;
    }

    .socials .icon-content a {
    width: 42px;
    height: 42px;
    }

    .socials .icon-content a i {
    font-size: 16px;
    }
  `;

  document.head.appendChild(style);
}

/* =========================
   BUILD SOCIALS HTML
========================= */
function buildSocials() {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) return;

  /* remove old socials (prevents duplication) */
  const old = document.querySelector(".socials");
  if (old) old.remove();

  const ul = document.createElement("ul");
  ul.className = "socials";

  ul.innerHTML = `
    <li class="icon-content">
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=gianfranco.clrxs@gmail.com" data-social="gmail" target="_blank">
  <div class="filled"></div>
  <i class="fa-solid fa-envelope"></i>
</a>
      <div class="tooltip">Gmail</div>
    </li>

    <li class="icon-content">
      <a href="viber://chat?number=+639949941464" data-social="viber">
        <div class="filled"></div>
        <i class="fa-brands fa-viber"></i>
      </a>
      <div class="tooltip">Viber</div>
    </li>

    <li class="icon-content">
      <a href="https://www.instagram.com/gianxxsz/" data-social="instagram">
        <div class="filled"></div>
        <i class="fa-brands fa-instagram"></i>
      </a>
      <div class="tooltip">Instagram</div>
    </li>

    <li class="icon-content">
      <a href="https://github.com/gianfrancoclrxs-svg" data-social="github">
        <div class="filled"></div>
        <i class="fa-brands fa-github"></i>
      </a>
      <div class="tooltip">GitHub</div>
    </li>
  `;

  sidebar.appendChild(ul);
}

/* =========================
   INIT
   (IMPORTANT: wait for sidebar render)
========================= */
function initSocials() {
  injectSocialStyles();

  // small delay to ensure sidebar exists after renderSidebar()
  setTimeout(() => {
    buildSocials();
  }, 50);
}

/* expose globally */
window.initSocials = initSocials;