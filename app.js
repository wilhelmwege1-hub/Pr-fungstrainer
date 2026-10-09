/* Prüfungstrainer Bankkaufmann – Oberfläche, Lernstand, Training (mobil zuerst).
   Inhalte kommen aus inhalte/*.js (Format: inhalte/FORMAT.md). */
(function () {
  'use strict';

  const LP = window.LP || {};
  const INHALTE = LP.inhalte || {};
  // Wo läuft die Seite? 'claude' = Claude-Link (Konto-Speicher), 'web' = installierbare App, 'datei' = Offline-Datei
  const APP_URL = 'https://wilhelmwege1-hub.github.io/Pr-fungstrainer/';
  const UMGEBUNG = window.claude && typeof window.claude.use === 'function' ? 'claude' : (window.LP_OFFLINE_DATEI ? 'datei' : 'web');
  const ALS_APP = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Nachträge (inhalte/lfX-teil2.js) an die Themenliste des Lernfelds anhängen, ohne doppelte IDs.
  Object.keys(LP.nachtrag || {}).forEach(id => {
    const ziel = INHALTE[id];
    if (!ziel) return;
    const da = new Set(ziel.themen.map(t => t.id));
    (LP.nachtrag[id] || []).forEach(t => { if (t && t.id && !da.has(t.id)) { ziel.themen.push(t); da.add(t.id); } });
  });

  // Rückfall, falls inhalte/lernfelder.js fehlt (KMK-Rahmenlehrplan 2020).
  const LF_FALLBACK = [
    [1, 'Die eigene Rolle im Betrieb und im Wirtschaftsleben mitgestalten', 1],
    [2, 'Konten für Privatkunden führen und den Zahlungsverkehr abwickeln', 1],
    [3, 'Konten für Geschäfts- und Firmenkunden führen und den Zahlungsverkehr abwickeln', 1],
    [4, 'Kunden über Anlagen auf Konten und staatlich gefördertes Sparen beraten', 1],
    [5, 'Allgemein-Verbraucherdarlehensverträge abschließen', 1],
    [6, 'Marktmodelle anwenden', 2],
    [7, 'Werteströme und Geschäftsprozesse erfassen und dokumentieren', 2],
    [8, 'Kunden über die Anlage in Finanzinstrumenten beraten', 2],
    [9, 'Baufinanzierungen abschließen', 2],
    [10, 'Gesamtwirtschaftliche Einflüsse analysieren und beurteilen', 3],
    [11, 'Wertschöpfungsprozesse erfolgsorientiert steuern', 3],
    [12, 'Kunden über Produkte der Vorsorge und Absicherung informieren', 3],
    [13, 'Finanzierungen für Geschäfts- und Firmenkunden abschließen', 3]
  ].map(([nr, titel, jahr]) => ({ nr, titel, jahr, stunden: null, kern: '', themen: [], pruefung: '' }));

  const LERNFELDER = (Array.isArray(LP.lernfelder) && LP.lernfelder.length ? LP.lernfelder : LF_FALLBACK)
    .slice().sort((a, b) => a.nr - b.nr);
  const lfByNr = nr => LERNFELDER.find(l => l.nr === nr);
  const inhalt = nr => INHALTE['lf' + nr] || null;

  // ---------- Hilfen ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtDatum = d => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const plural = (n, ein, mehr) => n + ' ' + (n === 1 ? ein : mehr);
  const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weich = () => (ruhig() ? 'auto' : 'smooth');
  const PFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  function ring(p, done) {
    const r = 15, c = 2 * Math.PI * r, off = c * (1 - p / 100);
    return `<svg class="ring${done ? ' done' : ''}" viewBox="0 0 38 38" role="img" aria-label="${p} Prozent"><circle class="bg" cx="19" cy="19" r="${r}"/><circle class="fg" cx="19" cy="19" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/><text x="19" y="19">${p}</text></svg>`;
  }
  function bar(p, cls) { return `<div class="bar ${cls || ''}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>`; }

  let toastTimer;
  function toast(text) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
  }

  // ---------- Lernstand ----------
  // Ein Dokument je Lernfeld (lf1 … lf13) plus "allgemein". Jedes trägt einen Zeitstempel t;
  // beim Abgleich gewinnt das neuere Dokument.
  const STORE_KEY = 'bk-pruefungstrainer-v1';
  const leeresLF = () => ({ t: 0, ziele: {}, notiz: {}, aufg: {}, quiz: {}, rlp: {} });
  const leeresAllg = () => ({ t: 0, datum: '', zuletzt: '', karten: {}, fehler: {} });
  let docs = {};
  try { docs = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { docs = {}; }
  function doc(id) {
    if (!docs[id] || typeof docs[id] !== 'object') docs[id] = id === 'allgemein' ? leeresAllg() : leeresLF();
    const d = docs[id], base = id === 'allgemein' ? leeresAllg() : leeresLF();
    Object.keys(base).forEach(k => { if (d[k] === undefined || d[k] === null) d[k] = base[k]; });
    return d;
  }
  function saveLocal() { try { localStorage.setItem(STORE_KEY, JSON.stringify(docs)); } catch (e) { /* privates Fenster o. Ä. */ } }

  let db = null, uid = null;
  const pending = {}; let flushTimer = null;
  function touch(id) {
    doc(id).t = Date.now();
    saveLocal();
    if (db && uid) { pending[id] = true; clearTimeout(flushTimer); flushTimer = setTimeout(flush, 900); setSync('busy'); }
  }
  async function flush() {
    clearTimeout(flushTimer);
    const ids = Object.keys(pending); ids.forEach(id => delete pending[id]);
    if (!ids.length || !db) return;
    try {
      for (const id of ids) await db.collection('data/users/' + uid).doc(id).set(JSON.parse(JSON.stringify(docs[id])));
      setSync('sync');
    } catch (e) {
      if (e && e.code === 'unavailable') { ids.forEach(id => { pending[id] = true; }); flushTimer = setTimeout(flush, 2500 + Math.random() * 1500); }
      else setSync('lokal');
    }
  }
  let syncZustand = 'lokal';
  function setSync(s) {
    if (s) syncZustand = s;
    const el = $('#sync'); if (!el) return;
    const offline = navigator.onLine === false;
    if (UMGEBUNG !== 'claude') {
      el.dataset.s = offline ? 'busy' : 'geraet';
      el.textContent = offline ? 'offline' : 'dieses Gerät';
      el.title = 'Dein Lernstand liegt auf diesem Gerät. Tippen für App, Offline und Übertragen.';
      return;
    }
    el.dataset.s = syncZustand;
    el.textContent = syncZustand === 'sync' ? 'gespeichert' : syncZustand === 'busy' ? 'speichert …' : 'nur lokal';
    el.title = syncZustand === 'lokal' ? 'Dein Lernstand liegt im Browser dieses Geräts.' : 'Dein Lernstand wird privat in deinem Claude-Konto gespeichert – auf Handy und PC gleich.';
  }
  window.addEventListener('online', () => setSync());
  window.addEventListener('offline', () => setSync());
  // Holt neuere Stände aus dem Konto (beim Start und wenn die App wieder in den Vordergrund kommt).
  async function pull() {
    if (!db || !uid) return false;
    const snap = await db.collection('data/users/' + uid).get();
    const remote = {};
    snap.docs.forEach(s => { const v = s.data(); if (v) remote[s.id] = v; });
    let changed = false;
    Object.keys(remote).forEach(k => {
      if (!docs[k] || (remote[k].t || 0) > (docs[k].t || 0)) { docs[k] = remote[k]; changed = true; }
    });
    Object.keys(docs).forEach(k => { if ((docs[k].t || 0) > ((remote[k] && remote[k].t) || 0)) pending[k] = true; });
    saveLocal();
    return changed;
  }
  function neuZeichnenNachAbgleich() {
    const r = parseRoute(route());
    const tippt = document.activeElement && document.activeElement.matches('textarea, input');
    if (!tippt && r.view !== 'training') render('keep');
  }
  async function initSync() {
    try {
      if (!window.claude || typeof window.claude.use !== 'function') return setSync('lokal');
      const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!d || !u) return setSync('lokal');
      const id = await u.id();
      if (!id) return setSync('lokal');
      db = d; uid = id;
      setSync('busy');
      const changed = await pull();
      if (Object.keys(pending).length) await flush(); else setSync('sync');
      if (changed) neuZeichnenNachAbgleich();
    } catch (e) { db = null; setSync('lokal'); }
  }

  // ---------- Fortschritt berechnen ----------
  function themaStand(nr, th) {
    const d = doc('lf' + nr);
    const zZiel = (th.lernziele || []).length;
    const zOk = (th.lernziele || []).filter((_, i) => d.ziele[th.id + '__' + i]).length;
    const aGes = (th.aufgaben || []).length;
    const aOk = (th.aufgaben || []).filter((_, i) => d.aufg[th.id + '__' + i] === 'ok').length;
    const q = d.quiz[th.id] || null;
    const qGes = (th.quiz || []).length;
    // Gewichtung: Lernziele 50 %, Aufgaben 25 %, Quiz 25 %
    const teile = [], gew = [];
    if (zZiel) { teile.push(zOk / zZiel); gew.push(.5); }
    if (aGes) { teile.push(aOk / aGes); gew.push(.25); }
    if (qGes) { teile.push(q ? Math.min(q.best || 0, qGes) / qGes : 0); gew.push(.25); }
    const gs = gew.reduce((a, b) => a + b, 0) || 1;
    const p = Math.round(teile.reduce((s, v, i) => s + v * gew[i], 0) / gs * 100);
    return { zZiel, zOk, aGes, aOk, qGes, qBest: q ? q.best : null, qLetzt: q ? q.letzt : null, p, notiz: !!(d.notiz[th.id] || '').trim() };
  }
  function lfStand(nr) {
    const inh = inhalt(nr);
    if (inh) {
      const st = inh.themen.map(t => themaStand(nr, t));
      const p = st.length ? Math.round(st.reduce((s, x) => s + x.p, 0) / st.length) : 0;
      return { p, ziele: st.reduce((s, x) => s + x.zOk, 0), zieleGes: st.reduce((s, x) => s + x.zZiel, 0), themen: st.length, fertig: st.filter(x => x.p >= 100).length };
    }
    const lf = lfByNr(nr);
    const ges = (lf && lf.themen || []).length, d = doc('lf' + nr);
    const ok = (lf && lf.themen || []).filter((_, i) => d.rlp[i]).length;
    return { p: pct(ok, ges), ziele: ok, zieleGes: ges, themen: 0, fertig: 0 };
  }
  function gesamtStand() {
    let ziele = 0, ges = 0, aOk = 0, aGes = 0, qR = 0, qN = 0;
    LERNFELDER.forEach(lf => {
      const inh = inhalt(lf.nr);
      if (!inh) return;
      inh.themen.forEach(t => {
        const s = themaStand(lf.nr, t);
        ziele += s.zOk; ges += s.zZiel; aOk += s.aOk; aGes += s.aGes;
        if (s.qBest != null) { qR += s.qBest; qN += s.qGes; }
      });
    });
    return { ziele, ges, aOk, aGes, qR, qN };
  }

  // ---------- Router ----------
  // Adressen: #start, #training, #begriffe, #pruefung, #lf10, #lf10-konjunktur, #lf10-konjunktur.quiz
  const main = $('#main');
  let quizSitzung = null;   // Training: laufendes Quiz
  let kartenSitzung = null; // Training: Karteikarten
  let simSitzung = null;    // Training: Prüfungssimulation
  let simTimer = null;
  let trainingModus = 'quiz';
  let trainingFilter = 'alle';
  let glossarSuche = '';
  let glossarModus = 'begriffe';
  let letzteRoute = null;

  function route() { return decodeURIComponent((location.hash || '#start').slice(1)) || 'start'; }
  function parseRoute(h) {
    if (h === 'training' || h === 'begriffe' || h === 'pruefung' || h === 'daten') return { view: h };
    const m = h.match(/^lf(\d{1,2})(?:-([a-z0-9-]+))?(?:\.([a-z]+))?$/);
    if (m && lfByNr(+m[1])) {
      const nr = +m[1];
      if (m[2] && inhalt(nr)) {
        const th = inhalt(nr).themen.find(t => t.id === m[2]);
        if (th) return { view: 'thema', nr, th, tab: m[3] || 'lernen' };
      }
      return { view: 'lf', nr };
    }
    return { view: 'start' };
  }
  const topHoehe = () => ($('.top') ? $('.top').offsetHeight : 54);

  // mode: 'nav' = neue Seite (nach oben), 'tab' = Reiterwechsel, 'keep' = an Ort und Stelle neu zeichnen
  function render(mode) {
    const r = parseRoute(route());
    let html = '', nav = 'start';
    clearInterval(simTimer);
    if ($('.zoom')) zoomZu(true);
    if (r.view === 'training') { html = viewTraining(); nav = 'training'; }
    else if (r.view === 'begriffe') { html = viewBegriffe(); nav = 'begriffe'; }
    else if (r.view === 'pruefung') { html = viewPruefung(); nav = 'pruefung'; }
    else if (r.view === 'daten') { html = viewDaten(); nav = 'daten'; }
    else if (r.view === 'thema') {
      const tabs = themaTabs(r.nr, r.th);
      if (!tabs.find(t => t.id === r.tab)) r.tab = 'lernen';
      html = viewThema(r.nr, r.th, r.tab, tabs);
      const allg = doc('allgemein'), z = 'lf' + r.nr + '-' + r.th.id;
      if (allg.zuletzt !== z) { allg.zuletzt = z; saveLocal(); }
    }
    else if (r.view === 'lf') html = viewLF(r.nr);
    else html = viewStart();
    main.innerHTML = html;
    kopfzeile(r);
    $$('[data-nav]').forEach(a => { if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const titel = $('h1', main);
    document.title = (titel && r.view !== 'start' ? titel.textContent.trim() + ' · ' : '') + 'Prüfungstrainer Bankkaufmann';
    if (mode === 'tab') {
      const anker = $('#tabs-anker');
      if (anker) {
        const gap = parseFloat(getComputedStyle(anker.parentElement.parentElement).rowGap) || 0;
        const y = anker.getBoundingClientRect().bottom + window.scrollY + gap - topHoehe();
        if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
      }
    } else if (mode !== 'keep') window.scrollTo(0, 0);
    letzteRoute = r;
    afterRender(r);
  }
  window.addEventListener('hashchange', () => render('nav'));

  function kopfzeile(r) {
    const back = $('#zurueck'), bt = $('#zurueck-text'), tt = $('#top-titel');
    let sub = true;
    if (r.view === 'thema') {
      const inh = inhalt(r.nr), idx = inh.themen.indexOf(r.th);
      back.href = '#lf' + r.nr; bt.textContent = 'LF ' + r.nr; tt.textContent = `Thema ${idx + 1} von ${inh.themen.length}`;
    } else if (r.view === 'lf') {
      back.href = '#start'; bt.textContent = 'Übersicht'; tt.textContent = 'Lernfeld ' + r.nr;
    } else if (r.view === 'daten') {
      back.href = '#start'; bt.textContent = 'Übersicht'; tt.textContent = 'App & Daten';
    } else { sub = false; tt.textContent = ''; }
    back.hidden = !sub;
    document.body.classList.toggle('sub', sub);
  }

  // ---------- Ansicht: Start ----------
  function viewStart() {
    const g = gesamtStand();
    const allg = doc('allgemein');
    let countdown;
    if (allg.datum) {
      const tage = Math.ceil((new Date(allg.datum + 'T08:00:00') - new Date()) / 864e5);
      countdown = tage >= 0 ? `Noch <strong class="mono">${tage}</strong> ${tage === 1 ? 'Tag' : 'Tage'} bis zur Prüfung` : 'Der eingetragene Prüfungstermin liegt in der Vergangenheit.';
    } else countdown = 'Trag deinen Prüfungstermin ein, dann zählen wir die Tage runter.';
    const ausgearbeitet = LERNFELDER.filter(l => inhalt(l.nr));
    let weiter = '';
    const z = allg.zuletzt && allg.zuletzt.match(/^lf(\d+)-([a-z0-9-]+)$/);
    const weiterLink = (href, label, titel) => `<a class="weiter" href="${href}"><div style="display:grid;gap:2px;min-width:0"><span class="label">${label}</span><strong>${esc(titel)}</strong></div><span class="pfeil">${PFEIL}</span></a>`;
    if (z && inhalt(+z[1])) {
      const th = inhalt(+z[1]).themen.find(t => t.id === z[2]);
      if (th) weiter = weiterLink('#' + esc(allg.zuletzt), 'Weiterlernen · LF ' + z[1], th.titel);
    }
    if (!weiter && ausgearbeitet.length) {
      const lf = ausgearbeitet[0], th = inhalt(lf.nr).themen[0];
      weiter = weiterLink(`#lf${lf.nr}-${esc(th.id)}`, 'Einstieg · LF ' + lf.nr, th.titel);
    }
    // Heute dran: Fehler, markierte Aufgaben, schwächste Themen
    const fehlerAnz = Object.keys(allg.fehler).length;
    let nochmal = 0; const schwach = [];
    ausgearbeitet.forEach(lf => {
      const d = doc('lf' + lf.nr);
      nochmal += Object.values(d.aufg).filter(v => v === 'nochmal').length;
      inhalt(lf.nr).themen.forEach(t => schwach.push({ lf: lf.nr, t, p: themaStand(lf.nr, t).p }));
    });
    const top = schwach.filter(x => x.p < 100).sort((a, b) => a.p - b.p).slice(0, 2);
    const heute = ausgearbeitet.length ? `<section class="stack" aria-labelledby="heute"><div class="jahr-head"><h2 id="heute">Heute dran</h2><span class="label">nach deinem Lernstand</span></div>
      <div class="lf-grid">
        <a class="lf-card" href="#training" data-train="${fehlerAnz ? 'fehler' : 'alle'}"><div class="lf-top"><span class="lf-nr">Quiz</span><span class="chip ${fehlerAnz ? 'sig' : 'ok'}">${fehlerAnz ? fehlerAnz + ' Fehler offen' : 'keine Fehler'}</span></div><h3>${fehlerAnz ? 'Falsch beantwortete Fragen wiederholen' : 'Gemischtes Quiz starten'}</h3><div class="lf-foot"><span>Fragen verschwinden aus der Fehlerliste, sobald du sie richtig hast.</span></div></a>
        ${top.map(x => `<a class="lf-card" href="#lf${x.lf}-${esc(x.t.id)}"><div class="lf-top"><span class="lf-nr">LF ${x.lf} · Thema</span><span class="chip">${x.p} %</span></div><h3>${esc(x.t.titel)}</h3><div class="lf-foot">${bar(x.p)}</div></a>`).join('')}
      </div>${nochmal ? `<p class="muted" style="font-size:.9rem">${plural(nochmal, 'Übungsaufgabe ist', 'Übungsaufgaben sind')} zum Wiederholen markiert – du findest sie in den Themen unter „Aufgaben“.</p>` : ''}</section>` : '';
    const jahre = [1, 2, 3].map(j => {
      const lfs = LERNFELDER.filter(l => l.jahr === j);
      if (!lfs.length) return '';
      const std = lfs.reduce((s, l) => s + (l.stunden || 0), 0);
      return `<section class="jahr" aria-labelledby="j${j}"><div class="jahr-head"><h2 id="j${j}">${j}. Ausbildungsjahr</h2><span class="label">${lfs.length} Lernfelder${std ? ' · ' + std + ' Std.' : ''}</span></div><div class="lf-grid">${lfs.map(lfKarte).join('')}</div></section>`;
    }).join('');
    return `<div class="stack-lg">
      <section class="hero">
        <div class="hero-text">
          <span class="label">Bankkaufmann · Sachsen · Rahmenlehrplan 2020</span>
          <h1>Dein Weg zur Abschlussprüfung</h1>
          <p>Alle 13 Lernfelder an einem Ort. Ausgearbeitete Lernfelder haben Erklärungen, Beispiele, Übungsaufgaben mit Lösungsweg und ein Quiz. Was du abhakst und notierst, wird gespeichert.</p>
          ${weiter}
        </div>
        <div class="konto" aria-label="Dein Lernkonto">
          <div class="konto-head"><span class="label">Lernkonto</span><span class="label">Stand ${fmtDatum(Date.now())}</span></div>
          <div class="konto-saldo"><strong>${g.ziele}</strong><span class="muted">von ${g.ges} Lernzielen abgehakt</span></div>
          <div style="padding:0 16px">${bar(pct(g.ziele, g.ges))}</div>
          <div class="konto-rows">
            <div class="konto-row"><span>Übungsaufgaben gekonnt</span><span>${g.aOk} / ${g.aGes}</span></div>
            <div class="konto-row"><span>Quiz-Trefferquote (beste Runden)</span><span>${g.qN ? pct(g.qR, g.qN) + ' %' : '–'}</span></div>
            <div class="konto-row"><span>Lernfelder ausgearbeitet</span><span>${ausgearbeitet.length} / ${LERNFELDER.length}</span></div>
          </div>
          <div class="countdown"><span>${countdown}</span><label><span class="label">Termin</span><input type="date" id="pruefdatum" value="${esc(allg.datum)}" aria-label="Prüfungstermin"></label></div>
        </div>
      </section>
      ${appHinweis()}
      ${heute}
      ${jahre}
      <p class="fuss">Lernfeld-Titel und Zeitrichtwerte nach dem KMK-Rahmenlehrplan für Bankkaufleute (2020), der auch in Sachsen gilt. Lernfelder ohne Mitschriften zeigen die Inhalte laut Rahmenlehrplan als Checkliste, bis deine Unterlagen eingearbeitet sind.</p>
    </div>`;
  }
  function lfKarte(lf) {
    const inh = inhalt(lf.nr), st = lfStand(lf.nr);
    const chip = inh ? `<span class="chip acc">${plural(inh.themen.length, 'Thema', 'Themen')}</span>` : `<span class="chip">Blanko</span>`;
    const foot = inh
      ? `<span>${st.ziele} / ${st.zieleGes} Lernziele · ${st.p} %</span>${bar(st.p)}`
      : `<span>${lf.themen && lf.themen.length ? st.ziele + ' / ' + st.zieleGes + ' Inhalte behandelt · wartet auf Mitschriften' : 'Wartet auf Mitschriften'}</span>${lf.themen && lf.themen.length ? bar(st.p, 'sig') : ''}`;
    return `<a class="lf-card${inh ? '' : ' leer'}" href="#lf${lf.nr}"><div class="lf-top"><span class="lf-nr">LF ${String(lf.nr).padStart(2, '0')}${lf.stunden ? ' · ' + lf.stunden + ' Std.' : ''}</span>${chip}</div><h3>${esc(lf.titel)}</h3><div class="lf-foot">${foot}</div></a>`;
  }

  // ---------- Ansicht: Lernfeld ----------
  function viewLF(nr) {
    const lf = lfByNr(nr), inh = inhalt(nr), d = doc('lf' + nr), st = lfStand(nr);
    const meta = `<div class="lf-meta"><span class="chip">${lf.jahr}. Ausbildungsjahr</span>${lf.stunden ? `<span class="chip">${lf.stunden} Unterrichtsstunden</span>` : ''}${inh ? '<span class="chip acc">Ausgearbeitet</span>' : '<span class="chip sig">Blanko – wartet auf Mitschriften</span>'}</div>`;
    const kopf = `<nav class="crumbs" aria-label="Pfad"><a href="#start">Übersicht</a><span>›</span><span>LF ${nr}</span></nav>
      <div class="lf-head"><span class="label">Lernfeld ${nr}</span><h1>${esc(lf.titel)}</h1>${meta}</div>`;
    const notiz = `<section class="sec"><div class="sec-h"><h2>Meine Notizen zum Lernfeld</h2><span class="saved" data-saved="lf${nr}:_lf"></span></div>
      <textarea class="notiz" id="notiz-lf${nr}" data-notiz="lf${nr}:_lf" placeholder="Stichpunkte aus dem Unterricht, offene Fragen, was der Lehrer betont hat …">${esc(d.notiz._lf || '')}</textarea></section>`;
    const rlpListe = (themen) => `<ul class="check">${themen.map((t, i) => `<li><label><input type="checkbox" data-rlp="${nr}:${i}" ${d.rlp[i] ? 'checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>`;
    if (!inh) {
      const themen = lf.themen || [];
      return `<div class="read stack-lg">${kopf}
        ${lf.kern ? `<section class="card stack"><span class="label">Darum geht es laut Rahmenlehrplan</span><p>${esc(lf.kern)}</p>${lf.pruefung ? `<p class="muted"><strong>Prüfung:</strong> ${esc(lf.pruefung)}</p>` : ''}</section>` : ''}
        ${themen.length ? `<section class="sec"><div class="sec-h"><h2>Inhalte laut Rahmenlehrplan</h2><span class="label">${st.ziele} / ${st.zieleGes} behandelt</span></div>
          <p class="muted">Hak ab, was ihr im Unterricht schon gemacht habt. Sobald deine Mitschriften da sind, wird daraus ein vollständiges Lernfeld mit Erklärungen, Aufgaben und Quiz.</p>
          <div class="card" style="padding:6px">${rlpListe(themen)}</div></section>` : ''}
        <section class="card stack"><h2>So wird dieses Lernfeld befüllt</h2>
          <ol class="blank-steps">
            <li><span>Fotografiere oder tippe deine Hefter-Mitschriften zu LF ${nr} ab – Tafelbilder, Arbeitsblätter, Lösungen, alles hilft.</span></li>
            <li><span>Schick sie an Claude mit dem Satz „Das ist LF ${nr}“. Sie landen im Ordner <span class="mono">09 Bankkaufmann/Lernfelder/LF${String(nr).padStart(2, '0')}</span>.</span></li>
            <li><span>Daraus entstehen Themen mit Erklärung, Beispielen, Übungsaufgaben mit Lösungsweg, Quiz und Fachbegriffen – genau wie bei LF 10 und LF 13.</span></li>
          </ol>
          <div class="row"><a class="btn" href="#lf10">Beispiel: LF 10</a><a class="btn" href="#lf13">Beispiel: LF 13</a></div>
        </section>
        ${notiz}
      </div>`;
    }
    const themen = inh.themen.map((t, i) => {
      const s = themaStand(nr, t);
      return `<a class="thema-link" href="#lf${nr}-${esc(t.id)}"><span class="num">${i + 1}</span><span class="t"><strong>${esc(t.titel)}</strong><span>${esc(t.kurz || '')}</span><span class="mono" style="font-size:.74rem">${s.zOk}/${s.zZiel} Ziele · ${s.aOk}/${s.aGes} Aufgaben · Quiz ${s.qBest != null ? s.qBest + '/' + s.qGes : '–'}</span></span>${ring(s.p, s.p >= 100)}</a>`;
    }).join('');
    return `<div class="read stack-lg">${kopf}
      <div class="stats"><div class="stat"><b>${st.p} %</b><span>Lernfeld geschafft</span></div><div class="stat"><b>${st.ziele}/${st.zieleGes}</b><span>Lernziele</span></div><div class="stat"><b>${st.fertig}/${st.themen}</b><span>Themen komplett</span></div></div>
      <section class="sec"><div class="sec-h"><h2>Themen</h2><a class="btn small" href="#training" data-train="lf${nr}">Quiz zum Lernfeld</a></div><div class="themen">${themen}</div></section>
      ${inh.mitschriften ? '' : `<p class="box warn" style="font-size:.92rem">Ausgearbeitet aus dem Rahmenlehrplan und Fachquellen. Sobald du deine Hefter-Mitschriften zu LF ${nr} schickst, werden sie abgeglichen und ergänzt – dein Lernstand bleibt erhalten.</p>`}
      ${inh.einleitung ? `<details class="card"><summary>Worum es im Lernfeld geht</summary><div class="content" style="margin-top:12px">${inh.einleitung}</div></details>` : ''}
      ${inh.pruefung ? `<details class="card"><summary>Prüfungsbezug</summary><div class="content" style="margin-top:12px">${inh.pruefung}</div></details>` : ''}
      ${lf.themen && lf.themen.length ? `<details class="card"><summary>Abgleich mit dem Rahmenlehrplan</summary><div style="margin-top:8px">${rlpListe(lf.themen)}</div></details>` : ''}
      ${notiz}
      ${inh.quellen ? `<p class="fuss"><strong>Grundlage:</strong> ${linkify(inh.quellen)}${inh.stand ? ' · Stand ' + esc(inh.stand) : ''}</p>` : ''}
    </div>`;
  }
  function linkify(text) {
    return esc(text).replace(/https?:\/\/[^\s)<,;]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 60)}</a>`);
  }

  // ---------- Ansicht: Thema (mit Reitern) ----------
  function themaTabs(nr, th) {
    const s = themaStand(nr, th);
    const q = s.qBest != null ? `${s.qBest}/${s.qGes}` : String(s.qGes);
    return [
      { id: 'lernen', label: 'Lernen', n: s.zZiel ? `${s.zOk}/${s.zZiel}` : '', fertig: s.zZiel > 0 && s.zOk === s.zZiel },
      th.beispiele && th.beispiele.length ? { id: 'beispiele', label: 'Beispiele', n: String(th.beispiele.length) } : null,
      (th.merke && th.merke.length) || (th.fallen && th.fallen.length) ? { id: 'merken', label: 'Merken' } : null,
      th.aufgaben && th.aufgaben.length ? { id: 'aufgaben', label: 'Aufgaben', n: `${s.aOk}/${s.aGes}`, fertig: s.aOk === s.aGes } : null,
      th.quiz && th.quiz.length ? { id: 'quiz', label: 'Quiz', n: q, fertig: s.qBest === s.qGes } : null,
      th.begriffe && th.begriffe.length ? { id: 'begriffe', label: 'Begriffe', n: String(th.begriffe.length) } : null,
      { id: 'notizen', label: 'Notizen', fertig: s.notiz }
    ].filter(Boolean);
  }
  function viewThema(nr, th, tab, tabs) {
    const inh = inhalt(nr), s = themaStand(nr, th);
    const idx = inh.themen.indexOf(th), prev = inh.themen[idx - 1], next = inh.themen[idx + 1];
    const basis = `lf${nr}-${th.id}`;
    const ti = tabs.findIndex(t => t.id === tab), naechsterTab = tabs[ti + 1];
    let weiter;
    if (naechsterTab) weiter = `<a class="btn pri block" href="#${esc(basis)}.${naechsterTab.id}" data-tab="${naechsterTab.id}">Weiter: ${esc(naechsterTab.label)} ${PFEIL.replace('<svg', '<svg width="18" height="18" style="fill:none;stroke:currentColor;stroke-width:2.4"')}</a>`;
    else if (next) weiter = `<a class="btn pri block" href="#lf${nr}-${esc(next.id)}">Nächstes Thema: ${esc(next.titel)}</a>`;
    else weiter = `<a class="btn pri block" href="#lf${nr}">Lernfeld ${nr} abgeschlossen – zur Übersicht</a>`;
    return `<div class="read stack-lg">
      <div class="th-kopf">
        <nav class="crumbs" aria-label="Pfad"><a href="#start">Übersicht</a><span>›</span><a href="#lf${nr}">LF ${nr}</a><span>›</span><span>Thema ${idx + 1} von ${inh.themen.length}</span></nav>
        <span class="label">LF ${nr} · Thema ${idx + 1} von ${inh.themen.length}</span>
        <h1>${esc(th.titel)}</h1>
        ${th.kurz ? `<p class="muted">${esc(th.kurz)}</p>` : ''}
        <div class="th-fort">${bar(s.p)}<div class="row"><span><b>${s.zOk}/${s.zZiel}</b> Lernziele</span><span><b>${s.aOk}/${s.aGes}</b> Aufgaben</span><span><b>${s.qBest != null ? s.qBest + '/' + s.qGes : '–'}</b> Quiz</span><span><b>${s.p} %</b></span></div></div>
        <div id="tabs-anker"></div>
      </div>
      <nav class="tabs" aria-label="Abschnitte des Themas">${tabs.map(t => `<a href="#${esc(basis)}.${t.id}" data-tab="${t.id}" aria-current="${t.id === tab}" class="${t.fertig ? 'fertig' : ''}">${esc(t.label)}${t.n ? ` <span class="n">${esc(t.n)}</span>` : ''}</a>`).join('')}</nav>
      <section class="tab-panel" id="panel" aria-label="${esc((tabs[ti] || {}).label || '')}">${panel(nr, th, tab)}</section>
      <div class="weiter-box">${weiter}
        <nav class="th-pager" aria-label="Themen blättern">${prev ? `<a href="#lf${nr}-${esc(prev.id)}"><span>‹ ${esc(prev.titel)}</span></a>` : '<span></span>'}${next ? `<a class="n" href="#lf${nr}-${esc(next.id)}"><span>${esc(next.titel)} ›</span></a>` : ''}</nav>
      </div>
    </div>`;
  }
  function panel(nr, th, tab) {
    const d = doc('lf' + nr), k = th.id, s = themaStand(nr, th);
    if (tab === 'beispiele') return th.beispiele.map((b, i) => `<article class="beispiel"><span class="label">Beispiel ${i + 1} von ${th.beispiele.length}</span><h3>${esc(b.titel)}</h3><div class="content">${b.text}</div></article>`).join('');
    if (tab === 'merken') return `<div class="merk-grid">
        ${th.merke && th.merke.length ? `<div class="merk"><span class="label" style="color:var(--accent)">Merksätze</span><ul class="merk-list">${th.merke.map(m => `<li>${m}</li>`).join('')}</ul></div>` : ''}
        ${th.fallen && th.fallen.length ? `<div class="falle"><span class="label" style="color:var(--signal)">Typische Prüfungsfallen</span><ul class="merk-list">${th.fallen.map(m => `<li>${m}</li>`).join('')}</ul></div>` : ''}
      </div>`;
    if (tab === 'aufgaben') return `<p class="muted">Erst selbst lösen – Zettel und Taschenrechner –, dann die Lösung aufklappen und ehrlich bewerten. ${s.aOk} von ${s.aGes} gekonnt.</p>
      ${th.aufgaben.map((a, i) => { const r = d.aufg[k + '__' + i] || ''; return `<article class="aufgabe" data-r="${r}"><div class="row" style="justify-content:space-between"><span class="label">Aufgabe ${i + 1} von ${th.aufgaben.length}</span>${a.art ? `<span class="chip">${esc(a.art)}</span>` : ''}</div>
        <div class="content">${a.frage}</div>
        <details><summary><span class="zu">Lösung anzeigen</span><span class="auf">Lösung</span></summary><div class="loesung content">${a.loesung}</div>
          <div class="bewerten"><button class="btn" type="button" data-aufg="${nr}:${esc(k)}:${i}:ok" aria-pressed="${r === 'ok'}">Konnte ich</button><button class="btn" type="button" data-aufg="${nr}:${esc(k)}:${i}:nochmal" aria-pressed="${r === 'nochmal'}">Nochmal üben</button></div>
        </details></article>`; }).join('')}`;
    if (tab === 'quiz') {
      const q = d.quiz[k];
      return `<p class="muted">${th.quiz.length} Fragen. Tippe die richtige Antwort an – die Erklärung erscheint sofort.${q ? ` Zuletzt ${q.letzt}/${th.quiz.length}, beste Runde ${q.best}/${th.quiz.length}.` : ''}</p>
        <div class="stack" data-quiz="${nr}:${esc(k)}">${th.quiz.map((f, i) => quizFrage(f, i, `${nr}:${k}:${i}`, null, th.quiz.length)).join('')}</div>
        <div id="quiz-ergebnis" class="sm-b" aria-live="polite"></div>`;
    }
    if (tab === 'begriffe') return `<dl class="begriffe">${th.begriffe.map(b => `<div><dt>${esc(b.b)}</dt><dd>${esc(b.d)}</dd></div>`).join('')}</dl>
      <a class="btn block" href="#training" data-train="karten-lf${nr}">Begriffe als Karteikarten üben</a>`;
    if (tab === 'notizen') return `<div class="sec-h"><h2>In eigenen Worten</h2><span class="saved" data-saved="lf${nr}:${esc(k)}"></span></div>
      <p class="muted">Erklär das Thema so, als würdest du es einem Kunden oder einem Mitazubi beibringen. Wo du hängen bleibst, liegt deine Lücke. Alles wird automatisch gespeichert.</p>
      <textarea class="notiz" id="notiz-lf${nr}-${esc(k)}" data-notiz="lf${nr}:${esc(k)}" placeholder="Meine Erklärung, Eselsbrücken, Hinweise aus dem Unterricht …">${esc(d.notiz[k] || '')}</textarea>`;
    // Lernen: Erklärung, danach Selbstcheck
    return `<div class="content" id="erklaerung">${th.inhalt || '<p class="muted">Noch keine Erklärung hinterlegt.</p>'}</div>
      ${(th.lernziele || []).length ? `<section class="sec"><div class="sec-h"><h2>Selbstcheck</h2><span class="label">${s.zOk} / ${s.zZiel} abgehakt</span></div>
        <p class="muted">Hak ab, was du ohne Spickzettel erklären kannst.</p>
        <div class="card" style="padding:6px"><ul class="check">${th.lernziele.map((z, i) => `<li><label><input type="checkbox" data-ziel="${nr}:${esc(k)}:${i}" ${d.ziele[k + '__' + i] ? 'checked' : ''}><span>${esc(z)}</span></label></li>`).join('')}</ul></div></section>` : ''}`;
  }
  function quizFrage(f, i, key, gemischt, gesamt) {
    const opts = shuffle(f.optionen.map((o, j) => ({ o, j })));
    return `<div class="quiz-q" data-q="${esc(key)}"><span class="label">Frage ${i + 1}${gesamt ? ' von ' + gesamt : ''}${gemischt ? ' · ' + esc(gemischt) : ''}</span><strong>${esc(f.frage)}</strong>
      <div class="opts">${opts.map(({ o, j }, n) => `<button class="opt" type="button" data-opt="${j}" data-richtig="${j === f.richtig ? 1 : 0}"><span class="k">${'ABCDEF'[n]}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="erkl" hidden>${f.erklaerung ? esc(f.erklaerung) : ''}</div></div>`;
  }

  // ---------- Ansicht: Training ----------
  function alleFragen(filter) {
    const out = [];
    LERNFELDER.forEach(lf => {
      const inh = inhalt(lf.nr); if (!inh) return;
      if (filter !== 'alle' && filter !== 'fehler' && filter !== 'lf' + lf.nr) return;
      inh.themen.forEach(t => (t.quiz || []).forEach((f, i) => out.push({ f, key: `${lf.nr}:${t.id}:${i}`, quelle: `LF ${lf.nr} · ${t.titel}` })));
    });
    if (filter === 'fehler') { const fe = doc('allgemein').fehler; return out.filter(x => fe[x.key]); }
    return out;
  }
  function alleBegriffe(filter) {
    const out = [];
    LERNFELDER.forEach(lf => {
      const inh = inhalt(lf.nr); if (!inh) return;
      if (filter && filter !== 'alle' && filter !== 'lf' + lf.nr) return;
      inh.themen.forEach(t => (t.begriffe || []).forEach(b => out.push({ b, key: `${lf.nr}:${t.id}:${b.b}`, nr: lf.nr, thema: t })));
    });
    return out;
  }
  function viewTraining() {
    const lfs = LERNFELDER.filter(l => inhalt(l.nr));
    const fehlerAnz = Object.keys(doc('allgemein').fehler).length;
    if (trainingFilter === 'fehler' && trainingModus !== 'quiz') trainingFilter = 'alle';
    const filterBtns = [['alle', 'Alle Lernfelder'], ...lfs.map(l => ['lf' + l.nr, 'LF ' + l.nr])];
    if (trainingModus === 'quiz') filterBtns.push(['fehler', `Meine Fehler (${fehlerAnz})`]);
    const kopf = `<div class="stack"><span class="label">Trainieren</span><h1>Prüfungstraining</h1>
      <p class="muted">Quiz mit Sofort-Erklärung, Karteikarten für Fachbegriffe oder eine Prüfungssimulation auf Zeit. Falsch beantwortete Fragen landen in „Meine Fehler“.</p>
      <div class="seg" role="group" aria-label="Modus"><button type="button" data-modus="quiz" aria-pressed="${trainingModus === 'quiz'}">Quiz</button><button type="button" data-modus="karten" aria-pressed="${trainingModus === 'karten'}">Karteikarten</button><button type="button" data-modus="sim" aria-pressed="${trainingModus === 'sim'}">Simulation</button></div>
      <div class="chips" role="group" aria-label="Auswahl">${filterBtns.map(([id, n]) => `<button class="btn small" type="button" data-filter="${id}" aria-pressed="${trainingFilter === id}">${esc(n)}</button>`).join('')}</div></div>`;
    if (!lfs.length) return `<div class="read stack-lg">${kopf}<p class="card">Noch keine ausgearbeiteten Lernfelder.</p></div>`;
    return `<div class="read stack-lg">${kopf}<div id="training-feld">${trainingFeld()}</div></div>`;
  }
  function trainingFeld() { return trainingModus === 'quiz' ? trainingQuiz() : trainingModus === 'sim' ? trainingSim() : trainingKarten(); }

  // IHK-Punkteschlüssel (kaufmännische Abschlussprüfungen)
  function ihkNote(p) {
    return p >= 92 ? ['sehr gut', 1] : p >= 81 ? ['gut', 2] : p >= 67 ? ['befriedigend', 3] : p >= 50 ? ['ausreichend', 4] : p >= 30 ? ['mangelhaft', 5] : ['ungenügend', 6];
  }
  const SIM_FRAGEN = 20, SIM_MINUTEN = 30;
  function trainingSim() {
    if (!simSitzung || simSitzung.filter !== trainingFilter) simSitzung = { filter: trainingFilter, start: 0, fragen: [], antw: {}, fertig: false };
    const s = simSitzung;
    if (!s.start) {
      const pool = alleFragen(trainingFilter);
      return `<div class="card stack"><span class="label">Prüfungssimulation</span><h2>${Math.min(SIM_FRAGEN, pool.length)} Fragen · ${SIM_MINUTEN} Minuten</h2>
        <p class="muted">Wie in der schriftlichen Prüfung: keine Sofort-Auflösung, du kannst Antworten bis zur Abgabe ändern. Am Ende bekommst du Punkte und Note nach dem IHK-Schlüssel und alle Fehler mit Erklärung.</p>
        <div class="tab-wrap"><table class="tab"><thead><tr><th>Punkte</th><th>Note</th></tr></thead><tbody><tr><td class="r">100–92</td><td>sehr gut</td></tr><tr><td class="r">91–81</td><td>gut</td></tr><tr><td class="r">80–67</td><td>befriedigend</td></tr><tr><td class="r">66–50</td><td>ausreichend</td></tr><tr><td class="r">49–30</td><td>mangelhaft</td></tr><tr><td class="r">29–0</td><td>ungenügend</td></tr></tbody></table></div>
        <button class="btn pri block" type="button" data-sim="start" ${pool.length ? '' : 'disabled'}>Simulation starten</button></div>`;
    }
    if (s.fertig) {
      const n = s.fragen.length, richtig = s.fragen.filter((x, i) => s.antw[i] === x.f.richtig).length;
      const pkt = Math.round(richtig / n * 100), [note, ziffer] = ihkNote(pkt);
      const dauer = Math.max(1, Math.round((s.ende - s.start) / 60000));
      const falsch = s.fragen.map((x, i) => ({ x, i })).filter(({ x, i }) => s.antw[i] !== x.f.richtig);
      return `<div class="stack"><div class="card ergebnis"><span class="label">Auswertung · ${dauer} Min.</span><div class="big">${pkt} Punkte</div><p><strong>Note ${ziffer} – ${note}</strong><br>${richtig} von ${n} richtig${pkt >= 50 ? '' : ' · unter 50 Punkten gilt ein Prüfungsbereich als nicht ausreichend'}</p><button class="btn pri" type="button" data-sim="neu">Neue Simulation</button></div>
        ${falsch.length ? `<h2>Deine Fehler (${falsch.length})</h2>${falsch.map(({ x, i }) => `<div class="quiz-q"><span class="label">Frage ${i + 1} · ${esc(x.quelle)}</span><strong>${esc(x.f.frage)}</strong>
          <div class="opt falsch" style="cursor:default"><span class="k">Du</span><span>${s.antw[i] != null ? esc(x.f.optionen[s.antw[i]]) : '<em>keine Antwort</em>'}</span></div>
          <div class="opt richtig" style="cursor:default"><span class="k">✓</span><span>${esc(x.f.optionen[x.f.richtig])}</span></div>${x.f.erklaerung ? `<div class="erkl">${esc(x.f.erklaerung)}</div>` : ''}</div>`).join('')}` : '<p class="card">Fehlerfrei. Stark!</p>'}</div>`;
    }
    const beantwortet = Object.keys(s.antw).length;
    return `<div class="stack"><div class="simbar"><span class="label" id="sim-stand">${beantwortet} / ${s.fragen.length} beantwortet</span><strong class="mono" id="sim-timer" aria-live="off">--:--</strong><button class="btn small pri" type="button" data-sim="abgeben">Abgeben</button></div>
      ${s.fragen.map((x, i) => `<div class="quiz-q"><span class="label">Frage ${i + 1} von ${s.fragen.length}</span><strong>${esc(x.f.frage)}</strong><div class="opts">${x.ordnung.map((j, n) => `<button class="opt${s.antw[i] === j ? ' gewaehlt' : ''}" type="button" data-simopt="${i}:${j}" aria-pressed="${s.antw[i] === j}"><span class="k">${'ABCDEF'[n]}</span><span>${esc(x.f.optionen[j])}</span></button>`).join('')}</div></div>`).join('')}
      <button class="btn pri block" type="button" data-sim="abgeben">Abgeben und auswerten</button></div>`;
  }
  function simTick() {
    clearInterval(simTimer);
    const tick = () => {
      const el = $('#sim-timer');
      if (!simSitzung || !simSitzung.start || simSitzung.fertig || !el) { clearInterval(simTimer); return; }
      const rest = Math.max(0, simSitzung.start + SIM_MINUTEN * 60000 - Date.now());
      el.textContent = String(Math.floor(rest / 60000)).padStart(2, '0') + ':' + String(Math.floor(rest / 1000) % 60).padStart(2, '0');
      if (rest <= 0) simAbgeben();
    };
    tick(); simTimer = setInterval(tick, 500);
  }
  function simAbgeben() {
    const s = simSitzung; if (!s || s.fertig) return;
    s.fertig = true; s.ende = Date.now(); clearInterval(simTimer);
    const allg = doc('allgemein');
    s.fragen.forEach((x, i) => { if (s.antw[i] === x.f.richtig) delete allg.fehler[x.key]; else allg.fehler[x.key] = 1; });
    touch('allgemein');
    $('#training-feld').innerHTML = trainingSim(); window.scrollTo(0, 0);
  }

  function trainingQuiz() {
    if (!quizSitzung || quizSitzung.filter !== trainingFilter) {
      const pool = alleFragen(trainingFilter);
      quizSitzung = { filter: trainingFilter, fragen: shuffle(pool).slice(0, 10), pos: 0, richtig: 0 };
    }
    const s = quizSitzung;
    if (!s.fragen.length) return `<div class="card ergebnis"><p>${trainingFilter === 'fehler' ? 'Keine offenen Fehler – stark!' : 'Keine Fragen in dieser Auswahl.'}</p></div>`;
    if (s.pos >= s.fragen.length) {
      const p = pct(s.richtig, s.fragen.length);
      return `<div class="card ergebnis"><span class="label">Runde beendet</span><div class="big">${s.richtig}/${s.fragen.length}</div><p>${p >= 90 ? 'Prüfungsreif. Weiter so.' : p >= 67 ? 'Solide. Schau dir die Erklärungen der falschen Fragen nochmal an.' : 'Da geht noch was. Die Fehler findest du unter „Meine Fehler“.'}</p><button class="btn pri" type="button" data-neu="quiz">Neue Runde</button></div>`;
    }
    const x = s.fragen[s.pos];
    return `<div class="stack"><div class="row" style="justify-content:space-between"><span class="label">Frage ${s.pos + 1} von ${s.fragen.length}</span><span class="label">${s.richtig} richtig</span></div>${bar(pct(s.pos, s.fragen.length))}
      <div data-quiz="training">${quizFrage(x.f, s.pos, x.key, x.quelle)}</div>
      <div id="weiter-row" class="sm-b" hidden><button class="btn pri block" type="button" data-weiter="quiz">${s.pos + 1 < s.fragen.length ? 'Nächste Frage' : 'Auswertung'}</button></div></div>`;
  }
  function trainingKarten() {
    const allg = doc('allgemein');
    if (!kartenSitzung || kartenSitzung.filter !== trainingFilter) {
      const pool = alleBegriffe(trainingFilter);
      // Leitner: niedrigste Box zuerst, innerhalb der Box gemischt
      const sortiert = shuffle(pool).sort((a, b) => (allg.karten[a.key] || 0) - (allg.karten[b.key] || 0)).slice(0, 15);
      kartenSitzung = { filter: trainingFilter, karten: sortiert, pos: 0, offen: false, gewusst: 0 };
    }
    const s = kartenSitzung, pool = alleBegriffe(trainingFilter);
    const boxen = [0, 1, 2, 3, 4].map(b => pool.filter(x => Math.min(allg.karten[x.key] || 0, 4) === b).length);
    const leitner = `<div class="leitner" aria-label="Lernkartei">${boxen.map((n, b) => `<div><b>${n}</b>${b === 0 ? 'neu' : b === 4 ? 'sitzt' : 'Fach ' + b}</div>`).join('')}</div>`;
    if (!s.karten.length) return `<div class="card ergebnis"><p>Keine Begriffe in dieser Auswahl.</p></div>`;
    if (s.pos >= s.karten.length) return `<div class="stack">${leitner}<div class="card ergebnis"><span class="label">Stapel durch</span><div class="big">${s.gewusst}/${s.karten.length}</div><p>gewusst. Nicht gewusste Begriffe kommen beim nächsten Stapel zuerst.</p><button class="btn pri" type="button" data-neu="karten">Neuer Stapel</button></div></div>`;
    const x = s.karten[s.pos];
    return `<div class="stack">${leitner}<div class="row" style="justify-content:space-between"><span class="label">Karte ${s.pos + 1} von ${s.karten.length}</span><a class="label" href="#lf${x.nr}-${esc(x.thema.id)}">LF ${x.nr} · ${esc(x.thema.titel)}</a></div>
      <button class="karte" type="button" data-flip="1" aria-label="Karte umdrehen"><div style="display:grid;gap:12px"><h2>${esc(x.b.b)}</h2>${s.offen ? `<p class="def">${esc(x.b.d)}</p>` : '<span class="muted">Tippen zum Umdrehen</span>'}</div></button>
      ${s.offen ? `<div class="karten-btns"><button class="btn" type="button" data-karte="nein">Nicht gewusst</button><button class="btn pri" type="button" data-karte="ja">Gewusst</button></div><p class="muted" style="text-align:center;font-size:.82rem">Oder wischen: nach rechts = gewusst, nach links = nochmal</p>` : ''}</div>`;
  }
  function karteBewerten(v) {
    const s = kartenSitzung; if (!s || s.pos >= s.karten.length) return;
    const x = s.karten[s.pos], allg = doc('allgemein');
    if (v === 'ja') { allg.karten[x.key] = Math.min((allg.karten[x.key] || 0) + 1, 4); s.gewusst++; }
    else allg.karten[x.key] = 0;
    touch('allgemein'); s.pos++; s.offen = false;
    $('#training-feld').innerHTML = trainingKarten();
  }

  // ---------- Ansicht: Begriffe & Formeln ----------
  const textOf = html => { const d = document.createElement('div'); d.innerHTML = html || ''; return d.textContent || ''; };
  let formelCache = null, textCache = null;
  function alleFormeln() {
    if (formelCache) return formelCache;
    formelCache = [];
    LERNFELDER.forEach(lf => {
      const inh = inhalt(lf.nr); if (!inh) return;
      inh.themen.forEach(t => {
        const d = document.createElement('div');
        d.innerHTML = [t.inhalt || ''].concat((t.beispiele || []).map(b => b.text || '')).join('');
        const gesehen = new Set();
        $$('.formel', d).forEach(f => { const h = f.innerHTML.trim(); if (h && !gesehen.has(h)) { gesehen.add(h); formelCache.push({ nr: lf.nr, thema: t, html: h, text: f.textContent }); } });
      });
    });
    return formelCache;
  }
  function themenTexte() {
    if (textCache) return textCache;
    textCache = [];
    LERNFELDER.forEach(lf => { const inh = inhalt(lf.nr); if (!inh) return; inh.themen.forEach(t => {
      textCache.push({ nr: lf.nr, t, txt: (t.titel + ' ' + (t.kurz || '') + ' ' + textOf(t.inhalt) + ' ' + (t.beispiele || []).map(b => b.titel + ' ' + textOf(b.text)).join(' ')).replace(/\s+/g, ' ') });
    }); });
    return textCache;
  }
  function viewBegriffe() {
    return `<div class="read stack-lg"><div class="stack"><span class="label">Nachschlagen</span><h1>${glossarModus === 'formeln' ? 'Formelsammlung' : 'Begriffe & Suche'}</h1>
      <div class="seg" role="group" aria-label="Ansicht"><button type="button" data-gmodus="begriffe" aria-pressed="${glossarModus === 'begriffe'}">Fachbegriffe</button><button type="button" data-gmodus="formeln" aria-pressed="${glossarModus === 'formeln'}">Formeln</button></div>
      <p class="muted">${glossarModus === 'formeln' ? 'Alle Formeln und Rechenschemata aus den ausgearbeiteten Lernfeldern, nach Thema sortiert. Vergleiche sie mit der offiziellen AkA-Formelsammlung, die du in der Prüfung bekommst.' : 'Durchsucht alle Fachbegriffe und den Text aller Themen. Tippe auf das Lernfeld, um zum Thema zu springen.'}</p>
      <input class="suche" id="glossar-suche" type="search" enterkeyhint="search" autocomplete="off" placeholder="${glossarModus === 'formeln' ? 'Formel suchen, z. B. Liquidität …' : 'Begriff oder Stichwort suchen …'}" value="${esc(glossarSuche)}" aria-label="Durchsuchen"></div>
      <div id="glossar-liste" class="stack">${glossarListe()}</div></div>`;
  }
  function glossarListe() {
    const q = glossarSuche.trim().toLowerCase();
    if (glossarModus === 'formeln') {
      const fs = alleFormeln().filter(x => !q || (x.text + ' ' + x.thema.titel).toLowerCase().includes(q));
      if (!fs.length) return `<p class="card muted">${q ? 'Keine Formel gefunden.' : 'Noch keine Formeln vorhanden.'}</p>`;
      const gruppen = [];
      fs.forEach(x => { const g = gruppen.find(g => g.thema === x.thema); if (g) g.items.push(x); else gruppen.push({ nr: x.nr, thema: x.thema, items: [x] }); });
      return gruppen.map(g => `<section class="stack" style="gap:8px"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:start"><h3>${esc(g.thema.titel)}</h3><a class="chip acc" href="#lf${g.nr}-${esc(g.thema.id)}" style="text-decoration:none">LF ${g.nr}</a></div>${g.items.map(x => `<div class="formel">${x.html}</div>`).join('')}</section>`).join('');
    }
    let themenTreffer = '';
    if (q.length >= 3) {
      const tt = themenTexte().map(x => { const i = x.txt.toLowerCase().indexOf(q); return i < 0 ? null : { ...x, aus: (i > 40 ? '… ' : '') + x.txt.slice(Math.max(0, i - 40), i + q.length + 70) + ' …' }; }).filter(Boolean);
      if (tt.length) themenTreffer = `<div class="card card-plain"><div class="gl-item"><span class="label">In ${plural(tt.length, 'Thema', 'Themen')} gefunden</span></div>${tt.slice(0, 12).map(x => `<a class="gl-item" href="#lf${x.nr}-${esc(x.t.id)}" style="text-decoration:none;color:inherit"><div class="row"><strong>${esc(x.t.titel)}</strong><span class="chip acc">LF ${x.nr}</span></div><span class="muted" style="font-size:.9rem">${esc(x.aus)}</span></a>`).join('')}</div>`;
    }
    const items = alleBegriffe('alle').filter(x => !q || (x.b.b + ' ' + x.b.d).toLowerCase().includes(q)).sort((a, b) => a.b.b.localeCompare(b.b.b, 'de'));
    const liste = items.length ? `<div class="card card-plain">${items.map(x => `<div class="gl-item"><div class="row"><strong>${esc(x.b.b)}</strong><a class="chip acc" href="#lf${x.nr}-${esc(x.thema.id)}.begriffe" style="text-decoration:none">LF ${x.nr}</a></div><span class="muted" style="font-size:.94rem">${esc(x.b.d)}</span></div>`).join('')}</div>`
      : (themenTreffer ? '' : `<p class="card muted">${q ? 'Nichts gefunden.' : 'Noch keine Begriffe vorhanden.'}</p>`);
    return themenTreffer + liste;
  }

  // ---------- Ansicht: Prüfung ----------
  function viewPruefung() {
    const P = LP.pruefung, allg = doc('allgemein');
    const tipps = P && P.tipps || [];
    const teile = P && P.teile ? P.teile.map(t => `<section class="pr-teil"><div class="sec-h"><h2>${esc(t.name)}</h2><span class="label">${esc(t.gewicht || '')}</span></div>${t.zeitpunkt ? `<p class="muted" style="font-size:.9rem">${esc(t.zeitpunkt)}</p>` : ''}
      ${(t.bereiche || []).map(b => `<div class="card stack" style="gap:6px"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:start"><h3>${esc(b.name)}</h3><span class="chip acc">${esc(b.gewicht || '')}</span></div><p class="muted" style="font-size:.9rem">${esc(b.form || '')}</p>${(b.lernfelder || []).length ? `<div class="row" style="gap:6px"><span class="label">Lernfelder</span>${b.lernfelder.map(n => `<a class="chip" href="#lf${n}" style="text-decoration:none">LF ${n}</a>`).join('')}</div>` : ''}</div>`).join('')}</section>`).join('') : '';
    return `<div class="read stack-lg"><div class="stack"><span class="label">Abschlussprüfung</span><h1>Prüfung im Überblick</h1>
      <div class="countdown card" style="border-radius:var(--r)"><span>${allg.datum ? 'Dein Termin: <strong class="mono">' + fmtDatum(allg.datum + 'T08:00:00') + '</strong>' : 'Trag deinen Prüfungstermin ein, dann zählt die Übersicht die Tage runter.'}</span><label><span class="label">Termin</span><input type="date" id="pruefdatum" value="${esc(allg.datum)}" aria-label="Prüfungstermin"></label></div></div>
      ${teile}
      ${P && P.ueberblick ? `<details class="card"><summary>Ablauf, Bestehensregeln und Aufgabenstelle</summary><div class="content" style="margin-top:12px">${P.ueberblick}</div></details>` : ''}
      ${viewBeratung(allg)}
      ${tipps.length ? `<section class="sec"><h2>Tipps für den Prüfungstag</h2><div class="card" style="padding:6px"><ul class="check">${tipps.map((t, i) => `<li><label><input type="checkbox" data-tipp="${i}" ${allg['tipp' + i] ? 'checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul></div></section>` : ''}
      ${P && P.quellen && P.quellen.length ? `<p class="fuss"><strong>Quellen:</strong> ${P.quellen.map(linkify).join(' · ')}${P.stand ? ' · Stand ' + esc(P.stand) : ''}</p>` : ''}
    </div>`;
  }
  function viewBeratung(allg) {
    const B = LP.beratung; if (!B) return '';
    return `<section class="sec" id="beratung"><div class="sec-h"><h2>Kunden beraten: Gesprächsleitfaden</h2><span class="label">30 % der Note</span></div>
      <div class="content">${B.intro}</div>
      <ol class="phasen">${B.phasen.map(ph => `<li class="card stack" style="gap:10px"><div><h3>${esc(ph.titel)}</h3><p class="muted" style="font-size:.92rem">${esc(ph.ziel)}</p></div>
        <ul class="merk-list">${ph.tun.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="erkl"><span class="label">So kannst du es sagen</span>${ph.saetze.map(x => `<p style="margin-top:4px"><em>${esc(x)}</em></p>`).join('')}</div></li>`).join('')}</ol>
      <div class="merk-grid">
        <div class="card stack" style="gap:8px;padding:12px 8px"><span class="label" style="padding-inline:8px">15 Minuten Vorbereitung</span><ul class="check">${B.vorbereitung.map((x, i) => `<li><label><input type="checkbox" data-vorb="${i}" ${allg['vorb' + i] ? 'checked' : ''}><span>${esc(x)}</span></label></li>`).join('')}</ul></div>
        <div class="card stack" style="gap:8px"><span class="label">Darauf achten die Prüfer</span><ul class="merk-list">${B.kriterien.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      ${B.fall ? `<article class="aufgabe"><div class="row" style="justify-content:space-between"><span class="label">Übungsfall</span><span class="chip">Gesprächssimulation</span></div><h3>${esc(B.fall.titel)}</h3><div class="content">${B.fall.situation}<p><strong>Deine Aufgabe:</strong> ${esc(B.fall.aufgabe)}</p></div>
        <details><summary><span class="zu">Lösungsskizze anzeigen</span><span class="auf">Lösungsskizze</span></summary><div class="loesung content">${B.fall.loesung}</div></details></article>` : ''}
    </section>`;
  }

  // ---------- App, Offline und Lernstand übertragen ----------
  let installEreignis = null;   // beforeinstallprompt (Android/Chrome/Edge)
  let swReg = null, wartenderSW = null, updateAngefordert = false;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEreignis = e; if (['start', 'daten'].includes(parseRoute(route()).view)) render('keep'); });
  window.addEventListener('appinstalled', () => { installEreignis = null; toast('App installiert'); });

  function appHinweis() {
    if (ALS_APP || UMGEBUNG === 'datei') return '';
    let gemerkt = false; try { gemerkt = localStorage.getItem('bk-app-hinweis') === 'zu'; } catch (e) { /* egal */ }
    if (gemerkt) return '';
    const text = UMGEBUNG === 'claude'
      ? 'Den Prüfungstrainer gibt es auch als App für Handy und PC – mit Symbol auf dem Startbildschirm und offline nutzbar.'
      : 'Installier den Prüfungstrainer als App: Symbol auf dem Startbildschirm, Vollbild und offline nutzbar.';
    return `<section class="card app-karte"><div style="display:grid;gap:4px;min-width:0"><strong>Als App nutzen – auch offline</strong><span class="muted" style="font-size:.9rem">${text}</span></div>
      <div class="row"><a class="btn pri small" href="#daten">So geht’s</a><button class="btn small" type="button" data-hinweis-zu>Ausblenden</button></div></section>`;
  }

  function lernstandZahlen() {
    let haken = 0, notizen = 0, quiz = 0, letzte = 0;
    Object.keys(docs).forEach(k => {
      const d = docs[k] || {};
      letzte = Math.max(letzte, d.t || 0);
      if (k === 'allgemein') return;
      haken += Object.keys(d.ziele || {}).length + Object.keys(d.rlp || {}).length + Object.values(d.aufg || {}).filter(Boolean).length;
      notizen += Object.values(d.notiz || {}).filter(v => (v || '').trim()).length;
      quiz += Object.keys(d.quiz || {}).length;
    });
    return { haken, notizen, quiz, letzte };
  }

  function viewDaten() {
    const z = lernstandZahlen();
    const ort = UMGEBUNG === 'claude'
      ? (db ? 'In deinem <strong>Claude-Konto</strong> – auf jedem Gerät gleich, auf dem du den Claude-Link öffnest.' : 'Im Browser dieses Geräts. Der Konto-Speicher ist gerade nicht erreichbar.')
      : UMGEBUNG === 'datei' ? 'In diesem Browser, zu dieser Offline-Datei.' : 'Auf <strong>diesem Gerät</strong>, in der App bzw. diesem Browser. Andere Geräte haben ihren eigenen Stand – zum Mitnehmen unten „Lernstand übertragen“ nutzen.';
    let install;
    if (UMGEBUNG === 'claude') install = `<p>Die App-Version liegt unter einem eigenen Link. Öffne ihn auf dem Handy im Browser und installiere sie dort.</p>
        <div class="code-zeile"><span class="mono">${esc(APP_URL)}</span><button class="btn small" type="button" data-kopieren="${esc(APP_URL)}">Link kopieren</button></div>
        <a class="btn pri block" href="${esc(APP_URL)}" target="_blank" rel="noopener">App-Version öffnen</a>`;
    else if (UMGEBUNG === 'datei') install = `<p>Das ist die Offline-Datei. Installieren lässt sich die App über ihren Link:</p><div class="code-zeile"><span class="mono">${esc(APP_URL)}</span></div>`;
    else if (ALS_APP) install = `<p class="box ok">Läuft als installierte App.</p>`;
    else install = `${installEreignis ? '<button class="btn pri block" type="button" data-installieren>App jetzt installieren</button>' : ''}
        <div class="anleitung"><h3>iPhone / iPad</h3><ol class="schritte"><li>Diese Seite in <strong>Safari</strong> öffnen.</li><li>Unten auf <strong>Teilen</strong> tippen (Quadrat mit Pfeil nach oben).</li><li><strong>Zum Home-Bildschirm</strong> wählen und <strong>Hinzufügen</strong> tippen.</li></ol></div>
        <div class="anleitung"><h3>Android</h3><ol class="schritte"><li>Seite in <strong>Chrome</strong> öffnen.</li><li>Oben rechts auf <strong>⋮</strong> tippen.</li><li><strong>App installieren</strong> bzw. <strong>Zum Startbildschirm hinzufügen</strong> wählen.</li></ol></div>
        <div class="anleitung"><h3>PC (Chrome oder Edge)</h3><ol class="schritte"><li>In der Adresszeile rechts auf das <strong>Installieren-Symbol</strong> klicken (Bildschirm mit Pfeil).</li><li>Die App erscheint im Startmenü und auf dem Desktop.</li></ol></div>`;
    let offline;
    if (UMGEBUNG === 'claude') offline = `<p>Über den Claude-Link brauchst du Internet. Offline lernen geht mit der App-Version oder der Offline-Datei.</p>`;
    else if (UMGEBUNG === 'datei') offline = `<p class="box ok">Diese Datei enthält alles und läuft komplett ohne Internet. Neue Lernfelder bekommst du, indem du die Datei neu herunterlädst.</p>`;
    else offline = `<p id="offline-status">${navigator.serviceWorker && navigator.serviceWorker.controller ? 'Alle Inhalte sind auf diesem Gerät gespeichert – die App funktioniert auch ohne Internet.' : 'Die Inhalte werden gerade für die Offline-Nutzung gespeichert. Nach dem nächsten Öffnen läuft die App auch ohne Internet.'}</p>
        <div class="row"><button class="btn small" type="button" data-update-suchen>Nach neuen Inhalten suchen</button><a class="btn small" href="pruefungstrainer-offline.html" download>Offline-Datei für den PC laden</a></div>`;
    const dateiKnopf = UMGEBUNG !== 'claude' ? '<button class="btn" type="button" data-export="datei">Als Datei sichern</button>' : '';
    return `<div class="read stack-lg"><div class="stack"><span class="label">Einstellungen</span><h1>App & Lernstand</h1></div>
      <section class="card stack"><h2>Wo dein Lernstand liegt</h2><p>${ort}</p>
        <div class="stats"><div class="stat"><b>${z.haken}</b><span>Häkchen</span></div><div class="stat"><b>${z.notizen}</b><span>Notizen</span></div><div class="stat"><b>${z.quiz}</b><span>Quiz-Ergebnisse</span></div></div>
        ${z.letzte ? `<p class="muted" style="font-size:.86rem">Zuletzt geändert: ${new Date(z.letzte).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</p>` : ''}</section>
      <section class="card stack"><h2>Als App installieren</h2>${install}</section>
      <section class="card stack"><h2>Offline lernen</h2>${offline}</section>
      <section class="card stack" id="uebertragen"><h2>Lernstand übertragen</h2>
        <p>So nimmst du Häkchen, Notizen, Quiz-Ergebnisse und Karteikarten auf ein anderes Gerät mit – zum Beispiel vom PC aufs Handy oder vom Claude-Link in die App.</p>
        <ol class="schritte"><li>Hier auf <strong>Übertragungscode kopieren</strong> tippen.</li><li>Den Code an dich selbst schicken (Messenger, Mail, Notiz).</li><li>Auf dem anderen Gerät hier einfügen und <strong>Code übernehmen</strong>.</li></ol>
        <div class="row"><button class="btn pri" type="button" data-export="code">Übertragungscode kopieren</button>${dateiKnopf}</div>
        <textarea class="notiz" id="code-feld" rows="3" style="min-height:90px" placeholder="Code hier einfügen" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
        <div class="row"><button class="btn" type="button" data-import="code">Code übernehmen</button><label class="btn" for="import-datei">Datei laden</label><input type="file" id="import-datei" accept=".json,application/json" hidden></div>
        <p class="muted" style="font-size:.86rem">Beim Übernehmen gilt pro Lernfeld der neuere Stand. Dein bisheriger Stand wird nicht gelöscht, wenn er neuer ist.</p></section>
    </div>`;
  }

  // Übertragungscode: JSON → gzip (falls verfügbar) → base64url, mit Präfix BK1. bzw. BK0.
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; };
  const exportObjekt = () => ({ app: 'bk-pruefungstrainer', version: 1, exportiert: Date.now(), docs });
  async function zuCode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
      const strom = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      return 'BK1.' + b64(new Uint8Array(await new Response(strom).arrayBuffer()));
    }
    return 'BK0.' + b64(bytes);
  }
  async function ausCode(code) {
    code = String(code || '').replace(/\s+/g, '');
    const pre = code.slice(0, 4), daten = unb64(code.slice(4));
    if (pre === 'BK1.') { const strom = new Blob([daten]).stream().pipeThrough(new DecompressionStream('gzip')); return JSON.parse(await new Response(strom).text()); }
    if (pre === 'BK0.') return JSON.parse(new TextDecoder().decode(daten));
    throw new Error('format');
  }
  function importieren(obj) {
    if (!obj || obj.app !== 'bk-pruefungstrainer' || typeof obj.docs !== 'object') throw new Error('format');
    let n = 0;
    Object.keys(obj.docs).forEach(k => {
      if (!/^(lf\d{1,2}|allgemein)$/.test(k)) return;
      const r = obj.docs[k];
      if (!r || typeof r !== 'object') return;
      if (!docs[k] || (r.t || 0) > (docs[k].t || 0)) { docs[k] = r; n++; if (db && uid) pending[k] = true; }
    });
    saveLocal();
    if (db && uid && n) flush();
    return n;
  }
  async function kopieren(text, okText) {
    try { await navigator.clipboard.writeText(text); toast(okText || 'Kopiert'); return true; }
    catch (e) { return false; }
  }

  // Service Worker: offline speichern und über neue Inhalte informieren (nur in der App-Version)
  function updateLeiste() {
    if ($('.update-leiste')) return;
    const el = document.createElement('div');
    el.className = 'update-leiste'; el.setAttribute('role', 'status');
    el.innerHTML = '<span>Neue Inhalte verfügbar</span><button type="button" class="btn small pri" data-update-laden>Jetzt laden</button>';
    document.body.appendChild(el);
  }
  // Nur die gebaute App (dist/, mit Manifest) hat einen Service Worker.
  if (UMGEBUNG === 'web' && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && document.querySelector('link[rel="manifest"]')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      swReg = reg;
      const merke = w => { wartenderSW = w; updateLeiste(); };
      if (reg.waiting && navigator.serviceWorker.controller) merke(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const neu = reg.installing;
        if (neu) neu.addEventListener('statechange', () => {
          if (neu.state === 'installed' && navigator.serviceWorker.controller) merke(neu);
          if (neu.state === 'activated') { const st = $('#offline-status'); if (st) st.textContent = 'Alle Inhalte sind auf diesem Gerät gespeichert – die App funktioniert auch ohne Internet.'; }
        });
      });
    }).catch(() => { /* ohne Offline-Speicher weiter */ });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateAngefordert) location.reload(); });
    let letzteSuche = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && swReg && Date.now() - letzteSuche > 30 * 60000) { letzteSuche = Date.now(); swReg.update().catch(() => {}); }
    });
  }

  // ---------- Nach dem Zeichnen: Inhaltsverzeichnis, Tabellen, Grafiken ----------
  function afterRender(r) {
    $$('.saved').forEach(el => { el.textContent = ''; });
    // Inhaltsübersicht für lange Erklärungen
    const erkl = $('#erklaerung');
    if (erkl) {
      const hs = $$(':scope > h4', erkl);
      if (hs.length >= 3) {
        hs.forEach((h, i) => { h.id = 'abschnitt-' + i; });
        erkl.insertAdjacentHTML('beforebegin', `<details class="toc"><summary>Inhalt · ${hs.length} Abschnitte</summary>${hs.map((h, i) => `<button type="button" data-toc="${i}">${esc(h.textContent)}</button>`).join('')}</details>`);
      }
    }
    // Grafiken: auf dem Handy per Tippen vergrößern
    $$('main figure.grafik').forEach(f => {
      if ($('.zoom-hint', f)) return;
      f.insertAdjacentHTML('beforeend', '<div class="zoom-hint"><button type="button" data-zoom>Grafik groß anzeigen</button></div>');
    });
    tabellenHinweise(main);
    // Aktiven Reiter in den sichtbaren Bereich schieben
    const tabs = $('.tabs'), akt = tabs && $('[aria-current="true"]', tabs);
    if (akt) tabs.scrollLeft = Math.max(0, akt.offsetLeft - (tabs.clientWidth - akt.offsetWidth) / 2);
    if (r && r.view === 'training' && trainingModus === 'sim' && simSitzung && simSitzung.start && !simSitzung.fertig) simTick();
    nachObenPruefen();
  }
  function tabellenHinweise(root) {
    $$('.tab-wrap', root).forEach(w => {
      const prev = w.previousElementSibling, hat = prev && prev.classList.contains('wisch');
      const breit = w.clientWidth > 0 && w.scrollWidth > w.clientWidth + 4;
      if (breit && !hat) w.insertAdjacentHTML('beforebegin', '<div class="wisch" aria-hidden="true">Tabelle seitlich wischen</div>');
      if (!breit && hat && w.clientWidth > 0) prev.remove();
    });
  }
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => tabellenHinweise(main), 200); });
  document.addEventListener('toggle', e => { if (e.target.tagName === 'DETAILS' && e.target.open) tabellenHinweise(e.target); }, true);

  // Vergrößerte Grafik
  function zoomAuf(fig) {
    const ov = document.createElement('div');
    ov.className = 'zoom'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Grafik vergrößert');
    ov.innerHTML = '<div class="zoom-bar"><span>Grafik</span><button type="button" data-zoomzu>Schließen</button></div><div class="zoom-body"></div><p class="zoom-tipp">Zum Verschieben wischen · Handy quer drehen für mehr Platz</p>';
    const kopie = fig.cloneNode(true);
    const hint = $('.zoom-hint', kopie); if (hint) hint.remove();
    $('.zoom-body', ov).appendChild(kopie);
    document.body.appendChild(ov); document.body.classList.add('zoom-offen');
    // Eigener Verlaufseintrag: Die Zurück-Geste des Handys schließt zuerst die Großansicht.
    try { history.pushState({ zoom: 1 }, '', location.href); } catch (e) { /* ohne Verlauf weiter */ }
    $('[data-zoomzu]', ov).focus();
  }
  function zoomZu(ausVerlauf) {
    const ov = $('.zoom'); if (!ov) return;
    ov.remove();
    document.body.classList.remove('zoom-offen');
    if (!ausVerlauf && history.state && history.state.zoom) history.back();
  }
  window.addEventListener('popstate', () => { if ($('.zoom')) zoomZu(true); });

  // Nach-oben-Knopf
  const nachOben = $('#nach-oben');
  let scrollPlan = false;
  function nachObenPruefen() { nachOben.hidden = window.scrollY < 1400; }
  window.addEventListener('scroll', () => { if (scrollPlan) return; scrollPlan = true; requestAnimationFrame(() => { scrollPlan = false; nachObenPruefen(); }); }, { passive: true });
  nachOben.addEventListener('click', () => window.scrollTo({ top: 0, behavior: weich() }));

  // ---------- Interaktion ----------
  function quizAntwort(btn) {
    const box = btn.closest('.quiz-q'); if (!box || box.dataset.done) return;
    box.dataset.done = '1';
    const ok = btn.dataset.richtig === '1';
    $$('.opt', box).forEach(b => { b.disabled = true; if (b.dataset.richtig === '1') b.classList.add('richtig'); });
    if (!ok) btn.classList.add('falsch');
    const erkl = $('.erkl', box);
    if (erkl && erkl.textContent.trim()) { erkl.hidden = false; erkl.insertAdjacentHTML('afterbegin', `<strong>${ok ? 'Richtig. ' : 'Leider falsch. '}</strong>`); }
    if (navigator.vibrate && !ok) { try { navigator.vibrate(60); } catch (e) { /* nicht unterstützt */ } }
    const key = box.dataset.q, allg = doc('allgemein');
    if (ok) delete allg.fehler[key]; else allg.fehler[key] = 1;
    touch('allgemein');
    const wrap = box.closest('[data-quiz]');
    if (wrap && wrap.dataset.quiz === 'training') {
      if (ok) quizSitzung.richtig++;
      const w = $('#weiter-row'); w.hidden = false;
      w.scrollIntoView({ block: 'nearest', behavior: weich() });
      return;
    }
    // Themen-Quiz: auswerten, wenn alle Fragen beantwortet sind
    const alle = $$('.quiz-q', wrap), fertig = alle.filter(q => q.dataset.done);
    if (fertig.length === alle.length) {
      const richtig = alle.filter(q => !$('.opt.falsch', q)).length;
      const [nr, k] = wrap.dataset.quiz.split(':');
      const d = doc('lf' + nr), alt = d.quiz[k];
      d.quiz[k] = { letzt: richtig, best: Math.max(richtig, alt ? alt.best : 0) };
      touch('lf' + nr);
      const erg = $('#quiz-ergebnis');
      if (erg) {
        erg.innerHTML = `<div class="card ergebnis" style="padding:18px"><span class="label">Quiz ausgewertet</span><div class="big" style="font-size:2.2rem">${richtig}/${alle.length}</div><p>${richtig === alle.length ? 'Volle Punktzahl!' : 'Schau dir die Erklärungen der falschen Antworten an.'}</p><button class="btn" type="button" data-quiz-neu="1">Quiz wiederholen</button></div>`;
        erg.scrollIntoView({ block: 'nearest', behavior: weich() });
      }
      aktualisiereKopf(+nr, k);
    }
  }
  // Fortschritt im Themenkopf und in den Reitern ohne Neuzeichnen aktualisieren
  function aktualisiereKopf(nr, k) {
    const inh = inhalt(nr); if (!inh) return;
    const th = inh.themen.find(x => x.id === k); if (!th) return;
    const s = themaStand(nr, th), fort = $('.th-fort');
    if (fort) fort.innerHTML = `${bar(s.p)}<div class="row"><span><b>${s.zOk}/${s.zZiel}</b> Lernziele</span><span><b>${s.aOk}/${s.aGes}</b> Aufgaben</span><span><b>${s.qBest != null ? s.qBest + '/' + s.qGes : '–'}</b> Quiz</span><span><b>${s.p} %</b></span></div>`;
    themaTabs(nr, th).forEach(t => {
      const a = $(`.tabs [data-tab="${t.id}"]`); if (!a) return;
      const n = $('.n', a); if (n && t.n) n.textContent = t.n;
      a.classList.toggle('fertig', !!t.fertig);
    });
  }
  function tabWechsel(tab) {
    const r = parseRoute(route()); if (r.view !== 'thema') return;
    history.replaceState(null, '', `#lf${r.nr}-${r.th.id}.${tab}`);
    render('tab');
  }

  let kartenGewischt = false;
  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('zoom')) { zoomZu(); return; }
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.hasAttribute('data-zoomzu')) { zoomZu(); return; }
    if (t.hasAttribute('data-hinweis-zu')) { try { localStorage.setItem('bk-app-hinweis', 'zu'); } catch (err) { /* egal */ } const k = t.closest('.app-karte'); if (k) k.remove(); return; }
    if (t.hasAttribute('data-installieren')) { if (installEreignis) { installEreignis.prompt(); installEreignis.userChoice.finally(() => { installEreignis = null; render('keep'); }); } return; }
    if (t.hasAttribute('data-update-laden')) { updateAngefordert = true; if (wartenderSW) wartenderSW.postMessage('skipWaiting'); else location.reload(); return; }
    if (t.hasAttribute('data-update-suchen')) {
      if (!swReg) { toast('Offline-Speicher ist hier nicht aktiv'); return; }
      t.disabled = true; t.textContent = 'Suche …';
      swReg.update().then(() => { setTimeout(() => { t.disabled = false; t.textContent = 'Nach neuen Inhalten suchen'; if (!wartenderSW && !swReg.installing) toast('Du hast schon den neuesten Stand'); }, 1500); }).catch(() => { t.disabled = false; t.textContent = 'Nach neuen Inhalten suchen'; toast('Keine Verbindung – später nochmal versuchen'); });
      return;
    }
    if (t.dataset.kopieren) { kopieren(t.dataset.kopieren, 'Link kopiert').then(ok => { if (!ok) toast('Bitte den Link markieren und kopieren'); }); return; }
    if (t.dataset.export === 'code') {
      zuCode(exportObjekt()).then(code => {
        const feld = $('#code-feld'); if (feld) { feld.value = code; }
        kopieren(code, 'Übertragungscode kopiert').then(ok => { if (!ok && feld) { feld.focus(); feld.select(); toast('Code markiert – jetzt kopieren'); } });
      });
      return;
    }
    if (t.dataset.export === 'datei') {
      const blob = new Blob([JSON.stringify(exportObjekt(), null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'pruefungstrainer-lernstand-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Lernstand als Datei gesichert');
      return;
    }
    if (t.dataset.import === 'code') {
      const feld = $('#code-feld'), code = feld ? feld.value.trim() : '';
      if (!code) { toast('Erst einen Code einfügen'); return; }
      ausCode(code).then(obj => { const n = importieren(obj); feld.value = ''; toast(n ? plural(n, 'Bereich', 'Bereiche') + ' übernommen' : 'Nichts übernommen – dein Stand hier ist neuer'); if (n) render('keep'); })
        .catch(() => toast('Der Code ist unvollständig oder ungültig'));
      return;
    }
    if (t.hasAttribute('data-zoom')) { const f = t.closest('figure.grafik'); if (f) zoomAuf(f); return; }
    if (t.dataset.tab) { e.preventDefault(); tabWechsel(t.dataset.tab); return; }
    if (t.dataset.toc != null) {
      const h = document.getElementById('abschnitt-' + t.dataset.toc), d = t.closest('details');
      if (d) d.open = false; // erst zuklappen, sonst verschiebt sich das Ziel nach dem Sprung
      if (h) requestAnimationFrame(() => h.scrollIntoView({ behavior: weich(), block: 'start' }));
      return;
    }
    if (t.dataset.opt != null) { quizAntwort(t); return; }
    if (t.dataset.quizNeu) { render('keep'); const p = $('#panel'); if (p) p.scrollIntoView({ block: 'start' }); window.scrollBy(0, -topHoehe() - 70); return; }
    if (t.dataset.aufg) {
      const [nr, k, i, r] = t.dataset.aufg.split(':'); const d = doc('lf' + nr), key = k + '__' + i;
      d.aufg[key] = d.aufg[key] === r ? '' : r; touch('lf' + nr);
      const art = t.closest('.aufgabe'); art.dataset.r = d.aufg[key];
      $$('[data-aufg]', art).forEach(b => b.setAttribute('aria-pressed', String(!!d.aufg[key] && b.dataset.aufg.endsWith(':' + d.aufg[key]))));
      toast(d.aufg[key] === 'ok' ? 'Als gekonnt markiert' : d.aufg[key] === 'nochmal' ? 'Zum Wiederholen vorgemerkt' : 'Markierung entfernt');
      aktualisiereKopf(+nr, k);
      return;
    }
    if (t.dataset.train) {
      const v = t.dataset.train;
      if (v.startsWith('karten-')) { trainingModus = 'karten'; trainingFilter = v.slice(7); kartenSitzung = null; }
      else { trainingModus = 'quiz'; trainingFilter = v; quizSitzung = null; }
      if (location.hash === '#training') { e.preventDefault(); render('nav'); }
      return; // Link navigiert zu #training
    }
    if (t.dataset.gmodus) { glossarModus = t.dataset.gmodus; render('keep'); return; }
    if (t.dataset.modus) { trainingModus = t.dataset.modus; if (trainingModus !== 'quiz' && trainingFilter === 'fehler') trainingFilter = 'alle'; render('keep'); return; }
    if (t.dataset.sim) {
      if (t.dataset.sim === 'start') { const pool = alleFragen(trainingFilter); simSitzung = { filter: trainingFilter, start: Date.now(), fragen: shuffle(pool).slice(0, SIM_FRAGEN).map(x => Object.assign({}, x, { ordnung: shuffle(x.f.optionen.map((_, j) => j)) })), antw: {}, fertig: false }; $('#training-feld').innerHTML = trainingSim(); simTick(); $('#training-feld').scrollIntoView({ block: 'start' }); window.scrollBy(0, -topHoehe() - 8); }
      else if (t.dataset.sim === 'neu') { simSitzung = null; $('#training-feld').innerHTML = trainingSim(); tabellenHinweise(main); }
      else simAbgeben();
      return;
    }
    if (t.dataset.simopt) {
      const [i, j] = t.dataset.simopt.split(':').map(Number); simSitzung.antw[i] = j;
      $$('.opt', t.closest('.opts')).forEach(b => { const an = b === t; b.setAttribute('aria-pressed', String(an)); b.classList.toggle('gewaehlt', an); });
      const lab = $('#sim-stand'); if (lab) lab.textContent = Object.keys(simSitzung.antw).length + ' / ' + simSitzung.fragen.length + ' beantwortet';
      return;
    }
    if (t.dataset.filter) { trainingFilter = t.dataset.filter; quizSitzung = null; kartenSitzung = null; if (!(simSitzung && simSitzung.start && !simSitzung.fertig)) simSitzung = null; render('keep'); return; }
    if (t.dataset.weiter) { quizSitzung.pos++; $('#training-feld').innerHTML = trainingQuiz(); $('#training-feld').scrollIntoView({ block: 'start' }); window.scrollBy(0, -topHoehe() - 8); return; }
    if (t.dataset.neu) { if (t.dataset.neu === 'quiz') quizSitzung = null; else kartenSitzung = null; $('#training-feld').innerHTML = trainingFeld(); return; }
    if (t.dataset.flip) { if (kartenGewischt) { kartenGewischt = false; return; } kartenSitzung.offen = !kartenSitzung.offen; $('#training-feld').innerHTML = trainingKarten(); return; }
    if (t.dataset.karte) { karteBewerten(t.dataset.karte); return; }
  });

  // Karteikarten wischen
  let wisch = null;
  document.addEventListener('pointerdown', e => {
    const k = e.target.closest && e.target.closest('.karte');
    if (!k || !kartenSitzung || !kartenSitzung.offen) return;
    wisch = { k, x: e.clientX, y: e.clientY, dx: 0, aktiv: false };
  });
  document.addEventListener('pointermove', e => {
    if (!wisch) return;
    wisch.dx = e.clientX - wisch.x;
    const dy = e.clientY - wisch.y;
    if (!wisch.aktiv && Math.abs(wisch.dx) > 12 && Math.abs(wisch.dx) > Math.abs(dy)) wisch.aktiv = true;
    if (wisch.aktiv) { wisch.k.style.transition = 'none'; wisch.k.style.transform = `translateX(${wisch.dx}px) rotate(${wisch.dx / 25}deg)`; }
  });
  function wischEnde() {
    if (!wisch) return;
    const w = wisch; wisch = null;
    if (!w.aktiv) return;
    kartenGewischt = true; setTimeout(() => { kartenGewischt = false; }, 400);
    w.k.style.transition = '';
    if (Math.abs(w.dx) > 90) { w.k.style.transform = ''; w.k.classList.add(w.dx > 0 ? 'weg-r' : 'weg-l'); setTimeout(() => karteBewerten(w.dx > 0 ? 'ja' : 'nein'), 180); }
    else w.k.style.transform = '';
  }
  document.addEventListener('pointerup', wischEnde);
  document.addEventListener('pointercancel', wischEnde);

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.zoom')) zoomZu(); });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.ziel) {
      const [nr, k, i] = t.dataset.ziel.split(':'); const d = doc('lf' + nr);
      if (t.checked) d.ziele[k + '__' + i] = 1; else delete d.ziele[k + '__' + i];
      touch('lf' + nr); aktualisiereKopf(+nr, k);
      const lab = t.closest('.sec') && $('.sec-h .label', t.closest('.sec'));
      if (lab) { const inh = inhalt(+nr), th = inh && inh.themen.find(x => x.id === k); if (th) { const s = themaStand(+nr, th); lab.textContent = `${s.zOk} / ${s.zZiel} abgehakt`; } }
      if (t.checked) toast('Lernziel abgehakt');
    } else if (t.dataset.rlp) {
      const [nr, i] = t.dataset.rlp.split(':'); const d = doc('lf' + nr);
      if (t.checked) d.rlp[i] = 1; else delete d.rlp[i];
      touch('lf' + nr);
    } else if (t.dataset.vorb != null) {
      const allg = doc('allgemein'); if (t.checked) allg['vorb' + t.dataset.vorb] = 1; else delete allg['vorb' + t.dataset.vorb];
      touch('allgemein');
    } else if (t.dataset.tipp != null) {
      const allg = doc('allgemein'); if (t.checked) allg['tipp' + t.dataset.tipp] = 1; else delete allg['tipp' + t.dataset.tipp];
      touch('allgemein');
    } else if (t.id === 'import-datei' && t.files && t.files[0]) {
      t.files[0].text().then(txt => { const n = importieren(JSON.parse(txt)); toast(n ? plural(n, 'Bereich', 'Bereiche') + ' übernommen' : 'Nichts übernommen – dein Stand hier ist neuer'); if (n) render('keep'); })
        .catch(() => toast('Die Datei ist keine Lernstand-Sicherung'));
      t.value = '';
    } else if (t.id === 'pruefdatum') {
      doc('allgemein').datum = t.value; touch('allgemein'); render('keep'); toast(t.value ? 'Prüfungstermin gespeichert' : 'Prüfungstermin entfernt');
    }
  });

  // Notizen: beim Tippen verzögert speichern, beim Verlassen sofort
  const notizTimer = {};
  function notizSpeichern(feld) {
    const [lf, k] = feld.dataset.notiz.split(':');
    clearTimeout(notizTimer[feld.dataset.notiz]); delete notizTimer[feld.dataset.notiz];
    if ((doc(lf).notiz[k] || '') === feld.value) return;
    doc(lf).notiz[k] = feld.value; touch(lf);
    const el = $(`[data-saved="${feld.dataset.notiz}"]`);
    if (el) el.textContent = 'gespeichert ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.notiz) {
      const el = $(`[data-saved="${t.dataset.notiz}"]`); if (el) el.textContent = 'tippt …';
      clearTimeout(notizTimer[t.dataset.notiz]);
      notizTimer[t.dataset.notiz] = setTimeout(() => notizSpeichern(t), 600);
    } else if (t.id === 'glossar-suche') {
      glossarSuche = t.value; $('#glossar-liste').innerHTML = glossarListe();
    }
  });
  document.addEventListener('focusout', e => { if (e.target.dataset && e.target.dataset.notiz) notizSpeichern(e.target); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      $$('textarea[data-notiz]').forEach(notizSpeichern);
      if (Object.keys(pending).length) flush();
    } else if (db) {
      pull().then(changed => { if (Object.keys(pending).length) flush(); if (changed) neuZeichnenNachAbgleich(); }).catch(() => {});
    }
  });

  render('nav');
  if (UMGEBUNG === 'claude') initSync(); else setSync();
})();
