# Pockmas
schneller Öffi Router für Wien, work in progress

[https://pockmas.kesal.at/](https://pockmas.kesal.at/)

# Lizenz
Diese Software wird unter der MIT Lizenz veröffentlicht.

## Attribution
The public transport routing algorithm is inspired / an extension of the algorithm described by Delling, Daniel and Pajor, Thomas and Werneck, Renato in their publication [Round-Based Public Transit Routing](https://www.microsoft.com/en-us/research/wp-content/uploads/2012/01/raptor_alenex.pdf).

Um die Umstiegszeiten im GTFS-Format zu generieren (transfers.txt), wird
OpenRouteService (© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors) eingesetzt.

To merge and optimize the GTFS feeds [gtfstidy](https://github.com/patrickbr/gtfstidy) from [patrickbr](https://github.com/patrickbr) is used.

## Datenquellen
### Wiener Linien – Fahrplandaten GTFS Wien
Datenquelle: Stadt Wien – [data.wien.gv.at](https://data.wien.gv.at)
### OEBB - Soll Fahrplan GTFS
Datenquelle: [data.oebb.at](https://data.oebb.at/)

Lizenz: Creative Commons Namensnennung 4.0 International

# TODO
* Fix S-Bahnen Echtzeit Routing
* Range query
* Refine Route Details
* ✅ Continue journey that goes over midnight
* Stop Search: Nach zweitem Wort suchen
* allow footpath as first leg 
* ✅ S-Bahnen
* ✅ S-Bahnen Echtzeit Routing
* ✅ Echtzeit-Routing
* ✅ Anzeige der Route
* personalisiertes Sortieren der Suchergebnisse
* Geolocation
* ✅ Calender File viel zu lang

# Optimization
* Stop Search
    * ✅binary search for child nodes
    * track path to go back
* ✅ optimize calendar & calendar_dates
* ~~maybe: use frequencies to save on data~~
* align memory to 32 bit
* binary search calendar exceptions
