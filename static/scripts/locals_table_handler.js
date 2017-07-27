var LocalsTable = function() {
    this.parent = $('.watch_table_class');
    this.body = null;
    this.JUIElement = null;
    this.visible = 0;
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
    this.body.toggle();
}

LocalsTable.prototype.initTable = function() {

    var self = this;
    $(document).ready(function(){
        // tree data
        var data = [];

        element = self.JUIElement.jstree({
            plugins: ["table", "types"],
            core: {
                check_callback: true,
                data: data
            },
            // configure tree table
            table: {
                columns: [
                    {width: 200, header: "Expression"},
                    {columnClass: 'watch_me_resize', value: "value", header: "Value"}
                ],
                resizable: true,
                draggable: false,
                contextmenu: true,
                width: 300,
                height: 350
            },
        });

        self.JUIElement.bind(
            "update_cell.jstree-table", function(evt, data){
                if (data.col == "value" && data.node.parent == "#") {
                    console.log("set " + data.node.text + " to " + data.value);
                    setVariable(data.node.text, data.value);
                }
            }
        );
    });
}

LocalsTable.prototype.toggleView = function() {
    this.body.toggle();
    this.visible ^= 1;
    if (this.visible == 1) {
        this.fetchLocalsFromGdb();
    }
}

LocalsTable.prototype.fetchLocalsFromGdb = function() {
    if (Global.status == "debugging")
        socket.emit('locals');
}

/// populates table with data received from gdb
LocalsTable.prototype.consume = function(data) {
    console.log("consume " + JSON.stringify(data));
    var newData = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            console.log(key + " -> " + data[key]);
            var nou = convertGDBToJSON(key + " = " + Global.htmlDecode(data[key]));
            newData.push(nou);
        }
    }
    this.JUIElement.jstree(true).settings.core.data = newData;
    this.JUIElement.jstree(true).refresh();
    this.doMagic();
}

LocalsTable.prototype.doMagic = function() {
    this.JUIElement.trigger("resize_column.jstree-table");
}