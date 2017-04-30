var Global  = {
    diplayIndexCounter: 0
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

var result = convertGDBToJSON("e = {fi = 12, se = 23}");
console.log(JSON.stringify(result));