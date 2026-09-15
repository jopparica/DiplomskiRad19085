document.addEventListener("DOMContentLoaded", () => {
  const containerEl = document.getElementById("konva-container");
  if (!containerEl) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let muzikaTimer = null;
  let sviraMuzika = false;

  function pokreniMelodiju() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (sviraMuzika) {
      zaustaviMuziku();
      return;
    }

    sviraMuzika = true;
    const tonovi = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25];
    let idx = 0;

    function odsvirajSledećiTon() {
      if (!sviraMuzika) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(tonovi[idx % tonovi.length], t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.3);

      idx++;
      muzikaTimer = setTimeout(odsvirajSledećiTon, 320);
    }

    odsvirajSledećiTon();
  }

  function zaustaviMuziku() {
    sviraMuzika = false;
    if (muzikaTimer) clearTimeout(muzikaTimer);
  }

  function reprodukujZvono() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    [587.33, 880.00].forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });

    [659.25, 987.77].forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + 0.22);
      gain.gain.setValueAtTime(0.12, t + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t + 0.22);
      osc.stop(t + 0.6);
    });
  }

  function reprodukujMehaniku() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, t);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  function pokreniZvukPreskakanja(trajanjeSekundi) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let ukupanBrojKlikova = 16; 
    let intervalMs = (trajanjeSekundi * 1000) / ukupanBrojKlikova;
    let brojac = 0;

    let klikInterval = setInterval(() => {
      reprodukujMehaniku();
      brojac++;
      if (brojac >= ukupanBrojKlikova) {
        clearInterval(klikInterval);
      }
    }, intervalMs);
  }

  function kreirajPattern(tip, osnovnaBoja) {
    const pCanvas = document.createElement("canvas");
    const pCtx = pCanvas.getContext("2d");

    if (tip === "plis") {
      pCanvas.width = 16; pCanvas.height = 16;
      pCtx.fillStyle = osnovnaBoja;
      pCtx.fillRect(0, 0, 16, 16);
      pCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
      pCtx.fillRect(2, 2, 4, 4);
      pCtx.fillRect(10, 10, 4, 4);
    } else if (tip === "silikon") {
      pCanvas.width = 12; pCanvas.height = 12;
      pCtx.fillStyle = osnovnaBoja;
      pCtx.fillRect(0, 0, 12, 12);
      pCtx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      pCtx.lineWidth = 3;
      pCtx.beginPath();
      pCtx.moveTo(0, 12); pCtx.lineTo(12, 0);
      pCtx.stroke();
    } else {
      pCanvas.width = 8; pCanvas.height = 8;
      pCtx.fillStyle = osnovnaBoja;
      pCtx.fillRect(0, 0, 8, 8);
    }
    return pCanvas;
  }

  // STAGE INITIALIZATION
  const stage = new Konva.Stage({
    container: "konva-container",
    width: containerEl.clientWidth,
    height: containerEl.clientHeight || 540
  });

  const slojOsnova = new Konva.Layer();
  const slojOpseg = new Konva.Layer();
  const slojElementi = new Konva.Layer();
  const slojUputstvo = new Konva.Layer(); // SLOJ ZA UPUTSTVO UNUTAR CANVAS-A

  stage.add(slojOsnova);
  stage.add(slojOpseg);
  stage.add(slojElementi);
  stage.add(slojUputstvo);

  const transformer = new Konva.Transformer({
    rotateEnabled: true,
    keepRatio: false,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 20 || newBox.height < 20) return oldBox;
      return newBox;
    }
  });
  slojElementi.add(transformer);

  let trenutnaBaza = "meda";
  let trenutnaBoja = "#ed8936";
  let trenutniMaterijal = "plis";
  let trenutniNivoKoraka = 1;
  
  let postavljeniElementi = {
    meda: [],
    valjak: [],
    volan: []
  };

  let history = [];
  let historyStep = -1;

  function sacuvajStanjeIstorije() {
    history = history.slice(0, historyStep + 1);
    history.push(JSON.stringify(postavljeniElementi));
    historyStep++;
  }

  let selektovaniElementId = null;

  const opisMaterijala = {
    plis: "💡 <strong>Meki pliš:</strong> Pruža osećaj sigurnosti, smanjuje anksioznost i podstiče emotivnu regulaciju deteta.",
    glatko: "💡 <strong>Glatko:</strong> Pruža čist taktilni nadražaj, olakšava brisanje i održavanje higijene u terapijskim uslovima.",
    silikon: "💡 <strong>Rebrasti silikon:</strong> Podstiče senzornu stimulaciju dlanova, olakšava stisak i sprečava klizanje igračke."
  };

  const elementiUI = {
    zvucnik: {
      ikona: "🎵", naziv: "Zvučni modul",
      opis: "🏥 <strong>Svrha:</strong> Zvučna stimulacija i razvoj auditivne pažnje.",
      podesavanja: [{ id: "zvuk_tip", naslov: "Zvuk", opcije: [{ val: "melodija", lab: "Dečija melodija", hint: "🎯 Kontinualna stimulacija." }, { val: "zvono", lab: "Dvostruki akord", hint: "🎯 Kratak odziv." }] }]
    },
    zip: {
      ikona: "🧷", naziv: "Zip-mehanizam",
      opis: "🏥 <strong>Svrha:</strong> Razvoj fine motorike šake.",
      podesavanja: [{ id: "vrsta_zipa", naslov: "Tip mehanizma", opcije: [{ val: "metal", lab: "Klasični metalni", hint: "🎯 Za preciznije prste." }, { val: "plastika", lab: "Široki plastični", hint: "🎯 Ergonomski." }] }]
    },
    zupcanik: {
      ikona: "⚙️", naziv: "Rotirajući zupčanik",
      opis: "🏥 <strong>Svrha:</strong> Taktilno-proprioceptivni unos kroz rotaciju.",
      podesavanja: [{ id: "otpor", naslov: "Otpor rotacije", opcije: [{ val: "lako", lab: "Slobodno", hint: "🎯 Lako rotiranje." }, { val: "klik", lab: "Klik otpor", hint: "🎯 Usporeno prezubljivanje." }] }]
    },
    trake: {
      ikona: "🟨", naziv: "Senzorne omče / Trake",
      opis: "🏥 <strong>Svrha:</strong> Taktilno-vizuelno istraživanje.",
      podesavanja: [{ id: "boje", naslov: "Paleta boja", opcije: [{ val: "visoki", lab: "Visoki kontrast", hint: "🎯 Za slabovidnost." }, { val: "pastel", lab: "Pastelne boje", hint: "🎯 Umirujuće." }] }]
    },
    led: {
      ikona: "💡", naziv: "LED Svetlo",
      opis: "🏥 <strong>Svrha:</strong> Vizuelno praćenje i fiksacija pogleda.",
      podesavanja: [{ id: "led_boja", naslov: "Boja svetla", opcije: [{ val: "#ecc94b", lab: "Žuta", hint: "🎯 Topla boja." }, { val: "#63b3ed", lab: "Plava", hint: "🎯 Umirujuće." }] }, { id: "led_rezim", naslov: "Režim rada", opcije: [{ val: "puls", lab: "Pulsirajuće", hint: "🎯 Dinamičko praćenje." }, { val: "stalno", lab: "Stalno svetlo", hint: "🎯 Blago osvetljenje." }] }]
    },
    ponderisano: {
      ikona: "⚖️", naziv: "Ponderisani modul",
      opis: "🏥 <strong>Svrha:</strong> Duboki pritisak umiruje dete.",
      podesavanja: [{ id: "tezina", naslov: "Težina", opcije: [{ val: "200g", lab: "200g (Lako)", hint: "🎯 Blago opterećenje." }, { val: "500g", lab: "500g (Srednje)", hint: "🎯 Snažniji uticaj." }] }]
    }
  };

  // CENTRIRANO UPUTSTVO SA POVEĆANIM FONTOVIMA UNUTAR CANVAS-A
 // CENTRIRANO UPUTSTVO SA UPPERCASE TEKSTOM I VERTIKALNO CENTRIRANOM ZNAČKOM
  function crtajUputstvo(nivo) {
    if (nivo) trenutniNivoKoraka = nivo;
    slojUputstvo.destroyChildren();

    let naslovTekst = "KORAK 1";
    let poruka = "IZABERITE BAZU, BOJU I MATERIJAL IGRAČKE NA DESNOM PANELU. KLIKNITE NA IGRAČKU ZA DODAVANJE MODULA.";

    if (trenutniNivoKoraka === 2) {
      naslovTekst = "KORAK 2";
      poruka = "ODABERITE SENZORNI MODUL IZ DESNOG MENIJA KOJI ŽELITE UGRADITI NA OZNAČENU POZICIJU.";
    } else if (trenutniNivoKoraka === 3) {
      naslovTekst = "KORAK 3";
      poruka = "MOŽETE POMERATI, MENJATI VELIČINU ILI ROTIRATI MODUL DIREKTNO NA IGRAČKI, I PODESITI NJEGOVE OPCIJE.";
    }

    const grupa = new Konva.Group({ y: 14, listening: false });

    const maxSirina = Math.min(stage.width() - 40, 560);

    const txtBadge = new Konva.Text({
      text: naslovTekst,
      fontSize: 12,
      fontStyle: 'bold',
      fill: '#ffffff',
      padding: 5
    });

    const badgeBg = new Konva.Rect({
      width: txtBadge.width() + 10,
      height: txtBadge.height() + 4,
      fill: '#2b6cb0',
      cornerRadius: 5
    });

    const mainText = new Konva.Text({
      x: badgeBg.width() + 24,
      y: 12,
      text: poruka,
      fontSize: 13,
      fontFamily: 'Outfit, sans-serif',
      fontStyle: 'bold',
      fill: '#1a202c',
      width: maxSirina - badgeBg.width() - 40,
      lineHeight: 1.35
    });

    const visinaBoksa = Math.max(badgeBg.height() + 20, mainText.height() + 24);
    const sirinaBoksa = badgeBg.width() + mainText.width() + 44;

    const pozadinaBox = new Konva.Rect({
      width: sirinaBoksa,
      height: visinaBoksa,
      fill: 'rgba(255, 255, 255, 0.96)',
      stroke: '#2b6cb0',
      strokeWidth: 2,
      cornerRadius: 10,
      shadowColor: 'black',
      shadowBlur: 12,
      shadowOpacity: 0.1,
      shadowOffset: { x: 0, y: 4 }
    });

    // Vertikalno centriranje plave značke u odnosu na visinu celog boksa
    const vertikalniY = (visinaBoksa - badgeBg.height()) / 2;
    badgeBg.x(12);
    badgeBg.y(vertikalniY);

    txtBadge.x(12 + (badgeBg.width() - txtBadge.width()) / 2);
    txtBadge.y(vertikalniY + (badgeBg.height() - txtBadge.height()) / 2);

    // Vertikalno centriranje teksta poruke
    mainText.y((visinaBoksa - mainText.height()) / 2);

    grupa.add(pozadinaBox);
    grupa.add(badgeBg);
    grupa.add(txtBadge);
    grupa.add(mainText);

    // Centriranje na širinu Canvasa
    grupa.x((stage.width() - sirinaBoksa) / 2);

    slojUputstvo.add(grupa);
    slojUputstvo.batchDraw();
  }

  function crtajBazu() {
    slojOsnova.destroyChildren();
    slojElementi.destroyChildren();
    slojElementi.add(transformer);

    const cX = stage.width() / 2;
    const cY = stage.height() / 2 + 15; // Pomeramo malo dole radi poravnanja
    const imgPattern = kreirajPattern(trenutniMaterijal, trenutnaBoja);

    const grupaCelaIgracka = new Konva.Group({ id: 'cela-igracka-grupa' });

    const primeniStil = (oblik) => {
      oblik.fillPriority("pattern");
      oblik.fillPatternImage(imgPattern);
    };

    if (trenutnaBaza === "meda") {
      const delovi = [
        new Konva.Circle({ x: cX - 55, y: cY - 105, radius: 25, stroke: "#2d3748", strokeWidth: 3 }),
        new Konva.Circle({ x: cX + 55, y: cY - 105, radius: 25, stroke: "#2d3748", strokeWidth: 3 }),
        new Konva.Circle({ x: cX - 65, y: cY + 85, radius: 28, stroke: "#2d3748", strokeWidth: 3 }),
        new Konva.Circle({ x: cX + 65, y: cY + 85, radius: 28, stroke: "#2d3748", strokeWidth: 3 }),
        new Konva.Circle({ x: cX, y: cY + 30, radius: 85, stroke: "#2d3748", strokeWidth: 4 }),
        new Konva.Circle({ x: cX, y: cY - 60, radius: 65, stroke: "#2d3748", strokeWidth: 4 })
      ];
      delovi.forEach(d => { primeniStil(d); grupaCelaIgracka.add(d); });

      grupaCelaIgracka.add(new Konva.Ellipse({ x: cX, y: cY - 48, radiusX: 22, radiusY: 16, fill: "#feebc8", stroke: "#744210", strokeWidth: 2 }));
      grupaCelaIgracka.add(new Konva.Ellipse({ x: cX, y: cY - 55, radiusX: 10, radiusY: 7, fill: "#2d3748" }));
      grupaCelaIgracka.add(new Konva.Circle({ x: cX - 22, y: cY - 72, radius: 6, fill: "#1a202c" }));
      grupaCelaIgracka.add(new Konva.Circle({ x: cX + 22, y: cY - 72, radius: 6, fill: "#1a202c" }));

    } else if (trenutnaBaza === "valjak") {
      const sirina = 200;
      const visina = 110;

      grupaCelaIgracka.add(new Konva.Ellipse({ x: cX - sirina / 2, y: cY, radiusX: 22, radiusY: visina / 2, fill: "#2d3748", stroke: "#1a202c", strokeWidth: 3 }));
      const omotac = new Konva.Rect({ x: cX - sirina / 2, y: cY - visina / 2, width: sirina, height: visina, stroke: "#1a202c", strokeWidth: 3 });
      primeniStil(omotac);
      grupaCelaIgracka.add(omotac);

      const prednjiProfil = new Konva.Ellipse({ x: cX + sirina / 2, y: cY, radiusX: 22, radiusY: visina / 2, stroke: "#1a202c", strokeWidth: 3 });
      primeniStil(prednjiProfil);
      grupaCelaIgracka.add(prednjiProfil);

      grupaCelaIgracka.add(new Konva.Rect({ x: cX - sirina / 2 - 12, y: cY - 18, width: 12, height: 36, fill: "#4a5568", cornerRadius: 4, stroke: "#1a202c", strokeWidth: 2 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX + sirina / 2, y: cY - 18, width: 12, height: 36, fill: "#4a5568", cornerRadius: 4, stroke: "#1a202c", strokeWidth: 2 }));

    } else if (trenutnaBaza === "volan") {
      const prsten = new Konva.Circle({ x: cX, y: cY, radius: 115, stroke: "#1a202c", strokeWidth: 6 });
      primeniStil(prsten);
      grupaCelaIgracka.add(prsten);

      grupaCelaIgracka.add(new Konva.Circle({ x: cX, y: cY, radius: 72, fill: "#f8fafc", stroke: "#1a202c", strokeWidth: 4 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX - 128, y: cY - 30, width: 18, height: 60, fill: "#2d3748", cornerRadius: 6 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX + 110, y: cY - 30, width: 18, height: 60, fill: "#2d3748", cornerRadius: 6 }));
    }

    grupaCelaIgracka.on("click tap", () => {
      const pos = stage.getPointerPosition();
      otvoriMeniZaNovuTacku(pos.x, pos.y);
    });

    slojOsnova.add(grupaCelaIgracka);
    slojOsnova.batchDraw();

    const elementiNiz = postavljeniElementi[trenutnaBaza];
    elementiNiz.forEach(item => {
      crtajPostavljeniElement(item);
    });

    slojElementi.batchDraw();
    crtajUputstvo();
    osveziInventarListu();
  }

  stage.on('click tap', (e) => {
    if (e.target === stage || e.target.hasName('cela-igracka-grupa')) {
      transformer.nodes([]);
      slojElementi.batchDraw();
    }
  });

  function prikaziVizuelniOpseg(x, y) {
    slojOpseg.destroyChildren();

    const targetGroup = new Konva.Group({ x: x, y: y });
    const spoljniKrug = new Konva.Circle({
      radius: 28, fill: "rgba(43, 108, 176, 0.25)", stroke: "#2b6cb0", strokeWidth: 2, dash: [4, 4]
    });
    const unutrasnjaTacka = new Konva.Circle({ radius: 5, fill: "#2b6cb0" });

    targetGroup.add(spoljniKrug);
    targetGroup.add(unutrasnjaTacka);
    slojOpseg.add(targetGroup);

    new Konva.Tween({
      node: spoljniKrug, duration: 0.6, scaleX: 1.25, scaleY: 1.25, opacity: 0.4, yoyo: true, repeat: -1
    }).play();

    slojOpseg.batchDraw();
  }

  function ukloniVizuelniOpseg() {
    slojOpseg.destroyChildren();
    slojOpseg.batchDraw();
  }

  function otvoriMeniZaNovuTacku(x, y) {
    window.tempKlikX = x;
    window.tempKlikY = y;

    prikaziVizuelniOpseg(x, y);

    const container = document.getElementById("elements-container");
    container.innerHTML = "";

    Object.keys(elementiUI).forEach(tip => {
      const el = elementiUI[tip];
      const btn = document.createElement("button");
      btn.className = "btn-element";
      btn.innerHTML = `<span class="el-icon">${el.ikona}</span><span class="el-name">${el.naziv}</span>`;
      
      btn.onclick = () => {
        ukloniVizuelniOpseg();

        const podrazumevano = {};
        if (el.podesavanja) {
          el.podesavanja.forEach(p => { podrazumevano[p.id] = p.opcije[0].val; });
        }

        const noviObj = {
          id: Date.now(),
          x: window.tempKlikX,
          y: window.tempKlikY,
          tip: tip,
          opcije: podrazumevano
        };

        postavljeniElementi[trenutnaBaza].push(noviObj);
        selektovaniElementId = noviObj.id;

        sacuvajStanjeIstorije();
        crtajBazu();
        otvoriPodesavanja(noviObj.id);
      };
      container.appendChild(btn);
    });

    prikaziPanel(2);
  }

  function crtajPostavljeniElement(modulObj) {
    const grupa = new Konva.Group({
      x: modulObj.x,
      y: modulObj.y,
      draggable: true,
      id: `modul-${modulObj.id}`
    });

    const tip = modulObj.tip;
    const opcije = modulObj.opcije || {};

    if (tip === "zvucnik") {
      grupa.add(new Konva.Circle({ radius: 26, fill: '#6b46c1', stroke: '#322659', strokeWidth: 3 }));
      grupa.add(new Konva.Circle({ radius: 16, fill: '#9f7aea', stroke: '#553c9a', strokeWidth: 2 }));
      grupa.add(new Konva.Text({ text: '🎵', fontSize: 16, x: -8, y: -8 }));

    } else if (tip === "zip") {
      grupa.add(new Konva.Rect({ x: -35, y: -10, width: 70, height: 20, fill: opcije.vrsta_zipa === "plastika" ? '#3182ce' : '#4a5568', cornerRadius: 4, stroke: '#1a202c', strokeWidth: 2 }));
      for (let i = -28; i <= 28; i += 7) {
        grupa.add(new Konva.Rect({ x: i, y: -8, width: 3, height: 16, fill: '#cbd5e0' }));
      }
      const klizac = new Konva.Rect({ x: -25, y: -12, width: 14, height: 24, fill: '#e2e8f0', cornerRadius: 3, stroke: '#1a202c', strokeWidth: 1.5, id: 'zip-klizac' });
      grupa.add(klizac);

    } else if (tip === "led") {
      const boja = opcije.led_boja || '#ecc94b';
      const sjaj = new Konva.Circle({ radius: 24, fill: boja, opacity: opcije.led_rezim === "stalno" ? 0.85 : 0.35, id: 'led-sjaj' });
      const lampica = new Konva.Circle({ radius: 16, fill: boja, stroke: '#d69e2e', strokeWidth: 3 });
      grupa.add(sjaj);
      grupa.add(lampica);

    } else if (tip === "zupcanik") {
      const zup = new Konva.Group({ id: 'fidget-zupcanik' });
      zup.add(new Konva.Circle({ radius: 22, fill: '#c53030', stroke: '#742a2a', strokeWidth: 3 }));
      for (let a = 0; a < 360; a += 45) {
        const rad = (a * Math.PI) / 180;
        zup.add(new Konva.Rect({
          x: Math.cos(rad) * 20 - 4, y: Math.sin(rad) * 20 - 4,
          width: 8, height: 8, fill: '#742a2a', cornerRadius: 2
        }));
      }
      zup.add(new Konva.Circle({ radius: 10, fill: '#ffffff', stroke: '#2d3748', strokeWidth: 2 }));
      grupa.add(zup);

    } else if (tip === "trake") {
      const trakeGrupa = new Konva.Group({ id: 'trake-telo' });
      const boje = opcije.boje === "pastel" ? ['#fbb6ce', '#faf089', '#90cdf4', '#9ae6b4'] : ['#e53e3e', '#ecc94b', '#3182ce', '#38a169'];
      boje.forEach((b, i) => {
        const ox = -20 + i * 10;
        trakeGrupa.add(new Konva.Rect({ x: ox, y: -18, width: 8, height: 36, fill: b, cornerRadius: 4, stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1 }));
      });
      grupa.add(trakeGrupa);

    } else if (tip === "ponderisano") {
      const jeVeliko = opcije.tezina === "500g";
      const sirina = jeVeliko ? 74 : 56;
      const visina = jeVeliko ? 32 : 24;

      const podTelo = new Konva.Group({ id: 'ponder-telo' });
      podTelo.add(new Konva.Rect({ x: -sirina / 2, y: -visina / 2, width: sirina, height: visina, fill: '#2d3748', cornerRadius: 6, stroke: '#1a202c', strokeWidth: 3 }));
      podTelo.add(new Konva.Text({ text: opcije.tezina || "200g", fontSize: jeVeliko ? 12 : 10, fontStyle: 'bold', fill: '#ffffff', x: jeVeliko ? -16 : -12, y: -5 }));
      grupa.add(podTelo);
    }

    grupa.on("click tap", (e) => {
      e.cancelBubble = true;
      ukloniVizuelniOpseg();
      selektovaniElementId = modulObj.id;
      
      transformer.nodes([grupa]);
      slojElementi.batchDraw();

      pokreniAnimacijuElementa(grupa, tip, opcije);
      otvoriPodesavanja(modulObj.id);
    });

    grupa.on("dragend transformend", () => {
      modulObj.x = grupa.x();
      modulObj.y = grupa.y();
      sacuvajStanjeIstorije();
    });

    slojElementi.add(grupa);

    if (selektovaniElementId === modulObj.id) {
      transformer.nodes([grupa]);
    }
  }

  function prikaziPanel(nivo) {
    document.getElementById("panel-level-1").style.display = nivo === 1 ? "block" : "none";
    document.getElementById("panel-level-2").style.display = nivo === 2 ? "block" : "none";
    document.getElementById("panel-level-3").style.display = nivo === 3 ? "block" : "none";

    document.getElementById("step-1").classList.toggle("active", nivo === 1);
    document.getElementById("step-2").classList.toggle("active", nivo === 2);
    document.getElementById("step-3").classList.toggle("active", nivo === 3);

    crtajUputstvo(nivo);
  }

  function osveziInventarListu() {
    const listEl = document.getElementById("inventory-list");
    if (!listEl) return;

    const trNiz = postavljeniElementi[trenutnaBaza];
    listEl.innerHTML = "";

    if (trNiz.length === 0) {
      listEl.innerHTML = '<li class="empty-inventory">Nema dodatih modula. Kliknite na igračku za dodavanje.</li>';
      return;
    }

    trNiz.forEach(item => {
      const data = elementiUI[item.tip];
      const li = document.createElement("li");
      li.className = "inventory-item";
      li.innerHTML = `
        <span>${data.ikona} ${data.naziv}</span>
        <button class="inventory-item-remove" title="Ukloni modul">✕</button>
      `;

      li.querySelector(".inventory-item-remove").onclick = (e) => {
        e.stopPropagation();
        ukloniElementById(item.id);
      };

      li.onclick = () => {
        selektovaniElementId = item.id;
        const g = slojElementi.findOne(`#modul-${item.id}`);
        if (g) {
          transformer.nodes([g]);
          slojElementi.batchDraw();
        }
        otvoriPodesavanja(item.id);
      };

      listEl.appendChild(li);
    });
  }

  function ukloniElementById(id) {
    zaustaviMuziku();
    ukloniVizuelniOpseg();
    transformer.nodes([]);
    postavljeniElementi[trenutnaBaza] = postavljeniElementi[trenutnaBaza].filter(i => i.id !== id);
    if (selektovaniElementId === id) selektovaniElementId = null;
    sacuvajStanjeIstorije();
    crtajBazu();
    prikaziPanel(1);
  }

  function otvoriPodesavanja(elementId) {
    const elObj = postavljeniElementi[trenutnaBaza].find(item => item.id === elementId);
    if (!elObj) return;

    const modulData = elementiUI[elObj.tip];
    document.getElementById("podesavanje-naslov").innerText = modulData.naziv;

    const container = document.getElementById("fine-tuning-container");
    container.innerHTML = "";

    const descBox = document.getElementById("module-description-box");
    if (descBox) descBox.innerHTML = modulData.opis || "";

    if (modulData.podesavanja) {
      modulData.podesavanja.forEach(p => {
        const grupa = document.createElement("div");
        grupa.className = "fine-tuning-group";

        const label = document.createElement("label");
        label.innerText = p.naslov + ":";
        grupa.appendChild(label);

        const tuneOpts = document.createElement("div");
        tuneOpts.className = "tune-options";

        const hintBox = document.createElement("div");
        hintBox.className = "sub-option-hint";

        const osveziHint = (val) => {
          const optObj = p.opcije.find(o => o.val === val);
          if (optObj && optObj.hint) {
            hintBox.innerHTML = optObj.hint;
            hintBox.style.display = "block";
          } else {
            hintBox.style.display = "none";
          }
        };

        const trenVal = elObj.opcije[p.id] || p.opcije[0].val;

        p.opcije.forEach(o => {
          const btn = document.createElement("button");
          btn.className = "tune-btn";
          if (trenVal === o.val) btn.classList.add("active");
          btn.innerText = o.lab;

          btn.onclick = () => {
            tuneOpts.querySelectorAll(".tune-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            elObj.opcije[p.id] = o.val;
            osveziHint(o.val);
            sacuvajStanjeIstorije();
            crtajBazu();
          };

          tuneOpts.appendChild(btn);
        });

        grupa.appendChild(tuneOpts);
        grupa.appendChild(hintBox);
        container.appendChild(grupa);

        osveziHint(trenVal);
      });
    }

    prikaziPanel(3);
  }

  function pokreniAnimacijuElementa(grupa, tip, opcije) {
    if (tip === "zvucnik") {
      if (opcije.zvuk_tip === "zvono") reprodukujZvono(); else pokreniMelodiju();
      new Konva.Tween({ node: grupa, duration: 0.35, scaleX: 1.15, scaleY: 1.15, yoyo: true, repeat: 1 }).play();

    } else if (tip === "zip") {
      reprodukujMehaniku();
      const klizac = grupa.findOne('#zip-klizac');
      if (klizac) new Konva.Tween({ node: klizac, duration: 0.7, x: 18, yoyo: true }).play();

    } else if (tip === "led") {
      const sjaj = grupa.findOne('#led-sjaj');
      if (sjaj) {
        if (opcije.led_rezim === "stalno") new Konva.Tween({ node: sjaj, duration: 0.5, opacity: 1, yoyo: true }).play();
        else new Konva.Tween({ node: sjaj, duration: 0.6, radius: 36, opacity: 0.9, yoyo: true, repeat: 1 }).play();
      }

    } else if (tip === "zupcanik") {
      const zupcanik = grupa.findOne('#fidget-zupcanik');
      if (zupcanik) {
        const trenRot = zupcanik.rotation();
        if (opcije.otpor === "klik") {
          pokreniZvukPreskakanja(3.5);
          new Konva.Tween({ node: zupcanik, duration: 3.5, rotation: trenRot + 360, easing: Konva.Easings.Linear }).play();
        } else {
          new Konva.Tween({ node: zupcanik, duration: 2.8, rotation: trenRot + 1440, easing: Konva.Easings.EaseOut }).play();
        }
      }

    } else if (tip === "ponderisano") {
      const celaIgracka = slojOsnova.findOne('#cela-igracka-grupa');
      if (celaIgracka) {
        const pomeraj = opcije.tezina === "500g" ? 12 : 6;
        new Konva.Tween({ node: celaIgracka, duration: 0.8, y: pomeraj, yoyo: true }).play();
      }
    }
  }

  // EVENT HANDLERS
  document.getElementById("btn-back-to-1").onclick = () => { ukloniVizuelniOpseg(); prikaziPanel(1); };
  document.getElementById("btn-back-to-2").onclick = () => { ukloniVizuelniOpseg(); prikaziPanel(1); };

  document.getElementById("btn-ukloni-element").onclick = () => {
    if (selektovaniElementId) ukloniElementById(selektovaniElementId);
  };

  document.getElementById("btn-test-element").onclick = () => {
    if (selektovaniElementId) {
      const elObj = postavljeniElementi[trenutnaBaza].find(i => i.id === selektovaniElementId);
      if (elObj) {
        const grupa = slojElementi.findOne(`#modul-${elObj.id}`);
        if (grupa) pokreniAnimacijuElementa(grupa, elObj.tip, elObj.opcije);
      }
    }
  };

  document.querySelectorAll(".btn-base").forEach(btn => {
    btn.onclick = () => {
      zaustaviMuziku();
      ukloniVizuelniOpseg();
      transformer.nodes([]);
      document.querySelectorAll(".btn-base").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      trenutnaBaza = btn.dataset.base;
      crtajBazu();
      prikaziPanel(1);
    };
  });

  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      trenutnaBoja = btn.dataset.color;
      crtajBazu();
    };
  });

  document.querySelectorAll(".btn-global-texture").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".btn-global-texture").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      trenutniMaterijal = btn.dataset.texture;
      const descBox = document.getElementById("material-description");
      if (descBox) descBox.innerHTML = opisMaterijala[trenutniMaterijal];
      crtajBazu();
    };
  });

  document.getElementById("btn-undo").onclick = () => {
    if (historyStep > 0) {
      historyStep--;
      postavljeniElementi = JSON.parse(history[historyStep]);
      crtajBazu();
    }
  };

  document.getElementById("btn-redo").onclick = () => {
    if (historyStep < history.length - 1) {
      historyStep++;
      postavljeniElementi = JSON.parse(history[historyStep]);
      crtajBazu();
    }
  };

  document.getElementById("btn-reset").onclick = () => {
    if (confirm("Da li ste sigurni da želite da resetujete sve izmene na igrački?")) {
      zaustaviMuziku();
      ukloniVizuelniOpseg();
      transformer.nodes([]);
      postavljeniElementi = { meda: [], valjak: [], volan: [] };
      selektovaniElementId = null;
      sacuvajStanjeIstorije();
      crtajBazu();
      prikaziPanel(1);
    }
  };

  // SAKRIVANJE UPUTSTVA U PREVIEW MODALU I PRI SAČUVAJ PNG
  const btnPreview = document.getElementById("btn-preview");
  const btnExitPreview = document.getElementById("btn-exit-preview");
  const previewModal = document.getElementById("preview-modal");
  const previewModalImg = document.getElementById("preview-modal-img");

  btnPreview.onclick = () => {
    transformer.nodes([]);
    slojUputstvo.hide(); // Sakriva textbox
    stage.batchDraw();

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    previewModalImg.src = dataURL;
    previewModal.style.display = "flex";

    slojUputstvo.show(); // Vraća textbox za nastavak rada
    stage.batchDraw();
  };

  btnExitPreview.onclick = () => {
    previewModal.style.display = "none";
  };

  document.getElementById("btn-save").onclick = () => {
    transformer.nodes([]);
    slojUputstvo.hide(); // Sakriva textbox na sačuvanoj slici
    stage.batchDraw();

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `medicinska-igracka-${trenutnaBaza}.png`;
    link.href = dataURL;
    link.click();

    slojUputstvo.show(); // Vraća textbox
    stage.batchDraw();
  };

  sacuvajStanjeIstorije();
  crtajBazu();
  prikaziPanel(1);

  window.addEventListener("resize", () => {
    stage.width(containerEl.clientWidth);
    stage.height(containerEl.clientHeight || 540);
    crtajBazu();
  });
});










