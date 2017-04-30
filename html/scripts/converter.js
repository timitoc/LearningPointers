var convertGDBToJSON = function(GDBString) {
    if (GDBString === "")
        return null;
    var jObj = {};
    if (GDBString[0] !== '{') {
        jObj.value = GDBString;
        return jObj;
    }
}
