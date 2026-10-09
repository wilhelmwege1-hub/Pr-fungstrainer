window.LP = window.LP || {};

// Lernfelder nach KMK-Rahmenlehrplan Bankkaufmann/Bankkauffrau (Beschluss vom 13.12.2019)
// bzw. sächsischem „Arbeitsmaterial/Lehrplan Berufsschule Bankkaufmann“ (Schulportal Sachsen).
// Zeitrichtwerte in Unterrichtsstunden; Summe 880 Std. (1. Jahr 320, 2. Jahr 280, 3. Jahr 280).
// Prüfungsstruktur nach Bankkaufleuteausbildungsverordnung (BankkflAusbV) vom 5.2.2020.
window.LP.lernfelder = [
  { nr: 1, titel: "Die eigene Rolle im Betrieb und im Wirtschaftsleben mitgestalten", jahr: 1, stunden: 80,
    kern: "Die Auszubildenden reflektieren ihre Rolle als Auszubildende und Mitarbeitende eines Kreditinstituts und wirken an der Gestaltung ihrer Ausbildung, ihrer Arbeitsbedingungen und ihres Betriebs im Wirtschaftsleben mit.",
    themen: [
      "Duales System, BBiG und Ausbildungsvertrag",
      "Arbeitsvertrag, Tarifvertrag, Arbeitsschutz, Jugendarbeitsschutz",
      "Betriebliche Mitbestimmung: Betriebs-/Personalrat, JAV",
      "Sozialversicherung und Entgeltabrechnung",
      "Kreditinstitute im Wirtschaftskreislauf, Drei-Säulen-Bankensystem",
      "Rechtsformen und Ziele von Kreditinstituten",
      "Aufbau- und Ablauforganisation der Bank",
      "Rechtsgeschäfte, Rechts- und Geschäftsfähigkeit"
    ],
    pruefung: "Teil 2 – Wirtschafts- und Sozialkunde (60 Min., 10 %); Grundlagen (z. B. Geschäftsfähigkeit) auch für Teil 1" },

  { nr: 2, titel: "Konten für Privatkunden führen und den Zahlungsverkehr abwickeln", jahr: 1, stunden: 80,
    kern: "Die Auszubildenden beraten Privatkunden über die Eröffnung, Führung und Auflösung von Konten sowie über Zahlungsverkehrsprodukte, schließen Kontoverträge ab und wickeln den Zahlungsverkehr ab.",
    themen: [
      "Kontoeröffnung: Legitimation nach Geldwäschegesetz",
      "Rechts- und Geschäftsfähigkeit, Minderjährigenkonten",
      "Kontoarten, Gemeinschaftskonten, Vollmachten",
      "Basiskonto und Pfändungsschutzkonto",
      "SEPA-Überweisung, Echtzeitüberweisung, SEPA-Lastschrift",
      "Debit- und Kreditkarten, mobiles Bezahlen",
      "Online-Banking, Datenschutz, AGB",
      "Kontoabschluss, Entgelte, Tod des Kontoinhabers"
    ],
    pruefung: "Teil 1 – Konten führen und Anschaffungen finanzieren; Teil 2 – Kunden beraten (Tätigkeit „Konten führen“)" },

  { nr: 3, titel: "Konten für Geschäfts- und Firmenkunden führen und den Zahlungsverkehr abwickeln", jahr: 1, stunden: 60,
    kern: "Die Auszubildenden führen Konten für Geschäfts- und Firmenkunden unter Beachtung von Rechtsform, Vertretungs- und Haftungsverhältnissen und wickeln den nationalen und internationalen Zahlungsverkehr ab.",
    themen: [
      "Kaufmannseigenschaft, Handelsregister, Firma",
      "Rechtsformen: Einzelunternehmen, GbR, OHG, KG, GmbH, AG",
      "Vertretung: Prokura, Handlungsvollmacht, Geschäftsführung",
      "Kontoeröffnung für Unternehmen, wirtschaftlich Berechtigter",
      "Transparenzregister und Geldwäscheprävention",
      "Auslandszahlungsverkehr (SEPA, SWIFT, Entgeltoptionen)",
      "Kontokorrent und Kontoabschluss",
      "Electronic Banking und Kartenakzeptanz für Händler"
    ],
    pruefung: "Teil 1 – Konten führen und Anschaffungen finanzieren" },

  { nr: 4, titel: "Kunden über Anlagen auf Konten und staatlich gefördertes Sparen beraten", jahr: 1, stunden: 40,
    kern: "Die Auszubildenden beraten Kunden bedarfsgerecht über Geldanlagen auf Konten und über staatlich gefördertes Sparen und berücksichtigen dabei Rendite, Sicherheit, Liquidität und steuerliche Aspekte.",
    themen: [
      "Sicht-, Termin- und Spareinlagen, Sparbriefe",
      "Zinsrechnung und Rendite von Kontoanlagen",
      "Einlagensicherung und Institutssicherung",
      "Abgeltungsteuer, Freistellungsauftrag, NV-Bescheinigung",
      "Vermögenswirksame Leistungen, Arbeitnehmer-Sparzulage",
      "Bausparen und Wohnungsbauprämie",
      "Inflation und Realzins"
    ],
    pruefung: "Teil 2 – Vermögen aufbauen und Risiken absichern sowie Kunden beraten (Tätigkeit „Vermögen aufbauen“); laut RLP vor Teil 1 zu unterrichten" },

  { nr: 5, titel: "Allgemein-Verbraucherdarlehensverträge abschließen", jahr: 1, stunden: 60,
    kern: "Die Auszubildenden beraten Privatkunden über die Finanzierung von Anschaffungen, prüfen die Kreditwürdigkeit und schließen Allgemein-Verbraucherdarlehensverträge unter Beachtung der Verbraucherschutzvorschriften ab.",
    themen: [
      "Finanzierungsanlass und Bedarfsermittlung",
      "Kreditwürdigkeitsprüfung: Haushaltsrechnung, SCHUFA",
      "Vorvertragliche Informationen, Widerrufsrecht",
      "Ratenkredit, Dispositions- und Überziehungskredit",
      "Effektiver Jahreszins und Tilgungsrechnung",
      "Personalsicherheiten: Bürgschaft, Lohn- und Gehaltsabtretung",
      "Sicherungsübereignung (z. B. Kfz)",
      "Kündigung, Zahlungsverzug, Restschuldversicherung"
    ],
    pruefung: "Teil 1 – Konten führen und Anschaffungen finanzieren; Teil 2 – Kunden beraten (Tätigkeit „Anschaffungen finanzieren“)" },

  { nr: 6, titel: "Marktmodelle anwenden", jahr: 2, stunden: 40,
    kern: "Die Auszubildenden analysieren Märkte – auch Finanzmärkte – mithilfe von Marktmodellen, erklären Preisbildung und Marktverhalten und beurteilen staatliche Eingriffe in den Markt.",
    themen: [
      "Bedürfnisse, Güter, ökonomisches Prinzip",
      "Nachfrage- und Angebotsverhalten",
      "Preisbildung und Gleichgewichtspreis im Polypol",
      "Marktformen: Monopol, Oligopol, Polypol",
      "Preisbildung auf Finanzmärkten (Zins, Kurs)",
      "Staatliche Eingriffe: Höchst- und Mindestpreise",
      "Wettbewerbspolitik und Kartellrecht"
    ],
    pruefung: "Kein eigener Prüfungsbereich; Bezüge zu Wirtschafts- und Sozialkunde und zu „Vermögen aufbauen …“ (kursbeeinflussende Faktoren)" },

  { nr: 7, titel: "Werteströme und Geschäftsprozesse erfassen und dokumentieren", jahr: 2, stunden: 60,
    kern: "Die Auszubildenden erfassen Werteströme und Geschäftsprozesse eines Kreditinstituts in der Buchführung und dokumentieren sie bis zum Jahresabschluss.",
    themen: [
      "Inventur, Inventar und Bilanz",
      "Bestands- und Erfolgskonten, Buchungssätze",
      "Buchungen im Kunden- und Zahlungsverkehr",
      "Buchungen im Wertpapier- und Kreditgeschäft",
      "Abschreibungen auf Sachanlagen",
      "Personalaufwand und Steuern buchen",
      "Bilanz und GuV eines Kreditinstituts",
      "Jahresabschluss-Grundlagen nach HGB"
    ],
    pruefung: "Kein eigener Prüfungsbereich; Grundlage für die Auswertung von Jahresabschlüssen in „Finanzierungsvorhaben begleiten“" },

  { nr: 8, titel: "Kunden über die Anlage in Finanzinstrumenten beraten", jahr: 2, stunden: 120,
    kern: "Die Auszubildenden analysieren Anlagewünsche und Vermögenssituation von Kunden und beraten sie anleger- und anlagegerecht über Finanzinstrumente unter Beachtung der wertpapierrechtlichen Vorgaben.",
    themen: [
      "Anlegerprofil, Anlageziele, magisches Dreieck",
      "WpHG: Geeignetheitsprüfung, Geeignetheitserklärung, Kundenkategorien",
      "Nachhaltigkeitspräferenzen (ESG) erfragen",
      "Schuldverschreibungen: Rendite, Stückzinsen",
      "Aktien: Rechte, Kapitalerhöhung, Kennzahlen",
      "Investmentfonds und ETFs",
      "Zertifikate und Optionen (Grundlagen)",
      "Börsenhandel, Kursbildung, Wertpapierabrechnung",
      "Depotgeschäft und Besteuerung von Kapitalerträgen"
    ],
    pruefung: "Teil 2 – Vermögen aufbauen und Risiken absichern; Kunden beraten (Tätigkeit „Vermögen aufbauen“)" },

  { nr: 9, titel: "Baufinanzierungen abschließen", jahr: 2, stunden: 60,
    kern: "Die Auszubildenden begleiten Privatkunden bei Immobilienvorhaben, ermitteln Finanzierungsbedarf und Kapitaldienstfähigkeit, bewerten Sicherheiten und schließen Immobiliar-Verbraucherdarlehensverträge ab.",
    themen: [
      "Ablauf des Immobilienerwerbs: Notar, Kaufvertrag, Grundbuch",
      "Finanzierungsbedarf, Eigenkapital, Kapitaldienstfähigkeit",
      "Beleihungswert und Beleihungsgrenze",
      "Grundschuld, Zweckerklärung, Rangverhältnisse",
      "Immobiliar-Verbraucherdarlehen, ESIS-Merkblatt, Widerruf",
      "Annuitätendarlehen, Zinsbindung, Vorfälligkeitsentschädigung",
      "Bauspardarlehen und KfW-Förderkredite",
      "Wohn-Riester und Finanzierungsbausteine kombinieren"
    ],
    pruefung: "Teil 2 – Finanzierungsvorhaben begleiten; Kunden beraten (Tätigkeit „Baufinanzierungsvorhaben begleiten“)" },

  { nr: 10, titel: "Gesamtwirtschaftliche Einflüsse analysieren und beurteilen", jahr: 3, stunden: 80,
    kern: "Die Auszubildenden analysieren gesamtwirtschaftliche Entwicklungen sowie geld-, fiskal- und außenwirtschaftliche Einflüsse und beurteilen deren Auswirkungen auf Kreditinstitute und Kunden.",
    themen: [
      "Wirtschaftskreislauf und Bruttoinlandsprodukt",
      "Konjunkturphasen und Konjunkturindikatoren",
      "Wirtschaftspolitische Ziele, magisches Viereck",
      "Inflation, Deflation, Verbraucherpreisindex (HVPI)",
      "Geldpolitik des Eurosystems: Leitzinsen, Instrumente",
      "Fiskalpolitik und Staatsverschuldung",
      "Außenwirtschaft: Zahlungsbilanz, Wechselkurse",
      "Arbeitsmarkt und Beschäftigung"
    ],
    pruefung: "Teil 2 – Wirtschafts- und Sozialkunde; kursbeeinflussende Faktoren auch in „Vermögen aufbauen und Risiken absichern“" },

  { nr: 11, titel: "Wertschöpfungsprozesse erfolgsorientiert steuern", jahr: 3, stunden: 80,
    kern: "Die Auszubildenden analysieren Erfolg und Risiken eines Kreditinstituts, kalkulieren Bankleistungen und leiten Maßnahmen zur erfolgsorientierten Steuerung unter Beachtung aufsichtsrechtlicher Vorgaben ab.",
    themen: [
      "Kosten- und Erlösrechnung im Kreditinstitut",
      "Zinsspanne und Gesamtbetriebskalkulation",
      "Marktzinsmethode: Konditions- und Strukturbeitrag",
      "Kalkulation: Risiko-, Betriebs-, Eigenkapitalkosten",
      "Kennzahlen, z. B. Cost-Income-Ratio",
      "Bankenaufsicht: Eigenkapital- und Liquiditätsanforderungen",
      "Risikomanagement: Adressen-, Markt-, Liquiditätsrisiko",
      "Jahresabschlussanalyse und Controlling"
    ],
    pruefung: "Kein eigener Prüfungsbereich; Bezug zu „Finanzierungsvorhaben begleiten“ (Konditionen nach Bonität, Sicherheit, Rentabilität begründen)" },

  { nr: 12, titel: "Kunden über Produkte der Vorsorge und Absicherung informieren", jahr: 3, stunden: 60,
    kern: "Die Auszubildenden informieren Kunden anlassbezogen über Möglichkeiten der Altersvorsorge (Drei-Schichten-Modell) und über Versicherungsprodukte zur Absicherung von Risiken.",
    themen: [
      "Drei-Schichten-Modell der Altersvorsorge",
      "Gesetzliche Rente und Versorgungslücke",
      "Basisrente und Riester-Rente: Förderung",
      "Betriebliche Altersversorgung, Entgeltumwandlung",
      "Private Renten- und Lebensversicherung",
      "Biometrische Risiken: BU, Risikoleben, Pflege",
      "Sachversicherungen: Haftpflicht, Hausrat, Wohngebäude",
      "Versicherungsvertrieb: Informationspflichten"
    ],
    pruefung: "Teil 2 – Vermögen aufbauen und Risiken absichern; Kunden beraten (Tätigkeit „Risiken absichern“)" },

  { nr: 13, titel: "Finanzierungen für Geschäfts- und Firmenkunden abschließen", jahr: 3, stunden: 60,
    kern: "Die Auszubildenden begleiten Finanzierungsvorhaben von Geschäfts- und Firmenkunden, beurteilen deren Kreditwürdigkeit, wählen Sicherheiten aus, begründen Konditionen und erkennen Gefährdungen von Kreditengagements.",
    themen: [
      "Kreditwürdigkeit: Jahresabschluss- und Kennzahlenanalyse",
      "Rating und Kapitaldienstfähigkeit (Cashflow)",
      "Kontokorrent-, Investitions- und Avalkredit",
      "Öffentliche Förderkredite und Leasing",
      "Sicherheiten: Bürgschaft, Zession, Sicherungsübereignung",
      "Grundschuld im Firmenkundengeschäft",
      "Frühwarnsignale, Intensivbetreuung, Sanierung",
      "Kündigung, Verwertung, Insolvenzverfahren"
    ],
    pruefung: "Teil 2 – Finanzierungsvorhaben begleiten" }
];

window.LP.pruefung = {
  stand: "2026-10",
  ueberblick: `<p><strong>Gestreckte Abschlussprüfung:</strong> Nach der Bankkaufleuteausbildungsverordnung (BankkflAusbV) vom 5. Februar 2020 besteht die Abschlussprüfung aus zwei zeitlich auseinanderliegenden Teilen. <strong>Teil 1</strong> (laut Verordnung im vierten Ausbildungshalbjahr; den konkreten Termin legt die IHK fest) prüft die Inhalte der ersten 15 Ausbildungsmonate im Prüfungsbereich „Konten führen und Anschaffungen finanzieren“ und zählt bereits mit <strong>20 %</strong> zum Endergebnis. <strong>Teil 2</strong> am Ende der Ausbildung umfasst die Bereiche „Vermögen aufbauen und Risiken absichern“ (20 %), „Finanzierungsvorhaben begleiten“ (20 %), „Kunden beraten“ (30 %) und „Wirtschafts- und Sozialkunde“ (10 %). Teil 1 ist keine Zwischenprüfung: Er kann nicht für sich allein wiederholt werden.</p>
<p><strong>Wer erstellt die Aufgaben?</strong> Zuständig für die Durchführung sind in Sachsen die <strong>IHK Chemnitz, IHK Dresden und IHK zu Leipzig</strong> (Prüfungsausschüsse vor Ort). Die schriftlichen Aufgaben werden überregional von der <strong>AkA</strong> (Aufgabenstelle für kaufmännische Abschluss- und Zwischenprüfungen, Nürnberg) erstellt; die schriftlichen Termine sind bundesweit einheitlich. Die IHK Dresden verweist für die Termine auf die AkA, die IHK Chemnitz informiert über den AkA-<strong>Prüfungskatalog für Bankkaufleute</strong> (2. Auflage mit aktualisierter Formelsammlung; erstmals Grundlage für Teil 1 im Herbst 2026 und Teil 2 im Winter 2026/27). Laut IHK-Terminübersicht liegen Teil-1-Termine im Frühjahr/Herbst (z. B. 30.09.2026 und 24.02.2027), Teil 2 im Winter bzw. Sommer – verbindlich ist immer die Einladung der eigenen IHK.</p>
<p><strong>Bestehensregeln (§ 15 BankkflAusbV):</strong> Die Prüfung ist bestanden, wenn</p>
<ul>
<li>das Gesamtergebnis aus Teil 1 und Teil 2 mindestens „ausreichend“ (50 Punkte) ist,</li>
<li>das Ergebnis von Teil 2 mindestens „ausreichend“ ist,</li>
<li>mindestens drei der vier Prüfungsbereiche von Teil 2 mindestens „ausreichend“ sind und</li>
<li>kein Prüfungsbereich von Teil 2 mit „ungenügend“ (unter 30 Punkten) bewertet wurde.</li>
</ul>
<p>Ein klassisches „Sperrfach“ gibt es nicht – faktisch wirkt aber jede „ungenügend“-Note in Teil 2 wie ein Sperrfach. Ein schwaches Teil-1-Ergebnis muss über Teil 2 ausgeglichen werden.</p>
<p><strong>Mündliche Ergänzungsprüfung (§ 16):</strong> auf Antrag in <em>einem</em> der schriftlichen Teil-2-Bereiche „Vermögen aufbauen und Risiken absichern“, „Finanzierungsvorhaben begleiten“ oder „Wirtschafts- und Sozialkunde“ – nur wenn dieser schlechter als „ausreichend“ ist und die Ergänzungsprüfung für das Bestehen den Ausschlag geben kann. Dauer ca. 15 Minuten; altes Ergebnis und Ergänzungsprüfung werden im Verhältnis <strong>2 : 1</strong> gewichtet. Für Teil 1 und „Kunden beraten“ gibt es keine Ergänzungsprüfung.</p>
<p><strong>Kunden beraten:</strong> Gesprächssimulation (Beratungsgespräch) mit dem Prüfungsausschuss als „Kunde“. Der Prüfling erhält zwei praxisbezogene Aufgaben aus unterschiedlichen Tätigkeiten zur Auswahl (Konten führen, Anschaffungen finanzieren, Vermögen aufbauen, Risiken absichern, Baufinanzierungsvorhaben im Privatkundengeschäft begleiten); die Kombinationen „Konten führen + Vermögen aufbauen“ und „Anschaffungen finanzieren + Baufinanzierung“ werden nicht zusammen angeboten. 15 Minuten für Auswahl und Vorbereitung, danach 30 Minuten Gespräch.</p>
<p><em>Hinweis Berufsschule:</em> Laut Rahmenlehrplan sind die Lernfelder 1–5 wegen ihrer Prüfungsrelevanz vor Teil 1 der Abschlussprüfung zu unterrichten.</p>`,
  teile: [
    { name: "Teil 1", zeitpunkt: "laut Verordnung im 4. Ausbildungshalbjahr; bundeseinheitliche AkA-Termine im Frühjahr/Herbst (z. B. 30.09.2026, 24.02.2027)", gewicht: "20 %",
      bereiche: [
        { name: "Konten führen und Anschaffungen finanzieren",
          form: "schriftlich, 90 Minuten, praxisbezogene Aufgaben (in der Praxis gebundene und ungebundene Aufgaben)",
          gewicht: "20 %", lernfelder: [2, 3, 5] }
      ] },
    { name: "Teil 2", zeitpunkt: "am Ende der Ausbildung (Winter- bzw. Sommerprüfung der IHK)", gewicht: "80 %",
      bereiche: [
        { name: "Vermögen aufbauen und Risiken absichern",
          form: "schriftlich, 90 Minuten, praxisbezogene Aufgaben (gebunden und ungebunden)",
          gewicht: "20 %", lernfelder: [4, 8, 12] },
        { name: "Finanzierungsvorhaben begleiten",
          form: "schriftlich, 90 Minuten, praxisbezogene Aufgaben (gebunden und ungebunden)",
          gewicht: "20 %", lernfelder: [9, 13, 11] },
        { name: "Kunden beraten",
          form: "mündlich: Gesprächssimulation; 2 Aufgaben zur Wahl, 15 Minuten Auswahl/Vorbereitung, 30 Minuten Beratungsgespräch",
          gewicht: "30 %", lernfelder: [2, 4, 5, 8, 9, 12] },
        { name: "Wirtschafts- und Sozialkunde",
          form: "schriftlich, 60 Minuten, praxisbezogene Aufgaben (überwiegend gebunden)",
          gewicht: "10 %", lernfelder: [1, 6, 10] }
      ] }
  ],
  tipps: [
    "Teil 1 zählt mit 20 % und kann nicht allein wiederholt werden – LF 2, 3 und 5 schon im ersten Jahr prüfungsreif lernen.",
    "Den AkA-Prüfungskatalog für Bankkaufleute (2. Auflage, mit Formelsammlung) als Lern-Checkliste nutzen – er zeigt, welche Inhalte in welchem Prüfungsbereich drankommen können.",
    "Zeitmanagement in 90 Minuten: Aufgabensatz zuerst überfliegen, Punkte pro Aufgabe notieren, gebundene Aufgaben zügig lösen und Zeit für Rechen- und Textaufgaben reservieren.",
    "Bei ungebundenen Rechenaufgaben immer den Rechenweg aufschreiben – Folgefehler und Teilschritte bringen Teilpunkte.",
    "Rechenklassiker drillen: Zinsen/Kontoabschluss, effektiver Jahreszins, Annuität, Beleihungsgrenze, Stückzinsen, Wertpapierabrechnung, Abgeltungsteuer mit Soli und Kirchensteuer.",
    "Hilfsmittel vorab klären: Die IHK bzw. Aufgabenstelle veröffentlicht eine Hilfsmittelliste (in der Regel nicht programmierbarer, netzunabhängiger Taschenrechner) – mit genau diesem Rechner üben.",
    "Kunden beraten: Alle fünf Tätigkeiten vorbereiten, da du nicht weißt, welches Paar kommt. Die Auswahl zwischen den zwei Aufgaben in 1–2 Minuten treffen, den Rest der 15 Minuten für einen Stichwortzettel nutzen.",
    "Gesprächsleitfaden üben: Begrüßung, Bedarfsermittlung mit offenen Fragen, Lösung mit Kundennutzen, Einwände behandeln, Abschluss/Vereinbarung, Zusatzbedarf (Cross-Selling), Verabschiedung.",
    "Gesprächssimulation regelmäßig mit Ausbilder oder Mitazubis proben – auch rechtliche Pflichten (Legitimation, Widerrufsrecht, Geeignetheitserklärung, ESIS-Merkblatt) natürlich ins Gespräch einbauen.",
    "WiSo zählt nur 10 %, aber ein „ungenügend“ (unter 30 Punkten) in einem Teil-2-Bereich bedeutet Nichtbestehen – WiSo nicht vernachlässigen; mit Original-Prüfungssätzen früherer Termine unter Zeitdruck üben."
  ],
  quellen: [
    "https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Bankkaufleute-19-12-13-EL.pdf",
    "https://www.schulportal.sachsen.de/lplandb/lehrplan/370",
    "https://www.isb.bayern.de/fileadmin/user_upload/Berufliche_Schulen/Berufsschule/Lehrplan/bs_lpr_bankkaufmann.pdf",
    "https://www.berufsbildung.nrw.de/cms/bildungsgaenge-bildungsplaene/fachklassen-duales-system-anlage-a/berufe-a-bis-z/bankkaufleute/lernfelder-und-bndelungsfcher/index.html",
    "https://www.gesetze-im-internet.de/bankkflausbv/BJNR012100020.html",
    "https://www.buzer.de/13_Bankkaufleute-ausbildung-verordnung.htm",
    "https://www.buzer.de/12_Bankkaufleute-ausbildung-verordnung.htm",
    "https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/regulation/Bankkaufmann_2020.pdf",
    "https://www.ihk.de/blueprint/servlet/resource/blob/5615114/06ae21ab5b9bc0d93780605975dd0232/bankkaufmann-vo2020-erlaeuterungen-zum-pruefungsverfahren-data.pdf",
    "https://www.ihk-nuernberg.de/fileadmin/IHK_Nuernberg/Ausbildung/Dokumente/merkblatt-bankkaufleute-ao-2020.pdf",
    "https://www.ihk.de/chemnitz/aus-und-weiterbildung/pruefungen/news-pruefungen/pruefungskatalogs-fuer-bankkaufleute-6951586",
    "https://www.ihk.de/dresden/hauptnavigation/bildung-fachkraefte/azubis-fachkraefte-finden/alles-zur-ausbildung/ausbildungsberufe-von-a-bis-z-und-zusatzqualifikationen/ausbildungsberufe-von-a-bis-z/bankkaufmann3-5980752",
    "https://www.ihk.de/nordwestfalen/bildung/pruefungen/pruefungstermine-3557538"
  ]
};
