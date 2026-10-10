# PT Tracker — update naar Engelse mobiele versie

Dit is **een update van je bestaande app**, geen nieuwe app. De database heet nog steeds `personal-training-tracker-v1` en ook de back-upbestanden zijn compatibel met versie 1.

## Eerst: een back-up maken
1. Open de **bestaande** PT Tracker via het icoon op je iPhone.
2. Tik op **Back-up opslaan** en bewaar het JSON-bestand veilig (bijvoorbeeld via de Bestanden-app).
3. Controleer of het bestand opgeslagen is. Dit is belangrijk vóór iedere app-update.

## Vervang de bestanden op GitHub
1. Download en pak deze ZIP uit.
2. Open je bestaande GitHub-repository (bijvoorbeeld `pt-tracker`). **Maak geen nieuwe repository en verander de GitHub Pages-URL niet.**
3. Vervang in de hoofdmap van de repository de bestanden `index.html`, `styles.css`, `app.js`, `manifest.webmanifest` en `sw.js` door de versies uit deze ZIP.
   - Via de GitHub-website kun je voor ieder van deze vijf bestanden het bestand openen, op het potloodje klikken, de nieuwe inhoud plakken en **Commit changes** kiezen.
   - Je kunt hiervoor op je computer elk bestand uit de ZIP openen met een teksteditor (zoals Kladblok of VS Code). Selecteer de hele inhoud en kopieer deze naar de overeenkomstige bestandseditor op GitHub.
   - De bestaande icoonbestanden en `.nojekyll` hoeven niet veranderd te worden.
   - Je kunt ook de nieuwe bestanden in een lokale gekloonde repository overschrijven en met Git pushen, als je daarmee vertrouwd bent.
4. Controleer onder **Settings → Pages** of GitHub Pages nog aan staat.
5. Open de bestaande app **online** via het beginscherm-icoon. Bij deze versie heeft `sw.js` een nieuwe cacheversie; open de app eventueel opnieuw zodat de update geactiveerd wordt.
6. Controleer de Engelse teksten en of je bestaande cliënten nog zichtbaar zijn.

**Verwijder de app niet van je beginscherm en wis de Safari-/webappgegevens niet.** Daardoor kun je juist de lokale administratie verliezen. Gebruik voor het geval van problemen je back-upbestand.

## Wat is aangepast?
- De hele interface, bevestigingen, foutmeldingen en appbeschrijving zijn Engelstalig.
- De indeling schaalt automatisch naar je telefoonbreedte; op smalle telefoons komen de sessieknoppen in een compactere indeling.
- Invoervelden hebben minimaal 16px lettergrootte om automatisch inzoomen op iPhone bij typen te voorkomen.
- Dubbelklik-/pinch-zoom op de pagina wordt zoveel mogelijk tegengehouden. iOS of toegankelijkheidsinstellingen kunnen zoomen alsnog toestaan.
- De cacheversie van de offline app is verhoogd, zonder de IndexedDB-naam of back-upstructuur te wijzigen.

## Korte test
1. Open de app via je bestaande beginscherm-icoon.
2. Zoek een bestaande cliënt en controleer het aantal sessies.
3. Boek één sessie af en zet er daarna weer één bij.
4. Sluit de app en open opnieuw: de telling moet bewaard zijn.
5. Open een invulveld: het scherm hoort niet automatisch te vergroten.
6. Controleer in vliegtuigstand of de app nog opent.

Alle gegevens blijven **lokaal op jouw telefoon**. De publieke GitHub-repository bevat alleen de code, geen cliëntinformatie. Bewaar de JSON-back-up veilig: deze is niet versleuteld.
