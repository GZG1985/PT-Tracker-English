# Personal Training Tracker

Eenvoudige, Nederlandstalige PWA die cliëntnamen en resterende personal-training-sessies **alleen op het eigen apparaat** bewaart via IndexedDB. Geen login, backend of externe database. Offline gebruik na de eerste succesvolle installatie. Voor iPhone en andere moderne browsers.

## Wat kan de app?
- Cliënt toevoegen met voornaam, achternaam en aantal sessies.
- Zoekfunctie op naam.
- Per klik één sessie afboeken (niet onder nul).
- Sessies toevoegen als correctie of bij nieuw pakket: kies zelf hoeveel (bijvoorbeeld 1 of 10).
- Cliënt verwijderen na bevestiging.
- Lokale back-up downloaden en later terugzetten via een JSON-bestand.
- Geschikt voor meerdere personal trainers: ieder toestel heeft eigen, van andere toestellen gescheiden opslag.

## Publiceren via GitHub Pages (zonder programmeersoftware)
1. Maak een gratis account aan op https://github.com.
2. Klik op **New repository** en geef de repository bijvoorbeeld de naam `pt-tracker`. Kies **Public** en maak de repository aan.
3. Pak dit zipbestand uit. In de uitgepakte map staan o.a. `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest` en de map `icons`.
4. Ga in de repository naar **Add file → Upload files**. Sleep **de bestanden en de hele map `icons`** vanuit de uitgepakte map naar het uploadvak. Upload niet alleen het zipbestand, en zorg dat `index.html` direct in de bovenste map van de repository staat.
5. Kies **Commit changes**.
6. Open **Settings → Pages**. Kies bij **Build and deployment**: **Deploy from a branch**. Kies `main` en `/(root)`, daarna **Save**.
7. Na publicatie staat een link onder **Settings → Pages**, doorgaans `https://GEBRUIKERSNAAM.github.io/pt-tracker/`. Gebruik jouw eigen GitHub-gebruikersnaam en de echte repositorynaam.
8. Open die link in Safari op je iPhone. Tik op **Delen → Zet op beginscherm** (of 'Add to Home Screen'). Zet **Open als webapp** aan als die optie verschijnt en tik op **Voeg toe**.
9. Open voortaan de app via **het nieuwe beginscherm-icoon**. Doe de eerste test daar, niet alleen in Safari. De lokale opslag van de geïnstalleerde app kan namelijk gescheiden zijn van Safari.
10. Geef collega's exact dezelfde publieke link; zij krijgen op hun eigen toestel een lege administratie.

## Testen vóór gebruik met echte cliënten
1. Installeer de app en open haar via het beginscherm.
2. Voeg als test `Lisa de Hond` met `10` sessies toe.
3. Boek één sessie af → `9` sessies over.
4. Tik op ‘＋ Sessies’ en vul `1` in → weer `10`.
5. Sluit de app helemaal en open opnieuw → `10` blijft bestaan.
6. Zet vliegtuigstand aan, open opnieuw → de app moet blijven werken als hij de bestanden eerder kon cachen.
7. Exporteer een back-up en controleer of het `.json`-bestand echt in Bestanden/Downloads staat.
8. Verwijder de testcliënt, herstel het bestand en controleer dat Lisa weer 10 sessies heeft.
9. Laat een collega de app op diens telefoon openen en controleer dat deze geen cliënten ziet.
10. Verwijder je testdata vóór je echte cliëntgegevens invoert.

## BELANGRIJK: privacy, opslag en verlies
- Zet NOOIT echte cliëntgegevens of back-upbestanden in je GitHub-repository. GitHub Pages is publiek toegankelijk.
- Het JSON-back-upbestand is NIET versleuteld. Bewaar het bestand privé en liefst in beveiligde opslag. Delen met collega's is onveilig.
- Op één gedeeld toestel is er geen gebruikerslogin of afscheiding tussen gebruikers. Per verschillende telefoons is de opslag gescheiden.
- Browser-/app-opslag is niet gegarandeerd eeuwigdurend. Verwijderen van de app, opslag wissen of toestelverlies kan leiden tot gegevensverlies. Maak daarom regelmatig back-ups, bijvoorbeeld wekelijks en na het wijzigen van pakketten.
- Zet schermvergrendeling aan en beperk de gegevens tot naam en sessieaantal. Namen zijn persoonsgegevens; hou rekening met de AVG.
- De app synchroniseert niet tussen apparaten. Een back-up handmatig importeren VERVANGT de huidige cliëntenlijst volledig.
- App-updates veranderen normaal niet de cliëntgegevens, zolang dezelfde publieke URL en dezelfde database worden gebruikt. Toch altijd eerst back-uppen.

## Hoe wijzig je het ontwerp of de code?
- `index.html`: schermopbouw en tekst.
- `styles.css`: kleuren, lettertypes, indeling.
- `app.js`: app-logica en IndexedDB.
- `manifest.webmanifest`: naam en app-icoontjes.
- `sw.js`: offline opslaan van appbestanden.
- `icons/`: de iconen.

Bij het publiceren van gewijzigde bestanden in GitHub verhoog je ook de `CACHE_NAME` in `sw.js`, bijvoorbeeld van `...-v1` naar `...-v2`, zodat de geïnstalleerde app nieuwe offline-bestanden ophaalt. Open de app daarna een keer online, sluit hem af en open opnieuw. Maak voor grote wijzigingen eerst een back-up.

## Lokaal testen (optioneel, met computer)
Vanuit de uitgepakte map: `python3 -m http.server 8000`. Open `http://localhost:8000/` in je browser. Offline-functionaliteit werkt niet via direct openen van `index.html` met `file://`.

## Belangrijkste technische keuzes
- Geen bibliotheken, account of externe tracker.
- DOM-elementen via `textContent` in plaats van ongefilterde HTML voor cliëntnamen.
- IndexedDB-transacties voor wijzigingen en herstel.
- Atomaire import (de volledige lijst wordt in één database-transactie vervangen).
- Service worker met versiebeheer voor offline gebruik.

## Grenzen van deze eenvoudige versie
- Geen registratie van de afzonderlijke datums van gevolgde sessies; alleen resterende sessies.
- Geen wachtwoord, synchronisatie, rapportages, facturatie of multi-user gebruik op één gedeeld toestel.
- Met ‘＋ Sessies’ kun je een willekeurig positief aantal toevoegen, bijvoorbeeld een nieuw pakket van 10.
