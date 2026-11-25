# Bildbank – Tapwell Group

En gemensam bildbank med miljöbilder för ROOH, Haven, Bricmate och Tapwell. Samma sida visar olika urval och filter beroende på vilken sajt den bäddas in på.

- **Steg 1 (nu):** fristående sida på GitHub Pages som bäddas in på varje sajt. Sidan publiceras från det publika repot `JOTO77/bildbank` på https://joto77.github.io/bildbank/ (samma upplägg som återförsäljarkartan). `Tapwell-Group/bildbank` är det privata huvudrepot; Pages där är bara öppet för medlemmar.
- **Steg 2 (senare):** bilderna läggs i Litium och sidan byggs in i sajterna. Datan och koden här återanvänds.

Sidan har `noindex` under testfasen, så sökmotorer indexerar den inte. Ta bort raden i `site/index.html` när gruppen har godkänt bildbanken.

## Så fungerar den

- Ett **badrum** är en fotograferad miljö, med ID som `B018`.
- Varje **bild** har ett löpnummer inom badrummet, till exempel `B018-04`, och ett SEO-vänligt filnamn.
- Varje badrum har en lista med **produkter** från ROOH, Haven, Bricmate och Tapwell.
- Varje sajt visar bara badrum där dess egna produkter finns, med sina egna filter:

| Sajt | `?sajt=` | Filter |
|---|---|---|
| rooh.se | `rooh` | Serie, modell, glas, färg på beslag |
| haven.se | `haven` | Produkt, serie, färg |
| bricmate.se | `bricmate` | Kollektion, färg |
| tapwell.se | `tapwell` | Produkt, serie, finish |

Bilderna laddas bara ner i webbformat (JPG, högst 2000 px). Den som behöver en tryckfil hänvisas till att kontakta bolaget och ange bild-ID.

## Uppdatera innehållet

All data ligger i tre CSV-filer i `data/`. De är semikolonseparerade och UTF-8, och går att öppna i Excel eller redigera direkt på GitHub. När en ändring pushas till `main` bygger GitHub Actions om sidan och publicerar den.

### `data/produkter.csv` – produkter per badrum

En rad per produkt. Här bekräftar ni produkterna som är igenkända från bilderna.

| Kolumn | Används till |
|---|---|
| `badrum` | Badrum-ID, till exempel `B018`. |
| `varumarke` | `ROOH`, `Haven`, `Bricmate` eller `Tapwell`. |
| `namn` | Texten som visas under bilden. |
| `produkttyp` | Till exempel `Tvättställsblandare`, `Kommod`, `Platta`. Filter för Haven och Tapwell. |
| `serie` | Till exempel `R4`, `H2`, `Evo`. |
| `modell` | ROOH: `Duschhörna`, `Duschnisch`, `Duschvägg`. |
| `glas` | ROOH: `Klarglas`, `Räfflat`. |
| `farg` | Färg eller finish, till exempel `Brushed Nickel`, `Walnut Wood`. |
| `kollektion` | Bricmate: till exempel `J Stone Select`. |
| `sakerhet` | `säker`, `trolig` eller `osäker`. Allt utom `säker` visas med ett frågetecken. Skriv `säker` när produkten är bekräftad. |
| `kommentar` | Visas inte på sidan. |

### `data/badrum.csv` – badrummen

| Kolumn | Används till |
|---|---|
| `badrum` | ID, till exempel `B018`. |
| `namn` | Rubriken som visas. |
| `miljo` | Ton i rummet, till exempel `Beige`. |
| `visa` | `nej` döljer badrummet och alla dess bilder. |
| `kallmapp`, `granska` | Intern information. Visas inte. |

### `data/bilder.csv` – bilderna

| Kolumn | Används till |
|---|---|
| `bild` | Bild-ID, till exempel `B018-04`. |
| `badrum` | Badrummet bilden hör till. |
| `filnamn` | Filen i `site/bilder/webb/`. |
| `visa` | `nej` döljer bilden. |
| `orientering`, `bredd`, `hojd` | Webbfilens format och storlek. |
| `utvald` | `ja` visar bilden först när man sorterar på "Utvalda först". |
| `granska` | `ja` visar etiketten "Granska" på bilden. |
| `originalnamn` | Namnet på originalfilen i marknadsmappen. |

### Lägga till nya bilder

1. Spara webbversionen som JPG, högst 2000 px på längsta sidan, i `site/bilder/webb/` med ett SEO-namn, till exempel `beige-badrum-r4-duschvagg-b022-01.jpg`.
2. Spara en tumnagel (cirka 520 px) i `site/bilder/tumnagel/` med bild-ID som namn, till exempel `B022-01.jpg`.
3. Lägg till en rad i `data/bilder.csv`. Om det är ett nytt badrum, lägg också till det i `data/badrum.csv` och dess produkter i `data/produkter.csv`.

Byggskriptet varnar i Actions-loggen om en fil saknas eller om ett ID inte stämmer.

Originalen ligger i marknadsmappen `ROOH › 3 Marknad › Kommunikation › Bilder › 2 Miljöbilder`. Där finns även `Bildlista Miljöbilder.xlsx`, som kopplar varje bild-ID till originalfilen.

## Bädda in på sajterna

Lägg ett textblock på sidan i Litium och klistra in följande i redigerarens källkodsläge ("Source"). Byt `sajt=rooh` mot `haven`, `bricmate` eller `tapwell`. Växla sedan tillbaka till vanligt läge innan du sparar, annars sparas inte ändringen.

```html
<style>.content:has(> .tg-bildbank){max-width:none!important;width:100%}.tg-bildbank{height:90vh!important;min-height:760px}</style><object class="tg-bildbank" type="text/html" data="https://joto77.github.io/bildbank/?sajt=rooh" title="Bildbank" style="display:block;width:100%;height:760px;border:0"></object>
```

- Använd `<object>`, inte `<iframe>`. Litiums CKEditor lägger till `sandbox=""` på iframes, och då slutar JavaScript fungera.
- `<style>`-raden gör blocket fullbrett. Annars visas innehållet i en smal högerspalt.
- Bildbanken rullar inuti sin egen ruta. Sidhuvud och sidfot döljs automatiskt när den är inbäddad.
- Lägg till `&intro=0` i adressen om sidan redan har en egen rubrik och bild, så döljs bildbankens första block.

Fristående, utan inbäddning, visas en rad överst där man kan växla mellan sajterna. Den är till för att visa bildbanken internt.

## Bygga lokalt

```bash
node scripts/bygg.mjs     # CSV → site/bilder.json
node scripts/server.mjs   # förhandsvisning på http://localhost:5180
```

## Tekniskt

- Statisk sida (HTML, CSS, JavaScript) utan ramverk. Zip-nedladdning av flera bilder görs med JSZip i webbläsaren.
- Ingen inloggning, inga cookies, ingen spårning.
- Typsnittet New Rail är licensierat för bolagens egna domäner och ingår inte här. Sidan använder New Rail om det finns installerat och annars Arial, precis som rooh.se.

## Två repon

Precis som återförsäljarkartan finns bildbanken i två repon med samma innehåll:

| Repo | Synlighet | Används till |
|---|---|---|
| `Tapwell-Group/bildbank` | Privat | Huvudrepo. Pages-sidan där kan bara medlemmar öppna. |
| `JOTO77/bildbank` | Publikt | Publicerar den öppna sidan som bäddas in på sajterna. |

Organisationen tillåter inte publika Pages-sidor, därför behövs det publika repot. Den lokala klonen är inställd så att `git push` skickar till båda:

```bash
git remote set-url --add --push origin https://github.com/Tapwell-Group/bildbank.git
git remote set-url --add --push origin https://github.com/JOTO77/bildbank.git
```

Om ni redigerar en CSV-fil direkt på GitHub, gör det i `JOTO77/bildbank` (det är den som syns på sajterna) och hämta sedan ändringen lokalt och pusha, så att även det privata repot uppdateras.
