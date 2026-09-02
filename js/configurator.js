// ===================== KONFIGURATOR IGRAČAKA (Konva.js) =====================
// Ova logika se izvršava samo na configurator.html (proverava postojanje #konva-container)

document.addEventListener("DOMContentLoaded", () => {

  const containerEl = document.getElementById("konva-container");
  if (!containerEl) return; // Nismo na configurator.html - ne radi ništa dalje

  // ===================== POSTAVKA STAGE-A I SLOJA =====================

  const sirinaKontejnera = containerEl.clientWidth;
  const visinaKontejnera = containerEl.clientHeight;

  const stage = new Konva.Stage({
    container: "konva-container",
    width: sirinaKontejnera,
    height: visinaKontejnera
  });

  const sloj = new Konva.Layer();
  stage.add(sloj);

  let izabraniElement = null; // trenutno selektovan element na canvasu
  let brojacElemenata = 0; // koristi se za blago pomeranje pozicije svakog novog elementa

  // ===================== OSNOVNA IGRAČKA (BAZA) =====================
  // Ovo je "telo" igračke koje se ne može obrisati - predstavlja osnovu na koju
  // korisnik dodaje prilagodbe (dugmiće, teksture, zvučne oznake, ručke).

  function nacrtajBazu() {
    const centarX = stage.width() / 2;
    const centarY = stage.height() / 2;

    const bazaIgracke = new Konva.Circle({
      x: centarX,
      y: centarY,
      radius: 110,
      fill: "#a0d8ef",
      stroke: "#2b6cb0",
      strokeWidth: 4,
      name: "baza-igracke"
    });

    const natpisBaze = new Konva.Text({
      x: centarX - 70,
      y: centarY - 10,
      width: 140,
      text: "Osnovna igračka",
      fontSize: 14,
      fontFamily: "Segoe UI, sans-serif",
      fill: "#1a4971",
      align: "center",
      listening: false // natpis ne reaguje na klik/drag
    });

    sloj.add(bazaIgracke);
    sloj.add(natpisBaze);
    sloj.draw();
  }

  // ===================== KREIRANJE NOVOG ELEMENTA =====================
  // tip: "krug" | "tekstura" | "zvuk" | "rucka"

  function kreirajElement(tip) {
    brojacElemenata++;

    // Blago pomeranje svakog novog elementa da se ne poklapaju tačno jedan preko drugog
    const pomerajX = (brojacElemenata % 5) * 18;
    const pomerajY = Math.floor(brojacElemenata / 5) * 18;

    const pocetnaX = 90 + pomerajX;
    const pocetnaY = 90 + pomerajY;

    let noviObjekat;

    switch (tip) {
      case "krug":
        noviObjekat = new Konva.Circle({
          x: pocetnaX,
          y: pocetnaY,
          radius: 22,
          fill: "#2b6cb0",
          stroke: "#1a4971",
          strokeWidth: 2,
          draggable: true
        });
        break;

      case "tekstura":
        noviObjekat = new Konva.Rect({
          x: pocetnaX - 20,
          y: pocetnaY - 20,
          width: 40,
          height: 40,
          fill: "#f6ad55",
          stroke: "#c05621",
          strokeWidth: 2,
          cornerRadius: 6,
          draggable: true
        });
        break;

      case "zvuk":
        noviObjekat = new Konva.Star({
          x: pocetnaX,
          y: pocetnaY,
          numPoints: 5,
          innerRadius: 12,
          outerRadius: 24,
          fill: "#ecc94b",
          stroke: "#b7791f",
          strokeWidth: 2,
          draggable: true
        });
        break;

      case "rucka":
        noviObjekat = new Konva.Rect({
          x: pocetnaX - 30,
          y: pocetnaY - 12,
          width: 60,
          height: 24,
          fill: "#68d391",
          stroke: "#276749",
          strokeWidth: 2,
          cornerRadius: 12,
          draggable: true
        });
        break;

      default:
        return;
    }

    noviObjekat.name("dodatni-element");

    // Klik na element ga selektuje
    noviObjekat.on("click tap", (e) => {
      e.cancelBubble = true; // sprečava da klik "propadne" do stage-a i odmah ga deselektuje
      selektujElement(noviObjekat);
    });

    sloj.add(noviObjekat);
    sloj.draw();

    // Novododati element odmah postaje selektovan radi jasne povratne informacije
    selektujElement(noviObjekat);
  }

  // ===================== SELEKCIJA ELEMENATA =====================

  function selektujElement(objekat) {
    ponistiSelekciju();
    izabraniElement = objekat;
    objekat.stroke("#e53e3e"); // crveni okvir kao vizuelni znak selekcije
    objekat.strokeWidth(3);
    sloj.draw();
  }

  function ponistiSelekciju() {
    if (izabraniElement) {
      // Vraćamo originalnu boju okvira u zavisnosti od tipa
      const originalneBoje = {
        Circle: "#1a4971",
        Rect: "#c05621",
        Star: "#b7791f"
      };
      const tipFigure = izabraniElement.getClassName();
      izabraniElement.stroke(originalneBoje[tipFigure] || "#333333");
      izabraniElement.strokeWidth(2);
      izabraniElement = null;
      sloj.draw();
    }
  }

  // Klik na prazan deo canvasa (stage) poništava selekciju
  stage.on("click tap", (e) => {
    if (e.target === stage) {
      ponistiSelekciju();
    }
  });

  // ===================== PALETA - DODAVANJE ELEMENATA KLIKOM =====================

  const paletteItems = document.querySelectorAll(".palette-item");

  paletteItems.forEach((item) => {
    item.addEventListener("click", () => {
      const tip = item.dataset.element;
      kreirajElement(tip);
    });
  });

  // ===================== DUGMAD ZA UPRAVLJANJE =====================

  const btnObrisiElement = document.getElementById("btn-obrisi-element");
  const btnResetCanvas = document.getElementById("btn-reset-canvas");
  const btnPreuzmiSliku = document.getElementById("btn-preuzmi-sliku");

  if (btnObrisiElement) {
    btnObrisiElement.addEventListener("click", () => {
      if (!izabraniElement) {
        alert("Prvo izaberite element klikom na njega, pa ga zatim obrišite.");
        return;
      }
      izabraniElement.destroy();
      izabraniElement = null;
      sloj.draw();
    });
  }

  if (btnResetCanvas) {
    btnResetCanvas.addEventListener("click", () => {
      const potvrda = confirm("Da li ste sigurni da želite da resetujete igračku? Svi dodati elementi će biti obrisani.");
      if (!potvrda) return;

      sloj.destroyChildren();
      izabraniElement = null;
      brojacElemenata = 0;
      nacrtajBazu();
    });
  }

  if (btnPreuzmiSliku) {
    btnPreuzmiSliku.addEventListener("click", () => {
      ponistiSelekciju(); // uklanjamo crveni okvir selekcije pre snimanja slike

      const dataURL = stage.toDataURL({ pixelRatio: 2 });

      const link = document.createElement("a");
      link.download = "moja-prilagodjena-igracka.png";
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ===================== PRILAGOĐAVANJE VELIČINE PRI PROMENI PROZORA =====================

  window.addEventListener("resize", () => {
    const novaSirina = containerEl.clientWidth;
    const novaVisina = containerEl.clientHeight;
    stage.width(novaSirina);
    stage.height(novaVisina);
  });

  // ===================== POKRETANJE =====================

  nacrtajBazu();

});