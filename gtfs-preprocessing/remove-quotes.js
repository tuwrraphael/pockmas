let regex = /^"(.*)"$/;

function removeQuotes(str) {
    return str.replace(regex, "$1");
}
exports.removeQuotes = removeQuotes;
