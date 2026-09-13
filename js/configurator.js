document.addEventListener("DOMContentLoaded", () => {
  const containerEl = document.getElementById("konva-container");
  if (!containerEl) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let muzikaTimer = null;
  let sviraMuzika = false;

  // ZVUČNI EFEKTI
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
    osc.frequency.setValueAtTime(140, t); // Dublji i jasniji mehanicki škljoc
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // ZNATNO USPOREN I SINHRONIZOVAN ZVUK PREZUPČAVANJA (ZUPČANIK - KLIK OTPOR)
  function pokreniZvukPreskakanja(trajanjeSekundi) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let ukupanBrojKlikova = 16; 
    let intervalMs = (trajanjeSekundi * 1000) / ukupanBrojKlikova; // Duplo sporiji ritam škljocanja
    let brojac = 0;

    let klikInterval = setInterval(() => {
      reprodukujMehaniku();
      brojac++;
      if (brojac >= ukupanBrojKlikova) {
        clearInterval(klikInterval);
      }
    }, intervalMs);
  }

  // Pattern generator za teksture
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

  // Stage Setup
  const stage = new Konva.Stage({
    container: "konva-container",
    width: containerEl.clientWidth,
    height: containerEl.clientHeight || 500
  });

  const slojOsnova = new Konva.Layer();
  const slojOpseg = new Konva.Layer(); // Sloj za vizuelni opseg lokacije
  const slojElementi = new Konva.Layer();

  stage.add(slojOsnova);
  stage.add(slojOpseg);
  stage.add(slojElementi);

  // STANJE APLIKACIJE
  let trenutnaBaza = "meda";
  let trenutnaBoja = "#ed8936";
  let trenutniMaterijal = "plis";
  
  let postavljeniElementi = {
    meda: [],
    valjak: [],
    volan: []
  };

  let selektovaniElementId = null;
  let aktivniOpsegObj = null;

  const opisMaterijala = {
    plis: "💡 <strong>Meki pliš:</strong> Pruža osećaj sigurnosti, smanjuje anksioznost i podstiče emotivnu regulaciju deteta.",
    glatko: "💡 <strong>Glatko:</strong> Pruža čist taktilni nadražaj, olakšava brisanje i održavanje higijene u terapijskim uslovima.",
    silikon: "💡 <strong>Rebrasti silikon:</strong> Podstiče senzornu stimulaciju dlanova, olakšava stisak i sprečava klizanje igračke."
  };

  const elementiUI = {
    zvucnik: {
      ikona: "🎵", naziv: "Zvučni modul",
      opis: "🏥 <strong>Svrha:</strong> Zvučna stimulacija i razvoj auditivne pažnje. Pomaže deci u prepoznavanju uzroka i posledice.",
      podesavanja: [
        {
          id: "zvuk_tip", naslov: "Zvuk",
          opcije: [
            { val: "melodija", lab: "Dečija melodija (Pusti/Stani)", hint: "🎯 Kontinualna stimulacija koja podstiče pokret." },
            { val: "zvono", lab: "Dvostruki akord", hint: "🎯 Kratak odziv pri pritisku za učenje uzročno-posledičnih veza." }
          ]
        }
      ]
    },
    zip: {
      ikona: "🧷", naziv: "Zip-mehanizam",
      opis: "🏥 <strong>Svrha:</strong> Razvoj fine motorike šake i bilateralne koordinacije.",
      podesavanja: [
        {
          id: "vrsta_zipa", naslov: "Tip mehanizma",
          opcije: [
            { val: "metal", lab: "Klasični metalni", hint: "🎯 Za decu sa razvijenijom preciznošću prstiju." },
            { val: "plastika", lab: "Široki plastični", hint: "🎯 Ergonomski prilagođen za mlađu decu sa slabijim stiskom." }
          ]
        }
      ]
    },
    zupcanik: {
      ikona: "⚙️", naziv: "Rotirajući zupčanik",
      opis: "🏥 <strong>Svrha:</strong> Taktilno-proprioceptivni unos kroz rotaciju ugrađenog zupčanika sa ležajem na igrački.",
      podesavanja: [
        {
          id: "otpor", naslov: "Otpor rotacije",
          opcije: [
            { val: "lako", lab: "Slobodno (Glatko 4 kruga)", hint: "🎯 Lako i produženo rotiranje (4 kruga) bez zvuka, za vizuelni i taktilni fokus." },
            { val: "klik", lab: "Klik otpor (Sporo prezubljivanje)", hint: "🎯 Znatno usporeno prezubljivanje uz sinhronizovan zvuk preskakanja tokom rotacije." }
          ]
        }
      ]
    },
    trake: {
      ikona: "🟨", naziv: "Senzorne omče / Trake",
      opis: "🏥 <strong>Svrha:</strong> Taktilno-vizuelno istraživanje ušivenih traka i omči za povlačenje.",
      podesavanja: [
        {
          id: "boje", naslov: "Paleta boja",
          opcije: [
            { val: "visoki", lab: "Visoki kontrast", hint: "🎯 Jarke primarne boje za decu sa slabovidnošću." },
            { val: "pastel", lab: "Pastelne boje", hint: "🎯 Umirujuće nijanse za decu preosetljivu na jake nadražaje." }
          ]
        }
      ]
    },
    led: {
      ikona: "💡", naziv: "LED Svetlo",
      opis: "🏥 <strong>Svrha:</strong> Vizuelno praćenje i fiksacija pogleda.",
      podesavanja: [
        {
          id: "led_boja", naslov: "Boja svetla",
          opcije: [
            { val: "#ecc94b", lab: "Žuta", hint: "🎯 Topla boja za ugodnu vizuelnu fiksaciju." },
            { val: "#63b3ed", lab: "Plava", hint: "🎯 Umirujuće delovanje na nervni sistem." },
            { val: "#68d391", lab: "Zelena", hint: "🎯 Opuštajući efekat za smanjenje napetosti." }
          ]
        },
        {
          id: "led_rezim", naslov: "Režim rada",
          opcije: [
            { val: "puls", lab: "Pulsirajuće svetlo", hint: "🎯 Privlači pažnju i vežba dinamičko praćenje pogleda." },
            { val: "stalno", lab: "Stalno svetlo", hint: "🎯 Blago, konstantno osvetljenje bez uznemiravanja." }
          ]
        }
      ]
    },
    ponderisano: {
      ikona: "⚖️", naziv: "Ponderisani modul",
      opis: "🏥 <strong>Svrha:</strong> Dodatna težina pruža duboki pritisak (propriocepcija) i umiruje dete.",
      podesavanja: [
        {
          id: "tezina", naslov: "Težina",
          opcije: [
            { val: "200g", lab: "200g (Lako)", hint: "🎯 Blago opterećenje za mlađu decu." },
            { val: "500g", lab: "500g (Srednje)", hint: "🎯 Snažniji umirujući uticaj na senzornu regulaciju." }
          ]
        }
      ]
    }
  };

  // CRTANJE OSNOVE IGRAČKE
  function crtajBazu() {
    slojOsnova.destroyChildren();
    slojElementi.destroyChildren();

    const cX = stage.width() / 2;
    const cY = stage.height() / 2 - 10;
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
      const sirina = 180;
      const visina = 100;

      grupaCelaIgracka.add(new Konva.Ellipse({
        x: cX - sirina / 2, y: cY, radiusX: 20, radiusY: visina / 2,
        fill: "#2d3748", stroke: "#1a202c", strokeWidth: 3
      }));

      const omotac = new Konva.Rect({
        x: cX - sirina / 2, y: cY - visina / 2,
        width: sirina, height: visina,
        stroke: "#1a202c", strokeWidth: 3
      });
      primeniStil(omotac);
      grupaCelaIgracka.add(omotac);

      const prednjiProfil = new Konva.Ellipse({
        x: cX + sirina / 2, y: cY, radiusX: 20, radiusY: visina / 2,
        stroke: "#1a202c", strokeWidth: 3
      });
      primeniStil(prednjiProfil);
      grupaCelaIgracka.add(prednjiProfil);

      grupaCelaIgracka.add(new Konva.Rect({ x: cX - sirina / 2 - 12, y: cY - 18, width: 12, height: 36, fill: "#4a5568", cornerRadius: 4, stroke: "#1a202c", strokeWidth: 2 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX + sirina / 2, y: cY - 18, width: 12, height: 36, fill: "#4a5568", cornerRadius: 4, stroke: "#1a202c", strokeWidth: 2 }));

    } else if (trenutnaBaza === "volan") {
      const prsten = new Konva.Circle({ x: cX, y: cY, radius: 105, stroke: "#1a202c", strokeWidth: 6 });
      primeniStil(prsten);
      grupaCelaIgracka.add(prsten);

      grupaCelaIgracka.add(new Konva.Circle({ x: cX, y: cY, radius: 65, fill: "#f8fafc", stroke: "#1a202c", strokeWidth: 4 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX - 118, y: cY - 30, width: 18, height: 60, fill: "#2d3748", cornerRadius: 6 }));
      grupaCelaIgracka.add(new Konva.Rect({ x: cX + 100, y: cY - 30, width: 18, height: 60, fill: "#2d3748", cornerRadius: 6 }));
    }

    grupaCelaIgracka.on("click tap", (e) => {
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
  }

  // UCRTAVANJE VIZUELNOG OPSEGA (MARKERA) NA KLIK
  function prikaziVizuelniOpseg(x, y) {
    slojOpseg.destroyChildren();

    const targetGroup = new Konva.Group({ x: x, y: y });
    const spoljniKrug = new Konva.Circle({
      radius: 28,
      fill: "rgba(43, 108, 176, 0.25)",
      stroke: "#2b6cb0",
      strokeWidth: 2,
      dash: [4, 4]
    });

    const unutrasnjaTacka = new Konva.Circle({
      radius: 5,
      fill: "#2b6cb0"
    });

    targetGroup.add(spoljniKrug);
    targetGroup.add(unutrasnjaTacka);
    slojOpseg.add(targetGroup);

    // Pulsirajuća animacija opsega
    new Konva.Tween({
      node: spoljniKrug,
      duration: 0.6,
      scaleX: 1.25,
      scaleY: 1.25,
      opacity: 0.4,
      yoyo: true,
      repeat: -1
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

    // Prikazujemo opseg pozicioniranja
    prikaziVizuelniOpseg(x, y);

    const container = document.getElementById("elements-container");
    container.innerHTML = "";

    document.getElementById("trenutna-zona-naslov").innerText = "Izaberite modul za označenu lokaciju";

    Object.keys(elementiUI).forEach(tip => {
      const el = elementiUI[tip];
      const btn = document.createElement("button");
      btn.className = "btn-element";
      btn.innerHTML = `<span class="el-icon">${el.ikona}</span><span class="el-name">${el.naziv}</span>`;
      
      btn.onclick = () => {
        ukloniVizuelniOpseg(); // Uklanjamo privremeni opseg nakon izbora

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

        crtajBazu();
        otvoriPodesavanja(noviObj.id);
      };
      container.appendChild(btn);
    });

    prikaziPanel(2);
  }

  function crtajPostavljeniElement(modulObj) {
    const grupa = new Konva.Group({ x: modulObj.x, y: modulObj.y, cursor: 'pointer', id: `modul-${modulObj.id}` });
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
      pokreniAnimacijuElementa(grupa, tip, opcije);
      otvoriPodesavanja(modulObj.id);
    });

    slojElementi.add(grupa);
  }

  // PRILAGOĐENE ANIMACIJE S USAGLAŠENIM USPORENIM ZVUKOM (KLIK OTPOR)
  function pokreniAnimacijuElementa(grupa, tip, opcije) {
    if (tip === "zvucnik") {
      if (opcije.zvuk_tip === "zvono") {
        reprodukujZvono();
      } else {
        pokreniMelodiju();
      }
      new Konva.Tween({
        node: grupa, duration: 0.35, scaleX: 1.15, scaleY: 1.15, yoyo: true, repeat: 1
      }).play();

    } else if (tip === "zip") {
      reprodukujMehaniku();
      const klizac = grupa.findOne('#zip-klizac');
      if (klizac) {
        new Konva.Tween({
          node: klizac, duration: 0.7, x: 18, yoyo: true
        }).play();
      }

    } else if (tip === "led") {
      const sjaj = grupa.findOne('#led-sjaj');
      if (sjaj) {
        if (opcije.led_rezim === "stalno") {
          new Konva.Tween({
            node: sjaj, duration: 0.5, opacity: 1, yoyo: true
          }).play();
        } else {
          new Konva.Tween({
            node: sjaj, duration: 0.6, radius: 36, opacity: 0.9, yoyo: true, repeat: 1
          }).play();
        }
      }

    } else if (tip === "zupcanik") {
      const zupcanik = grupa.findOne('#fidget-zupcanik');
      if (zupcanik) {
        const trenRot = zupcanik.rotation();

        if (opcije.otpor === "klik") {
          // KLIK OTPOR: Usporena rotacija od 3.5 sec uz sinhronizovano sporo preskakanje zvuka
          const trajanje = 3.5;
          pokreniZvukPreskakanja(trajanje);
          new Konva.Tween({
            node: zupcanik, duration: trajanje, rotation: trenRot + 360, easing: Konva.Easings.Linear
          }).play();
        } else {
          // SLOBODNO: Rotira 4 PUNA KRUGA (1440 deg) BEZ zvuka
          new Konva.Tween({
            node: zupcanik, duration: 2.8, rotation: trenRot + 1440, easing: Konva.Easings.EaseOut
          }).play();
        }
      }

    } else if (tip === "ponderisano") {
      const celaIgracka = slojOsnova.findOne('#cela-igracka-grupa');
      if (celaIgracka) {
        const pomeraj = opcije.tezina === "500g" ? 12 : 6;
        new Konva.Tween({
          node: celaIgracka, duration: 0.8, y: pomeraj, yoyo: true
        }).play();
      }
    }
  }

  function prikaziPanel(nivo) {
    document.getElementById("panel-level-1").style.display = nivo === 1 ? "block" : "none";
    document.getElementById("panel-level-2").style.display = nivo === 2 ? "block" : "none";
    document.getElementById("panel-level-3").style.display = nivo === 3 ? "block" : "none";

    document.getElementById("step-1").classList.toggle("active", nivo === 1);
    document.getElementById("step-2").classList.toggle("active", nivo === 2);
    document.getElementById("step-3").classList.toggle("active", nivo === 3);
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

  // CONTROLS & EVENT HANDLERS
  document.getElementById("btn-back-to-1").onclick = () => {
    ukloniVizuelniOpseg();
    prikaziPanel(1);
  };

  document.getElementById("btn-back-to-2").onclick = () => {
    ukloniVizuelniOpseg();
    prikaziPanel(1);
  };

  document.getElementById("btn-ukloni-element").onclick = () => {
    if (selektovaniElementId) {
      zaustaviMuziku();
      ukloniVizuelniOpseg();
      postavljeniElementi[trenutnaBaza] = postavljeniElementi[trenutnaBaza].filter(i => i.id !== selektovaniElementId);
      selektovaniElementId = null;
      crtajBazu();
      prikaziPanel(1);
    }
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

  document.getElementById("btn-reset").onclick = () => {
    zaustaviMuziku();
    ukloniVizuelniOpseg();
    postavljeniElementi = { meda: [], valjak: [], volan: [] };
    selektovaniElementId = null;
    crtajBazu();
    prikaziPanel(1);
  };

  document.getElementById("btn-save").onclick = () => {
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `medicinska-igracka-${trenutnaBaza}.png`;
    link.href = dataURL;
    link.click();
  };

  crtajBazu();

  window.addEventListener("resize", () => {
    stage.width(containerEl.clientWidth);
    stage.height(containerEl.clientHeight || 500);
    crtajBazu();
  });
});