// ===================== NAPREDNI KONFIGURATOR IGRAČAKA (Konva.js) =====================

document.addEventListener("DOMContentLoaded", () => {

  const containerEl = document.getElementById("konva-container");
  if (!containerEl) return; // Nismo na configurator.html

  // Provera za mobilne ekrane i određivanje faktora skaliranja
  const isMobile = window.innerWidth < 768;
  const scaleFactor = isMobile ? 0.65 : 1.0;

  // Eksterne kontrole iz HTML-a za veličinu i rotaciju
  const controlsPanel = document.getElementById("selected-element-controls");
  const scaleInput = document.getElementById("input-element-scale");
  const rotateBtn = document.getElementById("btn-rotate-element");

  // ===================== INICIJALIZACIJA CANVASA =====================

  const stage = new Konva.Stage({
    container: "konva-container",
    width: containerEl.clientWidth,
    height: containerEl.clientHeight
  });

  const sloj = new Konva.Layer();
  stage.add(sloj);

  // Transformer služi isključivo kao isprekidana plava linija koja označava šta je trenutno aktivno
  let transformer = new Konva.Transformer({
    rotateEnabled: false,
    enabledAnchors: [],
    borderStroke: '#2b6cb0',
    borderStrokeWidth: 2,
    borderDash: [4, 4]
  });
  sloj.add(transformer);

  let trenutniModel = "meda";
  let brojacElemenata = 0;

  // Prikaz i skrivanje eksternih kontrola (slider i rotacija)
  function osveziKontrole() {
    const selektovani = transformer.nodes();
    if (selektovani.length > 0) {
      const el = selektovani[0];
      if (controlsPanel) controlsPanel.style.display = "flex";
      if (scaleInput) scaleInput.value = el.scaleX().toFixed(1);
    } else {
      if (controlsPanel) controlsPanel.style.display = "none";
    }
  }

  // Funkcija za označenje izabranog elementa
  function postaviSelekciju(cvor) {
    if (!cvor) return;
    transformer.nodes([cvor]);
    cvor.moveToTop();
    transformer.moveToTop();
    sloj.batchDraw();
    osveziKontrole();
  }

  // Uklanjanje selekcije
  function ukloniSelekciju() {
    transformer.nodes([]);
    sloj.batchDraw();
    osveziKontrole();
  }

  // ===================== BEZBEDNO ČIŠĆENJE CANVASA =====================

  function ocistiCeliCanvas() {
    transformer.nodes([]);
    sloj.destroyChildren();
    
    transformer = new Konva.Transformer({
      rotateEnabled: false,
      enabledAnchors: [],
      borderStroke: '#2b6cb0',
      borderStrokeWidth: 2,
      borderDash: [4, 4]
    });
    sloj.add(transformer);
    sloj.batchDraw();
    osveziKontrole();
  }

  // ===================== CRTANJE TAČNO 1 OSNOVNOG MODELA =====================
  function nacrtajOsnovniModel(tip) {
    ocistiCeliCanvas();
    brojacElemenata = 0;

    const cX = stage.width() / 2;
    const cY = stage.height() / 2;

    switch (tip) {
      case "meda":
        sloj.add(new Konva.Circle({ x: cX - 65, y: cY + 85, radius: 28, fill: "#b7791f", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX + 65, y: cY + 85, radius: 28, fill: "#b7791f", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX - 85, y: cY + 10, radius: 25, fill: "#b7791f", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX + 85, y: cY + 10, radius: 25, fill: "#b7791f", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX, y: cY + 30, radius: 85, fill: "#d69e2e", stroke: "#5c330a", strokeWidth: 4, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX, y: cY + 35, radius: 55, fill: "#f6e0b5", stroke: "#b7791f", strokeWidth: 2, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX - 55, y: cY - 105, radius: 25, fill: "#d69e2e", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX - 55, y: cY - 105, radius: 14, fill: "#f6e0b5", name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX + 55, y: cY - 105, radius: 25, fill: "#d69e2e", stroke: "#5c330a", strokeWidth: 3, name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX + 55, y: cY - 105, radius: 14, fill: "#f6e0b5", name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX, y: cY - 60, radius: 65, fill: "#d69e2e", stroke: "#5c330a", strokeWidth: 4, name: "osnova", listening: false }));
        sloj.add(new Konva.Ellipse({ x: cX, y: cY - 48, radiusX: 22, radiusY: 16, fill: "#feebc8", stroke: "#b7791f", strokeWidth: 2, name: "osnova", listening: false }));
        sloj.add(new Konva.Ellipse({ x: cX, y: cY - 55, radiusX: 10, radiusY: 7, fill: "#322659", name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX - 22, y: cY - 72, radius: 6, fill: "#000", name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({ x: cX + 22, y: cY - 72, radius: 6, fill: "#000", name: "osnova", listening: false }));
        break;

      case "lopta":
        sloj.add(new Konva.Ellipse({ x: cX, y: cY + 125, radiusX: 115, radiusY: 18, fill: "#cbd5e0", name: "osnova", listening: false }));
        sloj.add(new Konva.Circle({
          x: cX, y: cY, radius: 130,
          fillLinearGradientStartPoint: { x: -60, y: -60 },
          fillLinearGradientEndPoint: { x: 100, y: 100 },
          fillLinearGradientColorStops: [0, '#63b3ed', 0.85, '#2b6cb0', 1, '#1a365d'],
          stroke: "#1a365d", strokeWidth: 5, name: "osnova", listening: false
        }));
        sloj.add(new Konva.Arc({ x: cX - 80, y: cY, innerRadius: 118, outerRadius: 123, angle: 100, fill: "#ffffff", rotation: -50, opacity: 0.6, name: "osnova", listening: false }));
        sloj.add(new Konva.Arc({ x: cX + 80, y: cY, innerRadius: 118, outerRadius: 123, angle: 100, fill: "#ffffff", rotation: 130, opacity: 0.6, name: "osnova", listening: false }));
        break;

      case "tabla":
        const sirinaTable = 530;
        const visinaTable = 360;
        sloj.add(new Konva.Rect({ x: cX - sirinaTable/2, y: cY - visinaTable/2, width: sirinaTable, height: visinaTable, fill: "#8c531b", stroke: "#5c330a", strokeWidth: 5, cornerRadius: 12, name: "osnova", listening: false }));
        sloj.add(new Konva.Rect({ x: cX - sirinaTable/2 + 18, y: cY - visinaTable/2 + 18, width: sirinaTable - 36, height: visinaTable - 36, fill: "#f6e0b5", stroke: "#b7791f", strokeWidth: 3, cornerRadius: 6, name: "osnova", listening: false }));
        for (let i = -110; i <= 110; i += 45) {
          sloj.add(new Konva.Line({ points: [cX - sirinaTable/2 + 25, cY + i, cX + sirinaTable/2 - 25, cY + i], stroke: "#edd095", strokeWidth: 2, name: "osnova", listening: false }));
        }
        const uglovi = [
          {x: cX - sirinaTable/2 + 10, y: cY - visinaTable/2 + 10},
          {x: cX + sirinaTable/2 - 25, y: cY - visinaTable/2 + 10},
          {x: cX - sirinaTable/2 + 10, y: cY + visinaTable/2 - 25},
          {x: cX + sirinaTable/2 - 25, y: cY + visinaTable/2 - 25}
        ];
        uglovi.forEach(u => {
          sloj.add(new Konva.Rect({ x: u.x, y: u.y, width: 15, height: 15, fill: "#a0aec0", stroke: "#4a5568", strokeWidth: 1, name: "osnova", listening: false }));
          sloj.add(new Konva.Circle({ x: u.x + 7.5, y: u.y + 7.5, radius: 2, fill: "#2d3748", name: "osnova", listening: false }));
        });
        break;

      case "kocke":
        function nacrtajVeliku3DKocku(x, y, velicina) {
          const h = velicina;
          const w = velicina * 0.86;

          sloj.add(new Konva.Line({
            points: [x, y, x - w, y - h/2, x - w, y + h/2, x, y + h],
            fill: "#d69e2e", stroke: "#5c330a", strokeWidth: 3, closed: true, name: "osnova", listening: false
          }));
          sloj.add(new Konva.Line({
            points: [x, y, x + w, y - h/2, x + w, y + h/2, x, y + h],
            fill: "#b7791f", stroke: "#5c330a", strokeWidth: 3, closed: true, name: "osnova", listening: false
          }));
          sloj.add(new Konva.Line({
            points: [x, y, x - w, y - h/2, x, y - h, x + w, y - h/2],
            fill: "#f6e0b5", stroke: "#5c330a", strokeWidth: 3, closed: true, name: "osnova", listening: false
          }));
        }

        const velicinaKocke = 110;
        const razmakKocki = isMobile ? 140 : 220;

        nacrtajVeliku3DKocku(cX - razmakKocki, cY, velicinaKocke);
        nacrtajVeliku3DKocku(cX, cY, velicinaKocke);
        nacrtajVeliku3DKocku(cX + razmakKocki, cY, velicinaKocke);
        break;

      case "ksilofon":
        const sRama = 420;
        const vRama = 260;

        sloj.add(new Konva.Line({
          points: [
            cX - sRama/2, cY - vRama/2,
            cX + sRama/2, cY - vRama/2,
            cX + sRama/2 - 40, cY + vRama/2,
            cX - sRama/2 + 40, cY + vRama/2
          ],
          fill: "#8c531b", stroke: "#5c330a", strokeWidth: 5, closed: true, name: "osnova", listening: false
        }));

        const plocice = [
          { x: -140, sirina: 48, visina: 180, boja: "#e53e3e" },
          { x: -75,  sirina: 48, visina: 160, boja: "#dd6b20" },
          { x: -10,  sirina: 48, visina: 140, boja: "#ecc94b" },
          { x: 55,   sirina: 48, visina: 120, boja: "#38a169" },
          { x: 120,  sirina: 48, visina: 100, boja: "#3182ce" }
        ];

        plocice.forEach(p => {
          sloj.add(new Konva.Rect({
            x: cX + p.x, y: cY - p.visina/2,
            width: p.sirina, height: p.visina,
            fill: p.boja, stroke: "#1a202c", strokeWidth: 2, cornerRadius: 5, name: "osnova", listening: false
          }));
          sloj.add(new Konva.Circle({ x: cX + p.x + p.sirina/2, y: cY - p.visina/2 + 12, radius: 3.5, fill: "#ffffff", stroke: "#1a202c", strokeWidth: 1, name: "osnova", listening: false }));
          sloj.add(new Konva.Circle({ x: cX + p.x + p.sirina/2, y: cY + p.visina/2 - 12, radius: 3.5, fill: "#ffffff", stroke: "#1a202c", strokeWidth: 1, name: "osnova", listening: false }));
        });
        break;
    }

    sloj.batchDraw();
  }

  // ===================== KREIRANJE DODATAKA =====================

  function kreirajElement(tip, customX = null, customY = null) {
    brojacElemenata++;

    let posX = customX !== null ? customX : (isMobile ? 50 : 100) + (brojacElemenata % 4) * 15;
    let posY = customY !== null ? customY : (isMobile ? 50 : 100) + Math.floor(brojacElemenata / 4) * 15;

    let noviObjekat;

    switch (tip) {
      // 1. TAKTILNE TEKSTURE
      case "hrapavo":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -25, y: -25, width: 50, height: 50, fill: "#dd6b20", stroke: "#7b341e", strokeWidth: 3, cornerRadius: 6 }));
        for (let ix = -15; ix <= 15; ix += 15) {
          for (let iy = -15; iy <= 15; iy += 15) {
            noviObjekat.add(new Konva.Circle({ x: ix, y: iy, radius: 2, fill: "#7b341e" }));
          }
        }
        break;

      case "meko":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 24, fill: "#f6ad55", stroke: "#c05621", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 16, fill: "#fbd38d" }));
        break;

      case "reljef":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -30, y: -18, width: 60, height: 36, fill: "#319795", stroke: "#234e52", strokeWidth: 3, cornerRadius: 8 }));
        noviObjekat.add(new Konva.Line({ points: [-20, -10, -20, 10], stroke: "#234e52", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Line({ points: [0, -10, 0, 10], stroke: "#234e52", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Line({ points: [20, -10, 20, 10], stroke: "#234e52", strokeWidth: 3 }));
        break;

      case "magnet":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Arc({ x: 0, y: -5, innerRadius: 10, outerRadius: 22, angle: 180, fill: "#e53e3e", stroke: "#742a2a", strokeWidth: 2, rotation: 180 }));
        noviObjekat.add(new Konva.Rect({ x: -22, y: -5, width: 12, height: 18, fill: "#e53e3e", stroke: "#742a2a", strokeWidth: 2 }));
        noviObjekat.add(new Konva.Rect({ x: 10, y: -5, width: 12, height: 18, fill: "#3182ce", stroke: "#2b6cb0", strokeWidth: 2 }));
        break;     

      // 2. ZVUK & SIGNALIZACIJA
      case "zvonce":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: 0, y: -22, radius: 5, stroke: "#744210", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Arc({ x: 0, y: 5, innerRadius: 0, outerRadius: 22, angle: 180, fill: "#ecc94b", stroke: "#744210", strokeWidth: 3, rotation: 180 }));
        noviObjekat.add(new Konva.Rect({ x: -24, y: 3, width: 48, height: 5, fill: "#d69e2e", stroke: "#744210", strokeWidth: 2, cornerRadius: 2 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 12, radius: 5, fill: "#744210" }));
        break;

      case "zvucni-cip":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -22, y: -22, width: 44, height: 44, fill: "#805ad5", stroke: "#44337a", strokeWidth: 3, cornerRadius: 10 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 12, fill: "#b794f4", stroke: "#44337a", strokeWidth: 2 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 4, fill: "#44337a" }));
        break;

      case "nota":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: -10, y: 10, radius: 8, fill: "#3182ce" }));
        noviObjekat.add(new Konva.Circle({ x: 10, y: 5, radius: 8, fill: "#3182ce" }));
        noviObjekat.add(new Konva.Rect({ x: -4, y: -15, width: 4, height: 25, fill: "#2b6cb0" }));
        noviObjekat.add(new Konva.Rect({ x: 16, y: -20, width: 4, height: 25, fill: "#2b6cb0" }));
        noviObjekat.add(new Konva.Line({ points: [-4, -15, 20, -20, 20, -12, -4, -7], fill: "#2b6cb0", closed: true }));
        break;

      // 3. LAKŠE HVATANJE & MOTORIKA
      case "veliko-dugme":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 26, fill: "#e53e3e", stroke: "#742a2a", strokeWidth: 4 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 18, fill: "#feb2b2", stroke: "#742a2a", strokeWidth: 2 }));
        noviObjekat.add(new Konva.Circle({ x: -6, y: -6, radius: 2.5, fill: "#742a2a" }));
        noviObjekat.add(new Konva.Circle({ x: 6, y: -6, radius: 2.5, fill: "#742a2a" }));
        noviObjekat.add(new Konva.Circle({ x: -6, y: 6, radius: 2.5, fill: "#742a2a" }));
        noviObjekat.add(new Konva.Circle({ x: 6, y: 6, radius: 2.5, fill: "#742a2a" }));
        break;

      case "rucka":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -35, y: -12, width: 70, height: 24, fill: "#38a169", stroke: "#1c4532", strokeWidth: 3, cornerRadius: 12 }));
        noviObjekat.add(new Konva.Rect({ x: -22, y: -5, width: 44, height: 10, fill: "#ffffff", stroke: "#1c4532", strokeWidth: 2, cornerRadius: 5 }));
        noviObjekat.add(new Konva.Circle({ x: -28, y: 0, radius: 3, fill: "#1c4532" }));
        noviObjekat.add(new Konva.Circle({ x: 28, y: 0, radius: 3, fill: "#1c4532" }));
        break;

      case "zupcanik":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Star({ x: 0, y: 0, numPoints: 8, innerRadius: 18, outerRadius: 26, fill: "#ed8936", stroke: "#7b341e", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 12, fill: "#feebc8", stroke: "#7b341e", strokeWidth: 2 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 6, fill: "#7b341e" }));
        break;

      case "cicak":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -30, y: -14, width: 60, height: 28, fill: "#2d3748", stroke: "#1a202c", strokeWidth: 3, cornerRadius: 4 }));
        noviObjekat.add(new Konva.Rect({ x: -26, y: -10, width: 52, height: 20, fill: "#4a5568", stroke: "#2d3748", strokeWidth: 1, cornerRadius: 2 }));
        for (let ix = -20; ix <= 20; ix += 8) {
          for (let iy = -6; iy <= 6; iy += 6) {
            noviObjekat.add(new Konva.Circle({ x: ix, y: iy, radius: 2, fill: "#e2e8f0" }));
          }
        }
        break;

      // 4. VISOKI KONTRAST
      case "traka-kontrast":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Rect({ x: -40, y: -12, width: 80, height: 24, fill: "#ffff00", stroke: "#000000", strokeWidth: 3, cornerRadius: 4 }));
        for (let offset = -30; offset <= 30; offset += 15) {
          noviObjekat.add(new Konva.Line({ points: [offset, -10, offset + 8, 10], stroke: "#000000", strokeWidth: 4 }));
        }
        break;

      case "markacija":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 22, fill: "#ffffff", stroke: "#e53e3e", strokeWidth: 5 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 14, fill: "transparent", stroke: "#e53e3e", strokeWidth: 3 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 6, fill: "#e53e3e" }));
        break;

      case "ogledalo":
        noviObjekat = new Konva.Group({ x: posX, y: posY, draggable: true });
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 25, fill: "#f6e0b5", stroke: "#744210", strokeWidth: 3.5 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 20, fill: "#cbd5e0", stroke: "#a0aec0", strokeWidth: 1.5 }));
        noviObjekat.add(new Konva.Circle({ x: 0, y: 0, radius: 18, fillLinearGradientStartPoint: { x: -15, y: -15 }, fillLinearGradientEndPoint: { x: 15, y: 15 }, fillLinearGradientColorStops: [0, '#ffffff', 0.5, '#e2e8f0', 1, '#cbd5e0'] }));
        noviObjekat.add(new Konva.Line({ points: [-10, -5, 2, -17], stroke: "#ffffff", strokeWidth: 3, lineCap: "round", opacity: 0.9 }));
        noviObjekat.add(new Konva.Line({ points: [-5, 3, 8, -10], stroke: "#ffffff", strokeWidth: 2, lineCap: "round", opacity: 0.7 }));
        break;

      default:
        return;
    }

    noviObjekat.name("dodatak");
    noviObjekat.scale({ x: scaleFactor, y: scaleFactor });

    // Sinhronizacija pri pomeranju
    noviObjekat.on("dragstart dragmove", () => {
      postaviSelekciju(noviObjekat);
    });

    sloj.add(noviObjekat);
    postaviSelekciju(noviObjekat);
  }

  // ===================== UNIFIKOVANA SELEKCIJA NA LEVELU STAGE-A =====================

  let isScrolling = false;
  let startX = 0;
  let startY = 0;

  window.addEventListener('touchstart', (e) => {
    isScrolling = false;
    if (e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const deltaX = Math.abs(e.touches[0].clientX - startX);
      const deltaY = Math.abs(e.touches[0].clientY - startY);
      if (deltaX > 10 || deltaY > 10) {
        isScrolling = true;
      }
    }
  }, { passive: true });

  // Centralni događaj za selekciju/deselekciju
  stage.on("tap click", (e) => {
    if (isScrolling) return;

    // Klik na prazan prostor ili na osnovni model čisti selekciju
    if (e.target === stage || e.target.name() === "osnova") {
      ukloniSelekciju();
      return;
    }

    // Tražimo krovnu grupu "dodatak" bez obzira na to koji je unutrašnji oblik kliknut
    let targetGroup = e.target.findAncestor(node => node.name() === "dodatak", true);
    if (!targetGroup && e.target.name() === "dodatak") {
      targetGroup = e.target;
    }

    if (targetGroup) {
      postaviSelekciju(targetGroup);
    } else {
      ukloniSelekciju();
    }
  });

  // ===================== UPRAVLJANJE EKSTERNIM KONTROLAMA =====================

  if (scaleInput) {
    scaleInput.addEventListener("input", (e) => {
      const selektovani = transformer.nodes();
      if (selektovani.length > 0) {
        const novaSkala = parseFloat(e.target.value);
        selektovani[0].scale({ x: novaSkala, y: novaSkala });
        sloj.batchDraw();
      }
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      const selektovani = transformer.nodes();
      if (selektovani.length > 0) {
        const trenutnaRotacija = selektovani[0].rotation();
        selektovani[0].rotation((trenutnaRotacija + 45) % 360);
        sloj.batchDraw();
      }
    });
  }

  // ===================== ZAMENA OSNOVNOG MODELA =====================

  const modelButtons = document.querySelectorAll(".btn-model");
  modelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modelButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      trenutniModel = btn.dataset.model;
      nacrtajOsnovniModel(trenutniModel);
    });
  });

  // ===================== PALETA: DODAVANJE (KLIK I DRAG & DROP) =====================

  const paletteItems = document.querySelectorAll(".palette-item");
  paletteItems.forEach(item => {
    item.addEventListener("click", () => {
      kreirajElement(item.dataset.element);
    });

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.element);
    });
  });

  containerEl.addEventListener("dragover", (e) => e.preventDefault());

  containerEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const tip = e.dataTransfer.getData("text/plain");
    if (!tip) return;

    stage.setPointersPositions(e);
    const pos = stage.getPointerPosition();
    if (pos) {
      kreirajElement(tip, pos.x, pos.y);
    } else {
      kreirajElement(tip);
    }
  });

  // ===================== DUGMAD ZA UPRAVLJANJE =====================

  const btnObrisi = document.getElementById("btn-obrisi-element");
  const btnReset = document.getElementById("btn-reset-canvas");
  const btnPreuzmi = document.getElementById("btn-preuzmi-sliku");

  if (btnObrisi) {
    btnObrisi.addEventListener("click", () => {
      const selektovani = transformer.nodes();
      if (selektovani.length > 0) {
        selektovani.forEach(node => node.destroy());
        ukloniSelekciju();
      } else {
        alert("Prvo kliknite na dodatak koji želite da obrišete.");
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Da li ste sigurni da želite da resetujete igračku? Sve dodate modifikacije će biti uklonjene.")) {
        nacrtajOsnovniModel(trenutniModel);
      }
    });
  }

  if (btnPreuzmi) {
    btnPreuzmi.addEventListener("click", () => {
      ukloniSelekciju();

      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `nolimits-prilagodjena-igracka-${trenutniModel}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Sprečavanje resetovanja pri skrolovanju i promeni visine pregledača
  let prethodnaSirina = containerEl.clientWidth;

  window.addEventListener("resize", () => {
    const novaSirina = containerEl.clientWidth;
    if (Math.abs(novaSirina - prethodnaSirina) > 10) {
      prethodnaSirina = novaSirina;
      stage.width(containerEl.clientWidth);
      stage.height(containerEl.clientHeight);
      nacrtajOsnovniModel(trenutniModel);
    }
  });

  // Inicijalno iscrtavanje (Meda)
  nacrtajOsnovniModel("meda");

});