var LocalsTable = function() {
    this.parent = $('.watch_table_class');
    this.body = null;
    this.JUIElement = null;
}

LocalsTable.prototype.init = function() {
    this.JUIElement = jQuery('<div/>', {
            class: 'Localstree'
    });
    this.initTable();
    this.body = jQuery('<div/>', {
        class: 'watches_body'
    });
    this.JUIElement.appendTo(this.body);
    this.body.appendTo(this.parent);
}

LocalsTable.prototype.initTable = function() {

    var self = this;
    $(document).ready(function(){
        // tree data
        var data = [convertGDBToJSON("s = {a = {fi = 12, se = 23}, b = {fi = -5, se = 23}}")];

        element = self.JUIElement.jstree({
            plugins: ["table", "contextmenu", "types"],
            core: {
                check_callback: true,
                data: data
            },
            // configure tree table
            table: {
                columns: [
                    {width: 200, header: "Expression"},
                    {width: 100, value: "value", header: "Value"}
                ],
                resizable: true,
                draggable: false,
                contextmenu: true,
                width: 300,
                height: 350
            },
        });
    });
}

LocalsTable.prototype.toggleView = function() {
    this.body.toggle();
}