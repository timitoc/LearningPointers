var Global  = {
    diplayIndexCounter: 0,
    breakpointsArray: [],
    breakpointsMap: {},
    status: 'off',
    htmlDecode: function(input)
    {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
}

var simpleVar = new MemoryVarHandler("Simple");
var pointerVar = new MemoryVarHandler("Pointer");

$( document ).ready(function() {
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
    var result = convertGDBToJSON("es = {fi = 0, se = 23}");
    console.log(JSON.stringify(result));
});

//https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
Object.equals = function( x, y ) {
  if ( x === y ) return true;
  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
  if ( x.constructor !== y.constructor ) return false;
  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
    if ( ! y.hasOwnProperty( p ) ) return false;
    if ( x[ p ] === y[ p ] ) continue;
    if ( typeof( x[ p ] ) !== "object" ) return false;
    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
  }
  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
  }
  return true;
}