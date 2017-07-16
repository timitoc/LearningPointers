var MemoryHandler = function() {
    this.UIElement=null;
    this.JUIElement=null;
    this.rowCount = 0;
    this.n = 20;
    this.m = 10;
    this.selected = {st:0, dr:-1};
    this.adresses = [];
}

MemoryHandler.prototype.init = function(UIElement) {
    this.UIElement = UIElement;
    this.JUIElement = $(this.UIElement);
    this.invalidate();
}

MemoryHandler.prototype.resize = function(height, width) {
    this.n = height;
    this.m = width;
    this.invalidate();
}

MemoryHandler.prototype.addRow = function() {
    var i = this.rowCount;
    var tr = this.UIElement.insertRow();
    for(var j = 0; j < this.m; j++){
        var td = tr.insertCell();
        $(td).addClass("memory_cell");
        td.appendChild(document.createTextNode(i*this.m + j));
        td.style.border = '1px solid black';
        td.style.width = '30px';
    }
    this.colorRange(Math.max(this.select.st, i*this.m), this.selected.dr);
    this.rowCount++;
    return tr;
}

MemoryHandler.prototype.invalidate = function() {
    this.JUIElement.empty();
    //this.UIElement.style.width  = '210px';
    this.rowCount = 0;
    this.UIElement.style.border = '1px solid black';
    this.selected = {st:0, dr:-1};
    for(var i = 0; i < this.n; i++){
        this.addRow();
    }
    var self = this;
    // this.JUIElement.endlessScroll({
    //     pagesToKeep: 10,
    //     fireOnce: false,
    //     insertBefore: ".memory_table_class div:first",
    //     insertAfter: ".memory_table_class div:last",
    //     content: function(i, p) {
    //         //alert(i + " si " + p);
    //         return self.addRow(i);
    //     },
    //     ceaseFire: function(i) {
    //       if (i >= 10) {
    //         return true;
    //       }
    //     },
    //     intervalFrequency: 5
    // });
    this.JUIElement.on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            self.JUIElement.stop(true);
            self.addRow();
            /// smooth debounce :)
            var offTop = $(this).scrollTop() - 1;
            $(this).scrollTop(offTop);
        }
    })
    this.gatherVarData();
}



function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

MemoryHandler.prototype.gatherVarData = function() {
    if (!simpleVar || !pointerVar)
        return;
    var a = simpleVar.getEntries();
    var b = pointerVar.getEntries();
    for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
    }
    this.adresses = uniq(a);
    console.log("gatherVarData adresses " + this.adresses);
}


// Not used, to be removed

// MemoryHandler.prototype.reColor = function() {
//     this.highlight(3, 7);
// }

MemoryHandler.prototype.highlight = function(lo, hi) {
    this.clearRange(this.selected.st, this.selected.dr);
    this.selected = {st: lo, dr: hi};
    this.colorRange(lo, hi);
}

MemoryHandler.prototype.colorRange = function(lo, hi) {
    // var filteredCells = $('.memory_cell').filter(function(i){
    //     console.log(JSON.stringify($(this)));
    //     var num = parseInt(this.html(), 10);
    //     return num >= lo && num <= hi;
    // });
    var cells = $('.memory_cell');
    if (lo > hi) return;
    for (var index = 0; index < cells.length; index++){
        var num = parseInt($(cells[index]).text(), 10);
        if (num >= lo && num <= hi) {
            $(cells[index]).addClass("colored_cell");
        }
    };
    //console.log(filteredCells);
    //filteredCells.css('color', 'red');
}

MemoryHandler.prototype.clearRange = function(lo, hi) {
    var cells = $('.memory_cell');
    if (lo > hi) return;
    for (var index = 0; index < cells.length; index++){
        var num = parseInt($(cells[index]).text(), 10);
        if (num >= lo && num <= hi) {
            $(cells[index]).removeClass("colored_cell");
        }
    };
}

/* Old version, to be removed

MemoryHandler.prototype.select = function(str, size) {
    console.log("looking for " + str + " with size " + size) ;
    var ind = findIndex(this.adresses, str);
    console.log("Selected index is " + ind);
    if (ind === -1) return;
    ++ind;
    this.highlight(ind, ind+size-1);
}*/

MemoryHandler.prototype.select = function(str, size) {
    console.log("looking for " + str + " with size " + size) ;
    var nr = parseInt(str, 16), ind = -1;
    if (nr == 0) 
        ind = 0;
    else {
        var orig = parseInt(this.adresses[0], 16);
        if (orig == 0)
            ind = nr - parseInt(this.adresses[1], 16);
        else
            ind = nr - orig;
        if (ind < 0) return;
        ++ind;
    }
    console.log("Selected index is " + ind);
    this.highlight(ind, ind+size-1);
}

function findIndex(array, elem) {
    for (var i = 0; i < array.length; i++)
        if (array[i] === elem)
            return i;
    return -1;
}

var memoryHandler = new MemoryHandler();

function refresh() {
    var height = parseInt($('#htext').val(), 10);
    var width = parseInt($('#wtext').val(), 10);
    memoryHandler.resize(height, width);
}

function initLeftPart() {
	$("#left_content").html("<h3>Memory status</h3>");
    var body = document.getElementById("left_content");
    function tableCreate(){
        var tbl  = document.createElement('table');
        $(tbl).addClass("memory_table_class");
        memoryHandler.init(tbl);
        body.appendChild(tbl);
    }
    var x = $("<div class='pure-form pure-form-stacked'><table cellpadding='10'><tr><td>Height:&nbsp;</td><td><input type='text' id='htext'></td></tr><tr><td>Width:</td><td><input type='text' id='wtext'></td></tr></div>");
    $(body).append(x);
	x = $("<button  onclick='refresh()' class='pure-button'> Refresh </button><br><br>");
    $(body).append(x);
    tableCreate();
}
