wget http://www.wienerlinien.at/ogd_realtime/doku/ogd/gtfs/gtfs.zip -q -O gtfs.zip
wget http://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-linien.csv -q -O wienerlinien-ogd-linien.csv
mkdir -p gtfs
unzip gtfs.zip -d gtfs