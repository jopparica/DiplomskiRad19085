// ===================== MENI ZA PRISTUPAČNOST =====================
document.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.getElementById("accessibility-toggle");
  const menu = document.getElementById("accessibility-menu");
  const body = document.body;

  const btnFontIncrease = document.getElementById("btn-font-increase");
  const btnFontDecrease = document.getElementById("btn-font-decrease");
  const btnHighContrast = document.getElementById("btn-high-contrast");
  const btnDyslexiaFont = document.getElementById("btn-dyslexia-font");
  const btnHighlightLinks = document.getElementById("btn-highlight-links");
  const btnReset = document.getElementById("btn-reset-accessibility");

  const MIN_FONT_SIZE = 80;
  const MAX_FONT_SIZE = 150;
  const FONT_STEP = 10;

  // ===================== POMOĆNE FUNKCIJE =====================

  function ucitajPodesavanja() {
    const sacuvanaVelicina = localStorage.getItem("fontSize");
    const visokiKontrast = localStorage.getItem("highContrast") === "true";
    const fontDisleksija = localStorage.getItem("dyslexiaFont") === "true";
    const isticanjeLinkova = localStorage.getItem("highlightLinks") === "true";

    if (sacuvanaVelicina) {
      document.documentElement.style.fontSize = sacuvanaVelicina + "%";
    }

    if (visokiKontrast) body.classList.add("high-contrast");
    if (fontDisleksija) body.classList.add("dyslexia-font");
    if (isticanjeLinkova) body.classList.add("highlight-links");
  }

  function trenutnaVelicinaFonta() {
    const stil = document.documentElement.style.fontSize;
    if (!stil) return 100;
    return parseInt(stil.replace("%", ""), 10);
  }

  // ===================== EVENT LISTENERI ZA MENI =====================

  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const jeOtvoren = menu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", jeOtvoren ? "true" : "false");
      menu.setAttribute("aria-hidden", jeOtvoren ? "false" : "true");
    });
  }

  // Zatvaranje menija klikom van njega
  document.addEventListener("click", (e) => {
    if (
      menu &&
      menu.classList.contains("open") &&
      !menu.contains(e.target) &&
      toggleBtn &&
      !toggleBtn.contains(e.target)
    ) {
      menu.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    }
  });

  // ===================== AKCIJE UNUTAR MENIJA =====================

  if (btnFontIncrease) {
    btnFontIncrease.addEventListener("click", () => {
      const nova = Math.min(trenutnaVelicinaFonta() + FONT_STEP, MAX_FONT_SIZE);
      document.documentElement.style.fontSize = nova + "%";
      localStorage.setItem("fontSize", nova);
    });
  }

  if (btnFontDecrease) {
    btnFontDecrease.addEventListener("click", () => {
      const nova = Math.max(trenutnaVelicinaFonta() - FONT_STEP, MIN_FONT_SIZE);
      document.documentElement.style.fontSize = nova + "%";
      localStorage.setItem("fontSize", nova);
    });
  }

  if (btnHighContrast) {
    btnHighContrast.addEventListener("click", () => {
      const aktivno = body.classList.toggle("high-contrast");
      localStorage.setItem("highContrast", aktivno);
    });
  }

  if (btnDyslexiaFont) {
    btnDyslexiaFont.addEventListener("click", () => {
      const aktivno = body.classList.toggle("dyslexia-font");
      localStorage.setItem("dyslexiaFont", aktivno);
    });
  }

  if (btnHighlightLinks) {
    btnHighlightLinks.addEventListener("click", () => {
      const aktivno = body.classList.toggle("highlight-links");
      localStorage.setItem("highlightLinks", aktivno);
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      body.classList.remove("high-contrast", "dyslexia-font", "highlight-links");
      document.documentElement.style.fontSize = "100%";

      localStorage.removeItem("fontSize");
      localStorage.removeItem("highContrast");
      localStorage.removeItem("dyslexiaFont");
      localStorage.removeItem("highlightLinks");
    });
  }

  ucitajPodesavanja();

});

// ===================== KATALOG IGRAČAKA =====================
document.addEventListener("DOMContentLoaded", () => {

  const catalogGrid = document.getElementById("catalog-grid");
  if (!catalogGrid) return;

  const noResultsMsg = document.getElementById("no-results");
  const filterButtons = document.querySelectorAll(".filter-btn");

  const igracke = [
    {
      naziv: "Senzorna lopta sa zvukom",
      opis: "Meka lopta koja proizvodi zvuk pri dodiru, pomaže u orijentaciji dece sa oštećenjem vida.",
      ikonica: "🔊",
      tipovi: ["vid"]
    },
    {
      naziv: "Tabla sa teksturama",
      opis: "Drvena tabla sa različitim površinama za razvoj taktilnih čula.",
      ikonica: "🧩",
      tipovi: ["vid", "autizam"]
    },
    {
      naziv: "Veliki dugmići za uzročno-posledične igre",
      opis: "Igračka sa krupnim, lako pritisnim dugmićima prilagođena deci sa motoričkim smetnjama.",
      ikonica: "🔴",
      tipovi: ["motorika"]
    },
    {
      naziv: "Kocke za lako hvatanje",
      opis: "Kocke sa posebnim ručkama za decu koja imaju otežanu finu motoriku.",
      ikonica: "🧱",
      tipovi: ["motorika"]
    },
    {
      naziv: "Fidget senzorna pločica",
      opis: "Pločica sa različitim pokretnim elementima za smirivanje i fokus.",
      ikonica: "🌀",
      tipovi: ["autizam", "motorika"]
    },
    {
      naziv: "Vizuelni raspored dana",
      opis: "Magnetna tabla sa slikama koja pomaže detetu da prati dnevnu rutinu.",
      ikonica: "🗓️",
      tipovi: ["autizam"]
    },
    {
      naziv: "Zvučna kutija oblika",
      opis: "Kutija sa otvorima koja daje zvučni signal kad se ubaci pravi oblik - pomaže orijentaciji bez oslanjanja na vid.",
      ikonica: "🔷",
      tipovi: ["vid"]
    },
    {
      naziv: "Meka lopta za stiskanje",
      opis: "Antistres loptica velike površine, laka za hvatanje i stiskanje.",
      ikonica: "⚪",
      tipovi: ["motorika", "autizam"]
    },
    {
      naziv: "Brajeva slovna kocka",
      opis: "Kocke sa Brajevim pismom i reljefnim slovima za rano učenje.",
      ikonica: "🔤",
      tipovi: ["vid"]
    }
  ];

  const nazivTipa = {
    vid: "Oštećenje vida",
    motorika: "Motoričke smetnje",
    autizam: "Spektar autizma"
  };

  function generisiKarticu(igracka) {
    const tagovi = igracka.tipovi
      .map(tip => `<span class="toy-tag">${nazivTipa[tip]}</span>`)
      .join("");

    return `
      <article class="toy-card">
        <div class="toy-card-image" aria-hidden="true">${igracka.ikonica}</div>
        <div class="toy-card-body">
          <h3>${igracka.naziv}</h3>
          <p>${igracka.opis}</p>
          <div class="toy-tags">${tagovi}</div>
        </div>
      </article>
    `;
  }

  function prikaziIgracke(filter) {
    const filtrirane = filter === "sve"
      ? igracke
      : igracke.filter(igracka => igracka.tipovi.includes(filter));

    if (filtrirane.length === 0) {
      catalogGrid.innerHTML = "";
      noResultsMsg.hidden = false;
    } else {
      noResultsMsg.hidden = true;
      catalogGrid.innerHTML = filtrirane.map(generisiKarticu).join("");
    }
  }

  function postaviAktivnoDugme(filter) {
    filterButtons.forEach(btn => {
      const jeAktivno = btn.dataset.filter === filter;
      btn.classList.toggle("active", jeAktivno);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      postaviAktivnoDugme(filter);
      prikaziIgracke(filter);

      const noviUrl = filter === "sve"
        ? window.location.pathname
        : `${window.location.pathname}?tip=${filter}`;
      window.history.replaceState({}, "", noviUrl);
    });
  });

  const urlParametri = new URLSearchParams(window.location.search);
  const pocetniFilter = urlParametri.get("tip");
  const dozvoljeniFilteri = ["vid", "motorika", "autizam"];

  const aktivniFilter = dozvoljeniFilteri.includes(pocetniFilter) ? pocetniFilter : "sve";

  postaviAktivnoDugme(aktivniFilter);
  prikaziIgracke(aktivniFilter);

});

// ===================== KONTAKT FORMA =====================
document.addEventListener("DOMContentLoaded", () => {

  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  const poljeIme = document.getElementById("ime");
  const poljeEmail = document.getElementById("email");
  const poljeTema = document.getElementById("tema");
  const poljePoruka = document.getElementById("poruka");
  const formSuccess = document.getElementById("form-success");

  function prikaziGresku(id, poruka) {
    const el = document.getElementById(id);
    el.textContent = poruka;
  }

  function ocistiGreske() {
    ["error-ime", "error-email", "error-tema", "error-poruka"].forEach(id => {
      document.getElementById(id).textContent = "";
    });
  }

  function jeEmailValidan(vrednost) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vrednost);
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    ocistiGreske();
    formSuccess.hidden = true;

    let ispravno = true;

    if (poljeIme.value.trim().length < 2) {
      prikaziGresku("error-ime", "Unesite validno ime i prezime.");
      ispravno = false;
    }

    if (!jeEmailValidan(poljeEmail.value.trim())) {
      prikaziGresku("error-email", "Unesite validnu email adresu.");
      ispravno = false;
    }

    if (!poljeTema.value) {
      prikaziGresku("error-tema", "Izaberite temu poruke.");
      ispravno = false;
    }

    if (poljePoruka.value.trim().length < 10) {
      prikaziGresku("error-poruka", "Poruka mora imati najmanje 10 karaktera.");
      ispravno = false;
    }

    if (!ispravno) return;

    const primalac = "info@igrasvet.rs";
    const naslov = encodeURIComponent(`[IgraSvet] ${poljeTema.value}`);
    const telo = encodeURIComponent(
      `Ime i prezime: ${poljeIme.value.trim()}\n` +
      `Email: ${poljeEmail.value.trim()}\n\n` +
      `Poruka:\n${poljePoruka.value.trim()}`
    );

    window.location.href = `mailto:${primalac}?subject=${naslov}&body=${telo}`;

    formSuccess.hidden = false;
    contactForm.reset();
  });

});