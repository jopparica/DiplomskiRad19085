document.addEventListener("DOMContentLoaded", () => {
  const containerEl = document.getElementById("konva-container");
  if (!containerEl) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let muzikaTimer = null;
  let sviraMuzika = false;

  // --- ZVUČNE FUNKCIJE ---
  function pokreniMelodiju() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (sviraMuzika) { zaustaviMuziku(); return; }
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
      osc.start(t); osc.stop(t + 0.3);
      idx++; muzikaTimer = setTimeout(odsvirajSledećiTon, 320);
    }
    odsvirajSledećiTon();
  }

  function zaustaviMuziku() { sviraMuzika = false; if (muzikaTimer) clearTimeout(muzikaTimer); }

  function reprodukujZvono() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    [587.33, 880.00].forEach((freq) => {
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t); gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.35);
    });
  }

  function reprodukujMehaniku() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = "sawtooth"; osc.frequency.setValueAtTime(140, t);
    gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.07);
  }

  function kreirajPattern(tip, osnovnaBoja) {
    const pCanvas = document.createElement("canvas");
    const pCtx = pCanvas.getContext("2d");
    if (tip === "plis") {
      pCanvas.width = 16; pCanvas.height = 16;
      pCtx.fillStyle = osnovnaBoja; pCtx.fillRect(0, 0, 16, 16);
      pCtx.fillStyle = "rgba(255, 255, 255, 0.2)"; pCtx.fillRect(2, 2, 4, 4); pCtx.fillRect(10, 10, 4, 4);
    } else if (tip === "silikon") {
      pCanvas.width = 12; pCanvas.height = 12;
      pCtx.fillStyle = osnovnaBoja; pCtx.fillRect(0, 0, 12, 12);
      pCtx.strokeStyle = "rgba(255, 255, 255, 0.35)"; pCtx.lineWidth = 3;
      pCtx.beginPath(); pCtx.moveTo(0, 12); pCtx.lineTo(12, 0); pCtx.stroke();
    } else {
      pCanvas.width = 8; pCanvas.height = 8;
      pCtx.fillStyle = osnovnaBoja; pCtx.fillRect(0, 0, 8, 8);
    }
    return pCanvas;
  }

  // --- KONVA STAGE INIT ---
  const stage = new Konva.Stage({
    container: "konva-container",
    width: containerEl.clientWidth,
    height: containerEl.clientHeight || 540
  });

  const slojOsnova = new Konva.Layer();
  const slojOpseg = new Konva.Layer();
  const slojElementi = new Konva.Layer();
  const slojUputstvo = new Konva.Layer();
  stage.add(slojOsnova); stage.add(slojOpseg); stage.add(slojElementi); stage.add(slojUputstvo);

  // PROFI TRANSFORMER: Održava proporcije i omogućava glatku rotaciju
  const transformer = new Konva.Transformer({
    rotateEnabled: true,
    keepRatio: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315]
  });
  slojElementi.add(transformer);

  let trenutnaBaza = "meda";
  let trenutnaBoja = "#ed8936";
  let trenutniMaterijal = "plis";
  let trenutniNivoKoraka = 1;
  let postavljeniElementi = { meda: [], valjak: [], volan: [] };
  let history = [];
  let historyStep = -1;
  let selektovaniElementId = null;

  function sacuvajStanjeIstorije() {
    history = history.slice(0, historyStep + 1);
    history.push(JSON.stringify(postavljeniElementi));
    historyStep++;
  }

  // --- MEDICINSKA BAZA ELEMENATA (SA RESTRIKCIJAMA) ---
  const elementiUI = {
    // FINA MOTORIKA
    zip: { kategorija: "Fina motorika", ikona: "🧷", naziv: "Zip-mehanizam", opis: "🏥 <strong>Svrha:</strong> Razvoj fine motorike šake.", podesavanja: [{ id: "vrsta_zipa", naslov: "Tip mehanizma", opcije: [{ val: "metal", lab: "Klasični metalni", hint: "🎯 Za preciznije prste." }, { val: "plastika", lab: "Široki plastični", hint: "🎯 Ergonomski." }] }] },
    zupcanik: { kategorija: "Fina motorika", ikona: "⚙️", naziv: "Zupčanik", opis: "🏥 <strong>Svrha:</strong> Taktilno-proprioceptivni unos kroz rotaciju.", podesavanja: [{ id: "otpor", naslov: "Otpor rotacije", opcije: [{ val: "lako", lab: "Slobodno", hint: "🎯 Lako rotiranje." }, { val: "klik", lab: "Klik otpor", hint: "🎯 Usporeno prezubljivanje." }] }] },
    bravica: { kategorija: "Fina motorika", ikona: "🔓", naziv: "Drvena bravica", opis: "🏥 <strong>Svrha:</strong> Rešavanje problema i snaga prstiju.", podesavanja: [{ id: "tip_brave", naslov: "Vrsta reze", opcije: [{ val: "klizna", lab: "Klizna", hint: "🎯 Lako." }, { val: "kukica", lab: "Kukica", hint: "🎯 Srednje." }] }] },
    dugme_pertla: { kategorija: "Fina motorika", ikona: "🧵", naziv: "Dugme i pertla", opis: "🏥 <strong>Svrha:</strong> Učenje vezivanja i pincet hvat.", podesavanja: [{ id: "boja_pertle", naslov: "Boja pertle", opcije: [{ val: "crvena", lab: "Crvena", hint: "🎯 Upadljivo." }, { val: "plava", lab: "Plava", hint: "🎯 Mirno." }] }] },
    // SENZORNA STIMULACIJA
    trake: { kategorija: "Senzorna stimulacija", ikona: "🟨", naziv: "Senzorne omče", opis: "🏥 <strong>Svrha:</strong> Taktilno-vizuelno istraživanje.", podesavanja: [{ id: "boje", naslov: "Paleta boja", opcije: [{ val: "visoki", lab: "Visoki kontrast", hint: "🎯 Za slabovidnost." }, { val: "pastel", lab: "Pastelne boje", hint: "🎯 Umirujuće." }] }] },
    popit: { kategorija: "Senzorna stimulacija", ikona: "🫧", naziv: "Pop-it silikon", opis: "🏥 <strong>Svrha:</strong> Fokus i smirivanje anksioznosti.", podesavanja: [{ id: "oblik", naslov: "Oblik", opcije: [{ val: "krug", lab: "Krug", hint: "🎯 Klasično." }, { val: "kvadrat", lab: "Kvadrat", hint: "🎯 Veća površina." }] }] },
    cicak: { kategorija: "Senzorna stimulacija", ikona: "🩹", naziv: "Čičak traka", opis: "🏥 <strong>Svrha:</strong> Snažan taktilni i auditivni odziv.", podesavanja: [{ id: "jacina", naslov: "Jačina čička", opcije: [{ val: "jako", lab: "Jako", hint: "🎯 Teže povlačenje." }, { val: "slabo", lab: "Slabo", hint: "🎯 Lako povlačenje." }] }] },
    // PERCEPCIJA
    zvucnik: { kategorija: "Auditivna i Vizuelna percepcija", ikona: "🎵", naziv: "Zvučni modul", opis: "🏥 <strong>Svrha:</strong> Zvučna stimulacija i pažnja.", podesavanja: [{ id: "zvuk_tip", naslov: "Zvuk", opcije: [{ val: "melodija", lab: "Dečija melodija", hint: "🎯 Kontinualna stimulacija." }, { val: "zvono", lab: "Dvostruki akord", hint: "🎯 Kratak odziv." }] }] },
    led: { kategorija: "Auditivna i Vizuelna percepcija", ikona: "💡", naziv: "LED Svetlo", opis: "🏥 <strong>Svrha:</strong> Vizuelno praćenje i fiksacija pogleda.", podesavanja: [{ id: "led_boja", naslov: "Boja svetla", opcije: [{ val: "#ecc94b", lab: "Žuta", hint: "🎯 Topla boja." }, { val: "#63b3ed", lab: "Plava", hint: "🎯 Umirujuće." }] }, { id: "led_rezim", naslov: "Režim rada", opcije: [{ val: "puls", lab: "Pulsirajuće", hint: "🎯 Dinamičko praćenje." }, { val: "stalno", lab: "Stalno svetlo", hint: "🎯 Blago osvetljenje." }] }] },
    ogledalo: { kategorija: "Auditivna i Vizuelna percepcija", ikona: "🪞", naziv: "Akrilno ogledalo", opis: "🏥 <strong>Svrha:</strong> Razvoj samosvesti i prepoznavanje emocija.", podesavanja: [{ id: "okvir", naslov: "Boja okvira", opcije: [{ val: "narandzasta", lab: "Narandžasta", hint: "🎯 Stimulišuće." }, { val: "zelena", lab: "Zelena", hint: "🎯 Prirodno." }] }] },
    // FOKUS
    ponderisano: { kategorija: "Fokus i umirenje", ikona: "⚖️", naziv: "Ponderisani modul", opis: "🏥 <strong>Svrha:</strong> Duboki pritisak umiruje dete.", podesavanja: [{ id: "tezina", naslov: "Težina", opcije: [{ val: "200g", lab: "200g (Lako)", hint: "🎯 Blago opterećenje." }, { val: "500g", lab: "500g (Srednje)", hint: "🎯 Snažniji uticaj." }] }] }
  };

  function crtajUputstvo(nivo) {
    if (nivo) trenutniNivoKoraka = nivo;
    slojUputstvo.destroyChildren();
    let naslovTekst = "KORAK 1";
    let poruka = "IZABERITE BAZU, BOJU I MATERIJAL. KLIKNITE NA IGRAČKU ZA DODAVANJE MODULA.";
    if (trenutniNivoKoraka === 2) { naslovTekst = "KORAK 2"; poruka = "ODABERITE SENZORNI MODUL IZ DESNOG MENIJA ZA OVU POZICIJU."; }
    else if (trenutniNivoKoraka === 3) { naslovTekst = "KORAK 3"; poruka = "PRILAGODITE, ROTIRAJTE I PROMENITE VELIČINU MODULA DIREKTNO NA IGRAČKI."; }

    const grupa = new Konva.Group({ y: 14, listening: false });
    const maxSirina = Math.min(stage.width() - 40, 560);
    const txtBadge = new Konva.Text({ text: naslovTekst, fontSize: 12, fontStyle: 'bold', fill: '#ffffff', padding: 5 });
    const badgeBg = new Konva.Rect({ width: txtBadge.width() + 10, height: txtBadge.height() + 4, fill: '#2b6cb0', cornerRadius: 5 });
    const mainText = new Konva.Text({ x: badgeBg.width() + 24, y: 12, text: poruka, fontSize: 13, fontFamily: 'Outfit, sans-serif', fontStyle: 'bold', fill: '#1a202c', width: maxSirina - badgeBg.width() - 40, lineHeight: 1.35 });

    const visinaBoksa = Math.max(badgeBg.height() + 20, mainText.height() + 24);
    const sirinaBoksa = badgeBg.width() + mainText.width() + 44;

    const pozadinaBox = new Konva.Rect({ width: sirinaBoksa, height: visinaBoksa, fill: 'rgba(255, 255, 255, 0.96)', stroke: '#2b6cb0', strokeWidth: 2, cornerRadius: 10, shadowColor: 'black', shadowBlur: 12, shadowOpacity: 0.1, shadowOffset: { x: 0, y: 4 } });
    const vertikalniY = (visinaBoksa - badgeBg.height()) / 2;
    badgeBg.x(12); badgeBg.y(vertikalniY);
    txtBadge.x(12 + (badgeBg.width() - txtBadge.width()) / 2); txtBadge.y(vertikalniY + (badgeBg.height() - txtBadge.height()) / 2);
    mainText.y((visinaBoksa - mainText.height()) / 2);

    grupa.add(pozadinaBox, badgeBg, txtBadge, mainText);
    grupa.x((stage.width() - sirinaBoksa) / 2);
    slojUputstvo.add(grupa); slojUputstvo.batchDraw();
  }

  function crtajBazu() {
    slojOsnova.destroyChildren(); slojElementi.destroyChildren(); slojElementi.add(transformer);
    const cX = stage.width() / 2, cY = stage.height() / 2 + 15;
    const imgPattern = kreirajPattern(trenutniMaterijal, trenutnaBoja);
    const grupaCelaIgracka = new Konva.Group({ id: 'cela-igracka-grupa' });
    const primeniStil = (oblik) => { oblik.fillPriority("pattern"); oblik.fillPatternImage(imgPattern); };

    if (trenutnaBaza === "meda") {
      [new Konva.Circle({ x: cX - 55, y: cY - 105, radius: 25, stroke: "#2d3748", strokeWidth: 3 }), new Konva.Circle({ x: cX + 55, y: cY - 105, radius: 25, stroke: "#2d3748", strokeWidth: 3 }), new Konva.Circle({ x: cX - 65, y: cY + 85, radius: 28, stroke: "#2d3748", strokeWidth: 3 }), new Konva.Circle({ x: cX + 65, y: cY + 85, radius: 28, stroke: "#2d3748", strokeWidth: 3 }), new Konva.Circle({ x: cX, y: cY + 30, radius: 85, stroke: "#2d3748", strokeWidth: 4 }), new Konva.Circle({ x: cX, y: cY - 60, radius: 65, stroke: "#2d3748", strokeWidth: 4 })].forEach(d => { primeniStil(d); grupaCelaIgracka.add(d); });
      grupaCelaIgracka.add(new Konva.Ellipse({ x: cX, y: cY - 48, radiusX: 22, radiusY: 16, fill: "#feebc8", stroke: "#744210", strokeWidth: 2 }), new Konva.Ellipse({ x: cX, y: cY - 55, radiusX: 10, radiusY: 7, fill: "#2d3748" }), new Konva.Circle({ x: cX - 22, y: cY - 72, radius: 6, fill: "#1a202c" }), new Konva.Circle({ x: cX + 22, y: cY - 72, radius: 6, fill: "#1a202c" }));
    } else if (trenutnaBaza === "valjak") {
      const sirina = 200, visina = 110;
      grupaCelaIgracka.add(new Konva.Ellipse({ x: cX - sirina / 2, y: cY, radiusX: 22, radiusY: visina / 2, fill: "#2d3748", stroke: "#1a202c", strokeWidth: 3 }));
      const omotac = new Konva.Rect({ x: cX - sirina / 2, y: cY - visina / 2, width: sirina, height: visina, stroke: "#1a202c", strokeWidth: 3 }); primeniStil(omotac); grupaCelaIgracka.add(omotac);
      const prednjiProfil = new Konva.Ellipse({ x: cX + sirina / 2, y: cY, radiusX: 22, radiusY: visina / 2, stroke: "#1a202c", strokeWidth: 3 }); primeniStil(prednjiProfil); grupaCelaIgracka.add(prednjiProfil);
    } else if (trenutnaBaza === "volan") {
      const prsten = new Konva.Circle({ x: cX, y: cY, radius: 115, stroke: "#1a202c", strokeWidth: 6 }); primeniStil(prsten); grupaCelaIgracka.add(prsten);
      grupaCelaIgracka.add(new Konva.Circle({ x: cX, y: cY, radius: 72, fill: "#f8fafc", stroke: "#1a202c", strokeWidth: 4 }));
    }

    grupaCelaIgracka.on("click tap", () => { otvoriMeniZaNovuTacku(stage.getPointerPosition().x, stage.getPointerPosition().y); });
    slojOsnova.add(grupaCelaIgracka); slojOsnova.batchDraw();

    postavljeniElementi[trenutnaBaza].forEach(item => crtajPostavljeniElement(item));
    slojElementi.batchDraw(); crtajUputstvo(); osveziInventarListu();
  }

  stage.on('click tap', (e) => {
    if (e.target === stage || e.target.hasName('cela-igracka-grupa')) {
      transformer.nodes([]); slojElementi.batchDraw();
    }
  });

  function prikaziVizuelniOpseg(x, y) {
    slojOpseg.destroyChildren();
    const targetGroup = new Konva.Group({ x: x, y: y });
    const spoljniKrug = new Konva.Circle({ radius: 28, fill: "rgba(43, 108, 176, 0.25)", stroke: "#2b6cb0", strokeWidth: 2, dash: [4, 4] });
    targetGroup.add(spoljniKrug, new Konva.Circle({ radius: 5, fill: "#2b6cb0" }));
    slojOpseg.add(targetGroup);
    new Konva.Tween({ node: spoljniKrug, duration: 0.6, scaleX: 1.25, scaleY: 1.25, opacity: 0.4, yoyo: true, repeat: -1 }).play();
    slojOpseg.batchDraw();
  }

  function ukloniVizuelniOpseg() { slojOpseg.destroyChildren(); slojOpseg.batchDraw(); }

  // --- KATEGORIZACIJA I RESTRIKCIJA U MENIJU ---
  function otvoriMeniZaNovuTacku(x, y) {
    window.tempKlikX = x; window.tempKlikY = y;
    prikaziVizuelniOpseg(x, y);

    const container = document.getElementById("elements-container");
    container.innerHTML = "";

    // Grupisanje elemenata iz objekta
    const kategorije = {};
    Object.keys(elementiUI).forEach(tip => {
      const el = elementiUI[tip];
      if (!kategorije[el.kategorija]) kategorije[el.kategorija] = [];
      kategorije[el.kategorija].push({ tip, ...el });
    });

    Object.keys(kategorije).forEach(katIme => {
      const katDiv = document.createElement("div");
      katDiv.className = "kategorija-sekcija";
      katDiv.innerHTML = `<h5 class="kategorija-naslov">${katIme}</h5>`;

      const gridDiv = document.createElement("div");
      gridDiv.className = "elementi-grid-unutrasnji";

      kategorije[katIme].forEach(el => {
        const btn = document.createElement("button");
        btn.className = "btn-element";
        btn.innerHTML = `<span class="el-icon">${el.ikona}</span><span class="el-name">${el.naziv}</span>`;

        btn.onclick = () => {
          // PROVERA: Ograničenje od 1 elementa po grupi
          const postavljeni = postavljeniElementi[trenutnaBaza];
          const konflikt = postavljeni.find(p => elementiUI[p.tip].kategorija === el.kategorija);

          if (konflikt) {
            alert(`⚠️ Restrikcija dizajna!\n\nVeć ste ugradili element iz grupe "${el.kategorija}" (${elementiUI[konflikt.tip].naziv}).\n\nRadi sprečavanja senzorne preopterećenosti, dozvoljen je samo 1 element po funkcionalnoj grupi. Uklonite postojeći da biste dodali novi.`);
            return;
          }

          ukloniVizuelniOpseg();
          const podrazumevano = {};
          if (el.podesavanja) el.podesavanja.forEach(p => { podrazumevano[p.id] = p.opcije[0].val; });

          const noviObj = {
            id: Date.now(), x: window.tempKlikX, y: window.tempKlikY, tip: el.tip, opcije: podrazumevano,
            scaleX: 1, scaleY: 1, rotation: 0 // Inicijalna transformacija
          };

          postavljeniElementi[trenutnaBaza].push(noviObj);
          selektovaniElementId = noviObj.id;
          sacuvajStanjeIstorije(); crtajBazu(); otvoriPodesavanja(noviObj.id);
        };
        gridDiv.appendChild(btn);
      });
      katDiv.appendChild(gridDiv);
      container.appendChild(katDiv);
    });

    prikaziPanel(2);
  }

  function crtajPostavljeniElement(modulObj) {
    const grupa = new Konva.Group({
      x: modulObj.x, y: modulObj.y, draggable: true, id: `modul-${modulObj.id}`,
      rotation: modulObj.rotation || 0, scaleX: modulObj.scaleX || 1, scaleY: modulObj.scaleY || 1
    });

    const tip = modulObj.tip; const opcije = modulObj.opcije || {};

    if (tip === "zvucnik") {
      grupa.add(new Konva.Circle({ radius: 26, fill: '#6b46c1', stroke: '#322659', strokeWidth: 3 }));
      grupa.add(new Konva.Circle({ radius: 16, fill: '#9f7aea', stroke: '#553c9a', strokeWidth: 2 }));
      grupa.add(new Konva.Text({ text: '🎵', fontSize: 16, x: -8, y: -8 }));
    } else if (tip === "zip") {
      grupa.add(new Konva.Rect({ x: -35, y: -10, width: 70, height: 20, fill: opcije.vrsta_zipa === "plastika" ? '#3182ce' : '#4a5568', cornerRadius: 4, stroke: '#1a202c', strokeWidth: 2 }));
      for (let i = -28; i <= 28; i += 7) grupa.add(new Konva.Rect({ x: i, y: -8, width: 3, height: 16, fill: '#cbd5e0' }));
      grupa.add(new Konva.Rect({ x: -25, y: -12, width: 14, height: 24, fill: '#e2e8f0', cornerRadius: 3, stroke: '#1a202c', strokeWidth: 1.5, id: 'zip-klizac' }));
    } else if (tip === "led") {
      const boja = opcije.led_boja || '#ecc94b';
      grupa.add(new Konva.Circle({ radius: 24, fill: boja, opacity: opcije.led_rezim === "stalno" ? 0.85 : 0.35, id: 'led-sjaj' }));
      grupa.add(new Konva.Circle({ radius: 16, fill: boja, stroke: '#d69e2e', strokeWidth: 3 }));
    } else if (tip === "zupcanik") {
      const zup = new Konva.Group({ id: 'fidget-zupcanik' });
      zup.add(new Konva.Circle({ radius: 22, fill: '#c53030', stroke: '#742a2a', strokeWidth: 3 }));
      for (let a = 0; a < 360; a += 45) {
        const rad = (a * Math.PI) / 180;
        zup.add(new Konva.Rect({ x: Math.cos(rad) * 20 - 4, y: Math.sin(rad) * 20 - 4, width: 8, height: 8, fill: '#742a2a', cornerRadius: 2 }));
      }
      zup.add(new Konva.Circle({ radius: 10, fill: '#ffffff', stroke: '#2d3748', strokeWidth: 2 }));
      grupa.add(zup);
    } else if (tip === "trake") {
      const trakeGrupa = new Konva.Group({ id: 'trake-telo' });
      const boje = opcije.boje === "pastel" ? ['#fbb6ce', '#faf089', '#90cdf4', '#9ae6b4'] : ['#e53e3e', '#ecc94b', '#3182ce', '#38a169'];
      boje.forEach((b, i) => { trakeGrupa.add(new Konva.Rect({ x: -20 + i * 10, y: -18, width: 8, height: 36, fill: b, cornerRadius: 4, stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1 })); });
      grupa.add(trakeGrupa);
    } else if (tip === "ponderisano") {
      const jeVeliko = opcije.tezina === "500g";
      grupa.add(new Konva.Rect({ x: -(jeVeliko ? 37 : 28), y: -(jeVeliko ? 16 : 12), width: jeVeliko ? 74 : 56, height: jeVeliko ? 32 : 24, fill: '#2d3748', cornerRadius: 6, stroke: '#1a202c', strokeWidth: 3 }));
      grupa.add(new Konva.Text({ text: opcije.tezina || "200g", fontSize: jeVeliko ? 12 : 10, fontStyle: 'bold', fill: '#ffffff', x: jeVeliko ? -16 : -12, y: -5 }));
    } else if (tip === "bravica") {
      grupa.add(new Konva.Rect({ x: -30, y: -15, width: 60, height: 30, fill: '#ecc94b', cornerRadius: 4, stroke: '#b7791f', strokeWidth: 2 }));
      grupa.add(new Konva.Rect({ x: -10, y: -5, width: 40, height: 10, fill: '#718096', cornerRadius: 2 }));
      grupa.add(new Konva.Circle({ x: 20, y: 0, radius: 8, fill: '#2d3748' }));
    } else if (tip === "dugme_pertla") {
      grupa.add(new Konva.Circle({ radius: 25, fill: '#ebf8ff', stroke: '#3182ce', strokeWidth: 4 }));
      grupa.add(new Konva.Circle({ x: -8, y: 0, radius: 5, fill: '#2d3748' }), new Konva.Circle({ x: 8, y: 0, radius: 5, fill: '#2d3748' }));
      grupa.add(new Konva.Line({ points: [-8, 0, 0, 15, 8, 0], stroke: opcije.boja_pertle === 'crvena' ? '#e53e3e' : '#3182ce', strokeWidth: 3, tension: 0.5 }));
    } else if (tip === "popit") {
      grupa.add(new Konva.Rect({ x: -25, y: -25, width: 50, height: 50, fill: '#9ae6b4', cornerRadius: opcije.oblik === 'krug' ? 25 : 8, stroke: '#38a169', strokeWidth: 2 }));
      const popBoje = ['#f56565', '#ed8936', '#4299e1', '#9f7aea'];
      for (let i = 0; i < 4; i++) grupa.add(new Konva.Circle({ x: (i % 2 === 0) ? -10 : 10, y: (i < 2) ? -10 : 10, radius: 8, fill: popBoje[i] }));
    } else if (tip === "cicak") {
      grupa.add(new Konva.Rect({ x: -20, y: -30, width: 40, height: 60, fill: '#e2e8f0', cornerRadius: 4, stroke: '#cbd5e0', strokeWidth: 2 }));
      [-20, 0, 20].forEach(y => grupa.add(new Konva.Line({ points: [-10, y, 10, y], stroke: '#718096', strokeWidth: 2, dash: [4, 4] })));
    } else if (tip === "ogledalo") {
      grupa.add(new Konva.Circle({ radius: 30, fill: '#e2e8f0', stroke: opcije.okvir === 'zelena' ? '#48bb78' : '#ed8936', strokeWidth: 6 }));
      grupa.add(new Konva.Ellipse({ x: -8, y: -8, radiusX: 10, radiusY: 5, fill: 'rgba(255,255,255,0.8)', rotation: -45 }));
    }

    grupa.on("click tap", (e) => {
      e.cancelBubble = true; ukloniVizuelniOpseg(); selektovaniElementId = modulObj.id;
      transformer.nodes([grupa]); slojElementi.batchDraw();
      pokreniAnimacijuElementa(grupa, tip, opcije); otvoriPodesavanja(modulObj.id);
    });

    // ČUVANJE NOVIH VREDNOSTI ZA SCALIRANJE I ROTACIJU
    grupa.on("dragend transformend", () => {
      modulObj.x = grupa.x(); modulObj.y = grupa.y();
      modulObj.rotation = grupa.rotation();
      modulObj.scaleX = grupa.scaleX(); modulObj.scaleY = grupa.scaleY();
      sacuvajStanjeIstorije();
    });

    slojElementi.add(grupa);
    if (selektovaniElementId === modulObj.id) transformer.nodes([grupa]);
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
    if (trNiz.length === 0) { listEl.innerHTML = '<li class="empty-inventory">Nema dodatih modula. Kliknite na igračku za dodavanje.</li>'; return; }

    trNiz.forEach(item => {
      const data = elementiUI[item.tip];
      const li = document.createElement("li");
      li.className = "inventory-item";
      li.innerHTML = `<span>${data.ikona} ${data.naziv}</span><button class="inventory-item-remove" title="Ukloni modul">✕</button>`;
      li.querySelector(".inventory-item-remove").onclick = (e) => { e.stopPropagation(); ukloniElementById(item.id); };
      li.onclick = () => {
        selektovaniElementId = item.id;
        const g = slojElementi.findOne(`#modul-${item.id}`);
        if (g) { transformer.nodes([g]); slojElementi.batchDraw(); }
        otvoriPodesavanja(item.id);
      };
      listEl.appendChild(li);
    });
  }

  function ukloniElementById(id) {
    zaustaviMuziku(); ukloniVizuelniOpseg(); transformer.nodes([]);
    postavljeniElementi[trenutnaBaza] = postavljeniElementi[trenutnaBaza].filter(i => i.id !== id);
    if (selektovaniElementId === id) selektovaniElementId = null;
    sacuvajStanjeIstorije(); crtajBazu(); prikaziPanel(1);
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
        const grupa = document.createElement("div"); grupa.className = "fine-tuning-group";
        const label = document.createElement("label"); label.innerText = p.naslov + ":"; grupa.appendChild(label);
        const tuneOpts = document.createElement("div"); tuneOpts.className = "tune-options";
        const hintBox = document.createElement("div"); hintBox.className = "sub-option-hint";
        const osveziHint = (val) => {
          const optObj = p.opcije.find(o => o.val === val);
          if (optObj && optObj.hint) { hintBox.innerHTML = optObj.hint; hintBox.style.display = "block"; } else hintBox.style.display = "none";
        };
        const trenVal = elObj.opcije[p.id] || p.opcije[0].val;
        p.opcije.forEach(o => {
          const btn = document.createElement("button");
          btn.className = "tune-btn"; if (trenVal === o.val) btn.classList.add("active"); btn.innerText = o.lab;
          btn.onclick = () => {
            tuneOpts.querySelectorAll(".tune-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active"); elObj.opcije[p.id] = o.val; osveziHint(o.val); sacuvajStanjeIstorije(); crtajBazu();
          };
          tuneOpts.appendChild(btn);
        });
        grupa.appendChild(tuneOpts); grupa.appendChild(hintBox); container.appendChild(grupa);
        osveziHint(trenVal);
      });
    }
    prikaziPanel(3);
  }

  function pokreniAnimacijuElementa(grupa, tip, opcije) {
    if (tip === "zvucnik") { if (opcije.zvuk_tip === "zvono") reprodukujZvono(); else pokreniMelodiju(); new Konva.Tween({ node: grupa, duration: 0.35, scaleX: grupa.scaleX() * 1.15, scaleY: grupa.scaleY() * 1.15, yoyo: true, repeat: 1 }).play(); }
    else if (tip === "zip") { reprodukujMehaniku(); const klizac = grupa.findOne('#zip-klizac'); if (klizac) new Konva.Tween({ node: klizac, duration: 0.7, x: 18, yoyo: true }).play(); }
    else if (tip === "led") { const sjaj = grupa.findOne('#led-sjaj'); if (sjaj) { if (opcije.led_rezim === "stalno") new Konva.Tween({ node: sjaj, duration: 0.5, opacity: 1, yoyo: true }).play(); else new Konva.Tween({ node: sjaj, duration: 0.6, radius: 36, opacity: 0.9, yoyo: true, repeat: 1 }).play(); } }
    else if (tip === "zupcanik") { const zupcanik = grupa.findOne('#fidget-zupcanik'); if (zupcanik) { const trenRot = zupcanik.rotation(); if (opcije.otpor === "klik") { reprodukujMehaniku(); new Konva.Tween({ node: zupcanik, duration: 1.5, rotation: trenRot + 360, easing: Konva.Easings.Linear }).play(); } else { new Konva.Tween({ node: zupcanik, duration: 2.8, rotation: trenRot + 1440, easing: Konva.Easings.EaseOut }).play(); } } }
    else if (tip === "ponderisano") { const celaIgracka = slojOsnova.findOne('#cela-igracka-grupa'); if (celaIgracka) { const pomeraj = opcije.tezina === "500g" ? 12 : 6; new Konva.Tween({ node: celaIgracka, duration: 0.8, y: pomeraj, yoyo: true }).play(); } }
  }

  // --- BUTTON EVENTS ---
  document.getElementById("btn-back-to-1").onclick = () => { ukloniVizuelniOpseg(); prikaziPanel(1); };
  document.getElementById("btn-back-to-2").onclick = () => { ukloniVizuelniOpseg(); prikaziPanel(1); };
  document.getElementById("btn-ukloni-element").onclick = () => { if (selektovaniElementId) ukloniElementById(selektovaniElementId); };
  document.getElementById("btn-test-element").onclick = () => { if (selektovaniElementId) { const elObj = postavljeniElementi[trenutnaBaza].find(i => i.id === selektovaniElementId); if (elObj) { const grupa = slojElementi.findOne(`#modul-${elObj.id}`); if (grupa) pokreniAnimacijuElementa(grupa, elObj.tip, elObj.opcije); } } };

  document.querySelectorAll(".btn-base").forEach(btn => {
    btn.onclick = () => { zaustaviMuziku(); ukloniVizuelniOpseg(); transformer.nodes([]); document.querySelectorAll(".btn-base").forEach(b => b.classList.remove("active")); btn.classList.add("active"); trenutnaBaza = btn.dataset.base; crtajBazu(); prikaziPanel(1); };
  });
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => { document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); trenutnaBoja = btn.dataset.color; crtajBazu(); };
  });
  document.querySelectorAll(".btn-global-texture").forEach(btn => {
    btn.onclick = () => { document.querySelectorAll(".btn-global-texture").forEach(b => b.classList.remove("active")); btn.classList.add("active"); trenutniMaterijal = btn.dataset.texture; const descBox = document.getElementById("material-description"); if (descBox) descBox.innerHTML = opisMaterijala[trenutniMaterijal]; crtajBazu(); };
  });

  document.getElementById("btn-undo").onclick = () => { if (historyStep > 0) { historyStep--; postavljeniElementi = JSON.parse(history[historyStep]); crtajBazu(); } };
  document.getElementById("btn-redo").onclick = () => { if (historyStep < history.length - 1) { historyStep++; postavljeniElementi = JSON.parse(history[historyStep]); crtajBazu(); } };
  document.getElementById("btn-reset").onclick = () => { if (confirm("Da li ste sigurni da želite da resetujete sve izmene na igrački?")) { zaustaviMuziku(); ukloniVizuelniOpseg(); transformer.nodes([]); postavljeniElementi = { meda: [], valjak: [], volan: [] }; selektovaniElementId = null; sacuvajStanjeIstorije(); crtajBazu(); prikaziPanel(1); } };

  const btnPreview = document.getElementById("btn-preview"), btnExitPreview = document.getElementById("btn-exit-preview"), previewModal = document.getElementById("preview-modal"), previewModalImg = document.getElementById("preview-modal-img");
  btnPreview.onclick = () => { transformer.nodes([]); slojUputstvo.hide(); stage.batchDraw(); previewModalImg.src = stage.toDataURL({ pixelRatio: 2 }); previewModal.style.display = "flex"; slojUputstvo.show(); stage.batchDraw(); };
  btnExitPreview.onclick = () => { previewModal.style.display = "none"; };
  document.getElementById("btn-save").onclick = () => { transformer.nodes([]); slojUputstvo.hide(); stage.batchDraw(); const link = document.createElement("a"); link.download = `medicinska-igracka-${trenutnaBaza}.png`; link.href = stage.toDataURL({ pixelRatio: 2 }); link.click(); slojUputstvo.show(); stage.batchDraw(); };

  sacuvajStanjeIstorije(); crtajBazu(); prikaziPanel(1);
  window.addEventListener("resize", () => { stage.width(containerEl.clientWidth); stage.height(containerEl.clientHeight || 540); crtajBazu(); });
});