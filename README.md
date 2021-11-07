# Pockmas
schneller Öffi Router für Wien, work in progress

# Lizenz
Diese Software wird unter der MIT Lizenz veröffentlicht.

## Attribution
The public transport routing algorithm is inspired / an extension of the algorithm described by Delling, Daniel and Pajor, Thomas and Werneck, Renato in their publication [Round-Based Public Transit Routing](https://www.microsoft.com/en-us/research/wp-content/uploads/2012/01/raptor_alenex.pdf).

Um die Umstiegszeiten im GTFS-Format zu generieren (transfers.txt), wird
OpenRouteService (© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors) eingesetzt.

## Datenquellen
### Wiener Linien – Fahrplandaten GTFS Wien
Datenquelle: Stadt Wien – [data.wien.gv.at](https://data.wien.gv.at)

Lizenz: Creative Commons Namensnennung 4.0 International

# TODO
* Continue journey that goes over midnight
* Stop Search: Nach zweitem Wort suchen
* Range query
* allow footpath as first leg 
* S-Bahnen
* Echtzeit-Routing
* Anzeige der Route

# Optimization
* Stop Search
    * binary search for child nodes
    * track path to go back
* optimize calendar & calendar_dates
* use frequencies to save on data