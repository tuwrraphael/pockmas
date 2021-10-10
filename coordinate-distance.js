function coordinateDistance(lat, lon, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2 - lat) * Math.PI / 180; // deg2rad below
    var dLon = (lon2 - lon) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
exports.coordinateDistance = coordinateDistance;
