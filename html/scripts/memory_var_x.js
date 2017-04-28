var MemoryVarHandler = function(tip) {
    this.JUIElement = null;
    this.tip = tip;
}


MemoryVarHandler.prototype.init = function(wrapper) {
    this.JUIElement = jQuery('<div/>', {
            class: 'MVHtree'
    });
    wrapper.append(this.JUIElement);
    this.addRow();
}

MemoryVarHandler.prototype.addRow = function() {

    var self = this;
    $(document).ready(function(){
        // tree data
        var data = [];
        
        element = self.JUIElement.jstree({
            plugins: ["table", "contextmenu", "types"],
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
            }
        );
        self.JUIElement.jstree("create_node", null, {text: "<p class='n_elem'> new </p>", smec: true}, "last", function (node) {
            //console.log(JSON.stringify(node));
            //console.log(JSON.stringify(self.JUIElement.jstree(true).get_node(node.id)));
            this.hide_icons();
        });
    });
}

var simpleVar = new MemoryVarHandler("Simple");
var pointerVar = new MemoryVarHandler("Pointer");

wrapper1 = jQuery('<div/>');
wrapper2 = jQuery('<div/>');

wrapper1.css('display', 'inline-block');
wrapper2.css('display', 'inline-block');

simpleVar.init(wrapper1);
pointerVar.init(wrapper2);

$("#left_content").append(wrapper1);
$("#left_content").append(wrapper2);
