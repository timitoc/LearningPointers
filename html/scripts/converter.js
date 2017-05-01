var convertGDBToJSON = function(GDBString, arrayPos) {
    GDBString = "" + GDBString;
    if (GDBString === "")
        return null;
    var jObj = {};
    var name = "", i = 0;
    var par = 0;
    console.log(GDBString);
    for (i = 0; i < GDBString.length; i++) {
        if (GDBString[i] == '{')
            par++;
        else if (GDBString[i] == '}')
            par--;
        else if (GDBString[i] == '=' && par == 0)
            break;
    }
    if (i == GDBString.length) {
        jObj.text = "[" + arrayPos + "]";
        i = -2;
    }
    else {
        jObj.text = GDBString.substring(0, i-1);
    }
    jObj.data = {};
    jObj.children = [];
    if (GDBString[i+2] != '{') {
        jObj.data.value = GDBString.substring(i+2);
    }
    else {
        par = 0;
        var j = i+3, st = i+3, ap = 0;
        for (; j < GDBString.length; j++) {
            if (GDBString[j] == '{') {
                par++;
            }
            if (GDBString[j] == '}')
                par--;
            if (GDBString[j] == ',' && par == 0) {
                jObj.children.push(convertGDBToJSON(GDBString.substring(st, j), ap));
                ap++;
                st = j+2;
            }
        }
        jObj.children.push(convertGDBToJSON(GDBString.substring(st, GDBString.length-1), ap));
    }
    return jObj;
}
