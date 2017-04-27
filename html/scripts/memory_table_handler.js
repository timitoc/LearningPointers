var memoryHandler = function() {
    var UIElement;
    var n, m;
    var init = function(JUIElement) {
        UIElement = JUIElement;
    }

    var resize = function(height, width) {
        n = height;
        m = width;
        invalidate();    
    }

    var invalidate = function() {
        UIElement.style.width  = '210px';
        UIElement.style.border = '1px solid black';
        UIElement.empty();
        for(var i = 0; i < n; i++){
            var tr = UIElement.insertRow();
            for(var j = 0; j < m; j++){
                var td = tr.insertCell();
                td.addClass("memory_cell");
                td.appendChild(document.createTextNode(i*n + j));
                td.style.border = '1px solid black';
                td.style.width = '30px';
            }
        }
    }

    var colorRange = function(lo, hi) {
        var filteredCells = $('memory_cell').filter(function(i){
            var num = parseInt(this.text, 10);
            return (num >= lo && num <= hi)
        });
        filteredCells.css('color', 'red');
        
    }
}
