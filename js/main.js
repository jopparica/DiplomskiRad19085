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

  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const jeOtvoren = menu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", jeOtvoren ? "true" : "false");
      menu.setAttribute("aria-hidden", jeOtvoren ? "false" : "true");
    });
  }

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

// ===================== KATALOG IGRAČAKA I MODAL NARUČIVANJA =====================
document.addEventListener("DOMContentLoaded", () => {

  const catalogGrid = document.getElementById("catalog-grid");
  if (!catalogGrid) return;

  const noResultsMsg = document.getElementById("no-results");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Elementi Modala
  const modal = document.getElementById("toy-modal");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-toy-title");
  const modalImage = document.getElementById("modal-toy-image");
  const modalDesc = document.getElementById("modal-toy-desc");
  const modalPrice = document.getElementById("modal-toy-price");
  const orderForm = document.getElementById("modal-order-form");
  const orderSuccess = document.getElementById("order-success");

  const nazivTipa = {
    table: "Senzorno-motorne table",
    taktilne: "Taktilne društvene igre",
    grafomotorika: "Grafomotorika i jezik",
    kartice: "Emocije i komunikacija",
    balans: "Balans i krupna motorika"
  };

  const igracke = [
    // 1. SENZORNO-MOTORNE TABLE I PANELI
    {
      id: "tabla-01",
      naziv: "Montessori interaktivna tabla 01",
      opis: "Interaktivna tabla sa raznovrsnim bravicama, zupčanicima i elementima za svakodnevne veštine i finu motoriku.",
      slika: "slike/tabla01.jpg",
      cena: "7.400 RSD",
      tipovi: ["table"]
    },
    {
      id: "tabla-farma",
      naziv: "Mini interaktivna tabla Farma",
      opis: "Prilagođena kompaktna tabla sa taktilnim elementima koja podstiče samostalnost i koordinaciju oko-ruka.",
      slika: "slike/tabla02.jpg",
      cena: "1.950 RSD",
      tipovi: ["table"]
    },
    {
      id: "tabla-priroda",
      naziv: "Prirodni Svet interaktivna tabla",
      opis: "Velika senzorna tabla namenjena za vežbanje fine motorike, strpljenja i koncentracije.",
      slika: "slike/tabla03.jpg",
      cena: "7.100 RSD",
      tipovi: ["table"]
    },
    { 
      id: "tabla-jezik",
      naziv: "Interaktivna tabla Jezik",
      opis: "Interaktivna tabla Jezik sadrži 3 edukativna panela – azbuku, godišnja doba i prostornu orijentaciju. Idealan materijal za učenje kroz igru i pokret.",
      slika: "slike/tabla04.jpg",
      cena: "8.850 RSD",
      tipovi: ["table"]
    },
      { 
      id: "tabla-nizalica",
      naziv: "Nizalica cipela za interaktivne table",
      opis: "Didaktička nizalica u obliku cipele za vežbanje vezivanja pertli i mašne. Pomaže deci da razviju finu motoriku, strpljenje i samostalnost.",
      slika: "slike/tabla05.jpg",
      cena: "1.820 RSD",
      tipovi: ["table"]
    },
    { 
      id: "prekidač-utikac",
      naziv: "Prekidač-Utikač za interaktivne table",
      opis: "Prekidač-Utikač za interaktivne table, koji pomaze pri ucenju vezano za osnove o struji i vezbanje fine motorike.",
      slika: "slike/tabla06.jpg",
      cena: "1.600 RSD",
      tipovi: ["table"]
    },
    // 2. TAKTILNE I VISOKOKONTRASTNE DRUŠTVENE IGRE
    {
      id: "taktilni-domino",
      naziv: "Taktilni Domino - Materijali",
      opis: "Taktilni Domino je društvena igra sa 28 drvenih pločica različitih taktilnih materijala za razvoj čula dodira, koordinacije i pažnje kod dece od 3,5+ godina.",
      slika: "slike/takt01.jpg",
      cena: "2.850 RSD",
      tipovi: ["taktilne"]
    },
    {
      id: "iks-oks",
      naziv: "IX-OX Drvena društvena igra (Iks-Oks)",
      opis: "Taktilno izražena verzija klasične igre sa udubljenjima, taktilno uočljivim figurama i visokim kontrastom.",
      slika: "slike/takt02.jpg",
      cena: "1.550 RSD",
      tipovi: ["taktilne"]
    },
    {
      id: "domino-oblici",
      naziv: "Domino Geometrijski Oblici",
      opis: "Velike drvene domine sa reljefnim oblicima koji omogućavaju prepoznavanje dodirom i vidom.",
      slika: "slike/takt03.jpg",
      cena: "2.850 RSD",
      tipovi: ["taktilne"]
    },
    {
      id: "taktilni-kvadrati",
      naziv: "Taktilni kvadrati 5 pari",
      opis: "Set od 10 taktilnih kvadrata sa različitim teksturama za razvoj čula dodira kod dece. Namenjeno za igru prstima i stopalima, idealno za senzornu stimulaciju od 3+ godine.",
      slika: "slike/takt04.jpg",
      cena: "5.950 RSD",
      tipovi: ["taktilne"]
    },

    // 3. LOGOPEDSKI I GRAFOMOTORIČKI ŠABLONI
    {
      id: "vodilica-s",
      naziv: "Grafomotorička vodilica S",
      opis: "Didaktička tabla za 'prohodavanje ruku' koja priprema šaku za pisanje i stimulaciju mozga i govora.",
      slika: "slike/vod1.jpg",
      cena: "3.900 RSD",
      tipovi: ["grafomotorika"]
    },
    {
      id: "krokodil-vodilica",
      naziv: "Krokodil grafomotorička vodilica",
      opis: "Zabavna drvena vodilica sa žlebovima koja pomaže razvoju kontrole pokreta šake i prstiju.",
      slika: "slike/vod2.jpg",
      cena: "2.330 RSD",
      tipovi: ["grafomotorika"]
    },
    {
      id: "prati-linije",
      naziv: "Prati linije - Pišemo slova",
      opis: "Drveni šablon sa drvenom olovkom i stazicama za razvoj grafomotoričkih veština i fonološke svesti.",
      slika: "slike/vod3.jpg",
      cena: "850 RSD",
      tipovi: ["grafomotorika"]
    },
    {
      id: "godisnja-doba",
      naziv: "4 Godišnja doba taktilna motorička tabla",
      opis: "Multisenzorna tabla sa vodilicama, rolerkosterom i taktilnim plohama. Podstiče razvoj motorike, koordinacije i čulne percepcije. Namenjena deci 3+.",
      slika: "slike/vod4.jpg",
      cena: "18.050 RSD",
      tipovi: ["grafomotorika"]
    },
    // 4. EMOCIONALNE I KOMUNIKACIJSKE KARTICE
    {
      id: "asocijativne-kartice",
      naziv: "Slovarica -Latinica sa asocijacijama",
      opis: "Slova za učenje kroz igru, prirodni materijal, glatka obrada i idealna veličina za male ruke. Pomažu deci da prepoznaju slova kroz asocijacije i razvijaju fine motoričke veštine.",
      slika: "slike/as1.jpg",
      cena: "950 RSD",
      tipovi: ["kartice"]
    },
    {
      id: "sporet-play",
      naziv: "Šporet Play terapija -Predmeti u kući",
      opis: "Šporet kao deo seta „Predmeti u kući“ za play terapiju nudi deci priliku da kroz igru istraže sve aspekte domaćinstva, od uloga u porodici do razvijanja odgovornosti prema prostoru i emocijama.",
      slika: "slike/as2.jpg",
      cena: "4.000 RSD",
      tipovi: ["kartice"]
    },
    {
      id: "kartice-brojevi",
      naziv: "Plastične male karte sa brojevima 1-3000",
      opis: "Plastične brojevne karte 1–3000 za učenje dekadnog sistema. Male dimenzije, idealne za rad sa brojevima i kombinovanje cifara.",
      slika: "slike/as3.jpg",
      cena: "2.600 RSD",
      tipovi: ["kartice"]
    },
    {
      id: "play03",
      naziv: "Play terapija set delova 03 – figure za simboličku i terapijsku igru",
      opis: "Play terapija set delova 03 sadrži raznovrsne figure za simboličku igru, emocionalno izražavanje i terapijski rad sa decom.",
      slika: "slike/as4.jpg",
      cena: "8.000 RSD",
      tipovi: ["kartice"]
    },

    // 5. BALANSERI I KRUPNO-MOTORNE IGRAČKE
    {
      id: "balans-polukugla",
      naziv: "Balans polukugla",
      opis: "Zabavna i edukativna igra za dvoje ili više igrača koja razvija ravnotežu, logiku i prepoznavanje boja i oblika kroz slaganje na balans polukuglu.",
      slika: "slike/b1.jpg",
      cena: "1.050 RSD",
      tipovi: ["balans"]
    },
    {
      id: "balans-mesec",
      naziv: "Balans Mesec poligon",
      opis: "Drveni mesec za slaganje i balansiranje – igra koja razvija preciznost, strpljenje i motoriku kroz zabavno slaganje obojenih elemenata.",
      slika: "slike/b2.jpg",
      cena: "1.320 RSD",
      tipovi: ["balans"]
    },
    {
      id: "kaktus-balans",
      naziv: "Kaktus za balansiranje",
      opis: "Igračka za finu i krupnu motoriku gde deca balansiraju elemente i održavaju stabilnost.",
      slika: "slike/b3.jpg",
      cena: "2.440 RSD",
      tipovi: ["balans"]
    },
    {
      id: "hodalica",
      naziv: "Hodalica polukugla – set od 4 komada za balans i koordinaciju",
      opis: "Set drvenih hodalica sa polukuglama i konopcima za razvoj ravnoteže, koordinacije i timske igre kod dece od 3 godine naviše.",
      slika: "slike/b4.jpg",
      cena: "2.900 RSD",
      tipovi: ["balans"]
    },
    {
      id: "penjalica",
      naziv: "Montesori drvena penjalica za decu",
      opis: "Montessori Pikler penjalica sa rampom za razvoj ravnoteže, koordinacije i samostalnog kretanja kod dece od 6 meseci do 5 godina.",
      slika: "slike/b5.jpg",
      cena: "23.400 RSD",
      tipovi: ["balans"]
    }
  ];

  let trenutnoIzabranaIgracka = null;

  function generisiKarticu(igracka) {
    const tagovi = igracka.tipovi
      .map(tip => `<span class="toy-tag">${nazivTipa[tip]}</span>`)
      .join("");

    return `
      <article class="toy-card">
        <div class="toy-card-image">
          <img src="${igracka.slika}" alt="${igracka.naziv}" class="toy-card-img" onerror="this.onerror=null; this.src='slike/tedi.png';">
        </div>
        <div class="toy-card-body">
          <h3>${igracka.naziv}</h3>
          <p>${igracka.opis}</p>
          <div class="toy-tags">${tagovi}</div>
          <div class="toy-card-actions">
            <button class="btn btn-primary btn-order" data-id="${igracka.id}">Poruči / Detaljnije</button>
          </div>
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
      poveziDugmiceZaPorucivanje();
    }
  }

  function postaviAktivnoDugme(filter) {
    filterButtons.forEach(btn => {
      const jeAktivno = btn.dataset.filter === filter;
      btn.classList.toggle("active", jeAktivno);
    });
  }

  // ===================== LOGIKA MODAL PROZORA =====================

  function otvoriModal(igracka) {
    trenutnoIzabranaIgracka = igracka;

    modalTitle.textContent = igracka.naziv;
    modalImage.src = igracka.slika;
    modalImage.alt = igracka.naziv;
    modalDesc.textContent = igracka.opis;
    modalPrice.textContent = igracka.cena;

    if (orderSuccess) orderSuccess.hidden = true;
    if (orderForm) orderForm.reset();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function zatvoriModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function poveziDugmiceZaPorucivanje() {
    const btnOrderList = document.querySelectorAll(".btn-order");
    btnOrderList.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const izabranaIgracka = igracke.find(item => item.id === id);
        if (izabranaIgracka) {
          otvoriModal(izabranaIgracka);
        }
      });
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", zatvoriModal);
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      zatvoriModal();
    }
  });

  // SLANJE NARUDŽBINE NA MEJL
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const imePrezime = document.getElementById("order-fullname").value.trim();
      const email = document.getElementById("order-email").value.trim();
      const telefon = document.getElementById("order-phone").value.trim();
      const adresa = document.getElementById("order-address").value.trim();

      const primalac = "info@nolimits.rs";
      const naslov = encodeURIComponent(`[Narudžbina] ${trenutnoIzabranaIgracka ? trenutnoIzabranaIgracka.naziv : "Igračka"}`);
      
      const telo = encodeURIComponent(
        `Naručena igračka: ${trenutnoIzabranaIgracka ? trenutnoIzabranaIgracka.naziv : ""}\n` +
        `Cena: ${trenutnoIzabranaIgracka ? trenutnoIzabranaIgracka.cena : ""}\n\n` +
        `PODACI O KUPCU:\n` +
        `Ime i prezime: ${imePrezime}\n` +
        `Email: ${email}\n` +
        `Telefon: ${telefon}\n` +
        `Adresa dostave: ${adresa}\n`
      );

      window.location.href = `mailto:${primalac}?subject=${naslov}&body=${telo}`;

      if (orderSuccess) orderSuccess.hidden = false;
      orderForm.reset();
    });
  }

  // Filteri
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
  const dozvoljeniFilteri = ["table", "taktilne", "grafomotorika", "kartice", "balans"];

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
    if (el) el.textContent = poruka;
  }

  function ocistiGreske() {
    ["error-ime", "error-email", "error-tema", "error-poruka"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  }

  function jeEmailValidan(vrednost) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vrednost);
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    ocistiGreske();
    if (formSuccess) formSuccess.hidden = true;

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

    const primalac = "info@nolimits.rs";
    const naslov = encodeURIComponent(`[NoLimits] ${poljeTema.value}`);
    const telo = encodeURIComponent(
      `Ime i prezime: ${poljeIme.value.trim()}\n` +
      `Email: ${poljeEmail.value.trim()}\n\n` +
      `Poruka:\n${poljePoruka.value.trim()}`
    );

    window.location.href = `mailto:${primalac}?subject=${naslov}&body=${telo}`;

    if (formSuccess) formSuccess.hidden = false;
    contactForm.reset();
  });
});

/* ===================== SLAJDER KATEGORIJA (MAIN.JS) ===================== */

document.addEventListener('click', function (e) {
  var btnNext = e.target.closest('#btnNextCategory');
  var btnPrev = e.target.closest('#btnPrevCategory');

  if (!btnNext && !btnPrev) return;

  e.preventDefault();

  var track = document.getElementById('categoriesTrack');
  if (!track) return;

  var slideWidth = track.clientWidth;

  if (btnNext) {
    // Ako stigne do kraja, vraća kružno na prvi
    if (track.scrollLeft + slideWidth >= track.scrollWidth - 15) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
  } else if (btnPrev) {
    // Ako je na početku, prelazi na poslednji
    if (track.scrollLeft <= 10) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    }
  }
});
