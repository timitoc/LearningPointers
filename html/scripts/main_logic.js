var Global  = {
    diplayIndexCounter: 0,
    htmlDecode: function(input)
    {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
}

var simpleVar = new MemoryVarHandler("Simple");
var pointerVar = new MemoryVarHandler("Pointer");

wrapper1 = jQuery('<div/>');
wrapper2 = jQuery('<div/>');

wrapper1.css('display', 'inline-block');
wrapper2.css('display', 'inline-block');

simpleVar.init(wrapper1);
pointerVar.init(wrapper2);

initLeftPart();
$("#left_content").append(wrapper1);
$("#left_content").append(wrapper2);

watchTable();

//var result = convertGDBToJSON("e = {fi = 12, se = 23}");
var result = convertGDBToJSON("es = {fi = 0, se = 23}");
console.log(JSON.stringify(result));