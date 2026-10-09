// Gesprächsleitfaden für den Prüfungsbereich „Kunden beraten“ (Gesprächssimulation, Teil 2).
window.LP = window.LP || {};
window.LP.beratung = {
  intro: `<p>In „Kunden beraten“ (30 % der Gesamtnote) wählst du aus <strong>zwei Aufgaben</strong> eine aus, bereitest dich <strong>15 Minuten</strong> vor und führst dann ein <strong>Beratungsgespräch von höchstens 30 Minuten</strong> mit einem Prüfer in der Kundenrolle. Bewertet wird nicht nur, ob dein Produktvorschlag stimmt, sondern vor allem <strong>wie</strong> du den Bedarf ermittelst, argumentierst und das Gespräch führst.</p>`,
  phasen: [
    { titel: 'Kontakt und Gesprächseröffnung', ziel: 'Eine angenehme Atmosphäre schaffen und den Anlass klären.',
      tun: ['Mit Namen begrüßen, dich vorstellen, Platz und Getränk anbieten', 'Anlass aufgreifen und den Ablauf kurz ankündigen', 'Zeitrahmen klären'],
      saetze: ['„Guten Tag, Frau Schubert, schön, dass Sie da sind. Mein Name ist … Was führt Sie heute zu uns?“', '„Damit ich Ihnen genau das Passende vorschlagen kann, würde ich Ihnen zuerst ein paar Fragen stellen. Ist das in Ordnung?“'] },
    { titel: 'Bedarfsermittlung', ziel: 'Ziele, Situation und Wünsche des Kunden vollständig verstehen. Das ist die wichtigste Phase.',
      tun: ['Offene W-Fragen stellen (Was? Wofür? Wann? Wie wichtig?)', 'Wirtschaftliche Verhältnisse erfragen: Einkommen, Ausgaben, Vermögen, Verbindlichkeiten', 'Bei Anlagen: Anlageziel, Anlagedauer, Risikobereitschaft, Kenntnisse und Erfahrungen; bei Krediten: Verwendungszweck, Rate, Laufzeit, Sicherheiten', 'Aktiv zuhören und zusammenfassen'],
      saetze: ['„Wofür möchten Sie das Geld später verwenden?“', '„Wie wichtig ist es Ihnen, jederzeit an das Geld zu kommen?“', '„Habe ich Sie richtig verstanden, dass …?“'] },
    { titel: 'Lösung und Nutzenargumentation', ziel: 'Ein passendes Angebot vorstellen und den Nutzen für genau diesen Kunden zeigen.',
      tun: ['Höchstens zwei Alternativen vorstellen, nicht den ganzen Produktkatalog', 'Merkmal → Vorteil → Nutzen verbinden („Sie-Formulierungen“)', 'Zahlen konkret machen: Rate, Zins, Ertrag, Kosten', 'Fachbegriffe kundenfreundlich erklären'],
      saetze: ['„Weil Ihnen Sicherheit besonders wichtig ist, empfehle ich Ihnen …“', '„Das bedeutet für Sie konkret: …“'] },
    { titel: 'Einwandbehandlung', ziel: 'Bedenken ernst nehmen und entkräften, ohne zu streiten.',
      tun: ['Einwand ausreden lassen und wertschätzend aufgreifen', 'Rückfrage stellen, was genau dahintersteckt', 'Mit Nutzen oder Alternative antworten (Ja-aber vermeiden, besser „Ja, und …“)'],
      saetze: ['„Das kann ich gut verstehen. Was genau macht Ihnen dabei Sorgen?“', '„Gerade deshalb ist … für Sie interessant, weil …“'] },
    { titel: 'Abschluss', ziel: 'Eine klare Entscheidung oder einen konkreten nächsten Schritt erreichen.',
      tun: ['Kaufsignale erkennen und Abschlussfrage stellen', 'Rechtliche Pflichten nennen: Legitimation, Widerrufsrecht, Geeignetheitserklärung bei Wertpapieren, ESIS-Merkblatt bei Immobilienkrediten', 'Ergebnis zusammenfassen'],
      saetze: ['„Sollen wir das so für Sie einrichten?“', '„Dann fasse ich noch einmal zusammen: …“'] },
    { titel: 'Zusatzbedarf und Verabschiedung', ziel: 'Weiteren Bedarf ansprechen und positiv enden.',
      tun: ['Cross-Selling passend zum Gespräch (z. B. Absicherung, Online-Banking, Sparplan)', 'Nächsten Termin oder Kontaktweg anbieten', 'Freundlich verabschieden'],
      saetze: ['„Sie hatten vorhin Ihre Tochter erwähnt. Haben Sie schon über einen Sparplan für sie nachgedacht?“', '„Bei Fragen erreichen Sie mich direkt unter … Ich wünsche Ihnen einen schönen Tag.“'] }
  ],
  kriterien: [
    'Gesprächseröffnung und Kontaktaufbau',
    'Bedarfsermittlung: vollständig, mit offenen Fragen, zusammengefasst',
    'Fachliche Richtigkeit der Lösung und der Zahlen',
    'Kundenorientierte Argumentation (Nutzen statt Merkmale)',
    'Umgang mit Einwänden',
    'Abschlussorientierung und rechtliche Hinweise',
    'Kommunikation: verständliche Sprache, Körpersprache, Zuhören'
  ],
  vorbereitung: [
    'Aufgabe auswählen: in 1–2 Minuten entscheiden, welche dir fachlich sicherer liegt',
    'Stichwortzettel mit den sechs Phasen anlegen',
    'Drei bis fünf offene Fragen zur Bedarfsermittlung notieren',
    'Zwei Lösungen mit Zahlen vorbereiten (Rate, Zins, Ertrag)',
    'Zwei mögliche Einwände und deine Antwort notieren',
    'Rechtliche Pflichten und eine Cross-Selling-Idee notieren'
  ],
  fall: {
    titel: 'Übungsfall: Inflation frisst das Ersparte',
    situation: `<p>Herr Lehmann (54), Kunde der Sparkasse in Chemnitz, hat 30.000 € auf dem Girokonto, das nicht verzinst wird. Er hat in der Zeitung gelesen, dass die Inflation „das Geld auffrisst“, und fragt, was er tun soll. Er möchte das Geld in fünf Jahren für den Umbau seines Hauses verwenden und mag kein Risiko.</p>`,
    aufgabe: 'Führe das Beratungsgespräch. Erkläre Herrn Lehmann verständlich, was der Realzins ist, und schlage eine passende Lösung vor.',
    loesung: `<p><strong>Bedarfsermittlung:</strong> Anlagedauer genau 5 Jahre, Sicherheit hat Vorrang, Verfügbarkeit erst zum Umbau nötig, Notgroschen vorhanden? Freistellungsauftrag erteilt?</p>
      <p><strong>Realzins erklären (LF 10):</strong> Realzins ≈ Nominalzins − Inflationsrate. Bei 0 % Zinsen auf dem Girokonto und angenommen 2 % Inflation verliert Herr Lehmann pro Jahr rund 600 € Kaufkraft (30.000 € × 2 %).</p>
      <p><strong>Lösungsidee:</strong> Notgroschen (z. B. drei Nettogehälter) auf Tagesgeld, den Rest auf ein Festgeld oder einen Sparbrief mit passender Laufzeit bzw. gestaffelt, damit das Geld zum Umbau verfügbar ist. Einlagensicherung bis 100.000 € je Kunde und Institut als Sicherheitsargument; bei Sparkassen zusätzlich die Institutssicherung.</p>
      <p><strong>Einwand „Die Zinsen gleichen die Inflation ja trotzdem nicht ganz aus“:</strong> Ehrlich bleiben, dass sichere Anlagen die Inflation nicht immer schlagen, aber der Verlust deutlich kleiner ist als auf dem Girokonto. Höhere Renditen wären nur mit mehr Risiko möglich, was er nicht möchte.</p>
      <p><strong>Abschluss und Zusatzbedarf:</strong> Festgeld eröffnen, Freistellungsauftrag prüfen, für den Umbau später eine Modernisierungsfinanzierung oder Förderkredite ansprechen.</p>`
  }
};
