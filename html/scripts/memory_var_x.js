var MemoryVarHandler = function(tip) {
    this.JUIElement = null;
    this.tip = tip;
    this.treeEquiv;
    this.hm = {};
}


MemoryVarHandler.prototype.init = function(wrapper) {
    this.JUIElement = jQuery('<div/>', {
            class: 'MVHtree'
    });
    wrapper.append(this.JUIElement);
    this.initTable();
}

MemoryVarHandler.prototype.initTable = function() {

    var self = this;
    $(document).ready(function(){
        // tree data
        var data = [];
        
        element = self.JUIElement.jstree({
            plugins: ["table", "contextmenu", "types", "unique"],
            contextmenu: {         
                "items": function($node) {
                    var tree = self.JUIElement.jstree(true);
                    return {
                        
                        "Rename": {
                            "separator_before": false,
                            "separator_after": false,
                            "label": "Rename",
                            "action": function (obj) { 
                                tree.edit($node);
                            }
                        },                         
                        "Remove": {
                            "separator_before": false,
                            "separator_after": false,
                            "label": "Remove",
                            "action": function (obj) { 
                                if ($node.text === "")
                                    return;
                                tree.delete_node($node);
                            }
                        }
                    };
                }
            },
            core: {
                check_callback: true,
                data: data
            },
            // configure tree table
            table: {
                columns: [
                    {width: 100, header: self.tip}
                ],
                resizable: true,
                draggable: false,
                contextmenu: true,
                width: 110,
                height: 300
            },
        });
        
        self.JUIElement.bind(
            "select_node.jstree", function(evt, data){
                var newText = "Some new text";
                if (data.node.original.smec === true ||
                    data.node.smec === true)
                    data.node.text = "";
                var inst = $.jstree.reference(data.node);
                inst.edit(data.node);
            }
        );
        self.JUIElement.bind(
            "rename_node.jstree", function(evt, data){
                console.log(JSON.stringify(data.node));
                if (data.node.original.smec === true || 
                    data.node.smec === true) {
                    self.JUIElement.jstree("create_node", null, {text: "<p class='n_elem'> new </p>", smec: true}, "last", function (node) {
                        //console.log(JSON.stringify(node));
                        this.hide_icons();
                    });
                }
                data.node.smec = false;
                data.node.original.smec = false;
                self.removeDisplay(data.old);
                self.addDiplay(data.text);
            }
        );
        self.JUIElement.jstree("create_node", null, {text: "<p class='n_elem'> new </p>", smec: true}, "last", function (node) {
            //console.log(JSON.stringify(node));
            //console.log(JSON.stringify(self.JUIElement.jstree(true).get_node(node.id)));
            this.hide_icons();
        });

        self.JUIElement.bind("hover_node.jstree", function (evt, data) {
            console.log(data.node.text);
            // TODO: use that text to acces pointer location from hm, and move selection to that adress
        });

    });
}

MemoryVarHandler.prototype.getEntries = function() {
    for (var key in this.hm) {
        if (hm.hasOwnProperty(key)) {
            console.log(key + " -> " + this.hm[key]);
        }
    }
    return [this.tip, this.tip];
}

MemoryVarHandler.prototype.removeDisplay = function(exprName) {
    if (exprName === "") return;
    if (this.tip === "Simple")
        exprName = "&" + exprName;
    console.log("remove var: " + exprName);
}

MemoryVarHandler.prototype.addDiplay = function(exprName) {
    if (exprName === "") return;
    if (this.tip === "Simple")
        exprName = "&" + exprName;
    console.log("add var: " + exprName);
}

MemoryVarHandler.prototype.updateVarData = function(jsonData) {
        jsonData = JSON.parse(jsonData);
        // var v = this.JUIElement.jstree(true).get_json('#', {flat:true});
        // for (var i = 0; i < v.length; i++) {
        //     //console.log("v[" + i + "]= " + v[i].text + " and \nJson value= " + jsonData["" + v[i].text]);
        //     v[i].data.value = jsonData["" + v[i].text];
        //     this.hm = jsonData
        // }
        // jstreeElement.jstree(true).settings.core.data = v;
        // jstreeElement.jstree(true).refresh();
        this.hm = jsonData;
        notifyChange();
}

function notifyChange() {
    refresh();
}

