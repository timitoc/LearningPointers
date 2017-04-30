var convertGDBToJSON = function(GDBString) {
    GDBString = "" + GDBString;
    if (GDBString === "")
        return null;
    var jObj = {};
    var name = "", i = 0;
    for (i = 0; i < GDBString.length; i++) {
        if (GDBString[i] == '=')
            break;
    }
    jObj.text = GDBString.substring(0, i-1);
    jObj.data = {};
    jObj.children = [];
    if (GDBString[i+2] != '{') {
        jObj.data.value = GDBString.substring(i+2);
    }
    else {
        var j = i+3, par = 0, st = i+3;
        for (; j < GDBString.length; j++) {
            if (GDBString[j] == '{') {
                par++;
            }
            if (GDBString[j] == '}')
                par--;
            if (GDBString[j] == ',' && par == 0) {
                jObj.children.push(convertGDBToJSON(GDBString.substring(st, j)));
                st = j+2;
            }
        }
        jObj.children.push(convertGDBToJSON(GDBString.substring(st, GDBString.length-1)));
    }
    return jObj;
}
