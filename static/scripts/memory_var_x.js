var MemoryVarHandler = function(tip) {
    this.JUIElement = null;
    this.tip = tip;
    this.treeEquiv;
    this.hm = {};
    this.hmsize = {};
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
                self.removeDisplay(Global.htmlDecode(data.old));
                self.addDiplay(Global.htmlDecode(data.text));
            }
        );
        self.JUIElement.jstree("create_node", null, {text: "<p class='n_elem'> new </p>", smec: true}, "last", function (node) {
            //console.log(JSON.stringify(node));
            //console.log(JSON.stringify(self.JUIElement.jstree(true).get_node(node.id)));
            this.hide_icons();
        });

        self.JUIElement.bind("hover_node.jstree", function (evt, data) {
            //console.log(data.node.text);
            if (self.hmsize[data.node.text])
                memoryHandler.select(self.hm[data.node.text], self.hmsize[data.node.text]);
            else //if (self.hm[data.node.text] && self.hm[data.node.text] != "Invalid")
                memoryHandler.select(self.hm[data.node.text], 1);
        });

    });
}

MemoryVarHandler.prototype.getEntries = function() {
    var entries = [];
    for (var key in this.hm) {
        if (this.hm.hasOwnProperty(key)) {
            console.log(key + " -> " + this.hm[key]);
            if (this.hm[key] != "Invalid")
                entries.push(this.hm[key]);
        }
    }
    return entries;
}

MemoryVarHandler.prototype.removeDisplay = function(exprName) {
    if (exprName === "") return;
    exprName = Global.htmlDecode(exprName);
    if (this.tip === "Simple")
        exprName = "&" + exprName;
    removeExpressionFromDisplayList(exprName);
    removeExpressionFromDisplayList(sizeFormat(exprName));
}

MemoryVarHandler.prototype.addDiplay = function(exprName) {
    if (exprName === "") return;
    exprName = Global.htmlDecode(exprName);
    if (this.tip === "Simple") {
        addExpressionToDiplayList(sizeFormat(exprName)); /// added without &
        exprName = "&" + exprName;
    }
    addExpressionToDiplayList(exprName);
}

MemoryVarHandler.prototype.updateVarData = function(jsonObject) {
        var v = this.JUIElement.jstree(true).get_json('#', {flat:true});
        console.log("baa json " + JSON.stringify(jsonObject));
        for (var i = 0; i < v.length; i++) {
            if (!(v[i].parent === "#"))
                continue;
            var txt = "" + Global.htmlDecode(v[i].text);
            if (this.tip === "Simple" && jsonObject.hasOwnProperty(sizeFormat(txt))) {
                this.hmsize[txt] = parseInt(jsonObject[sizeFormat(txt)]);
            }
            else
                this.hmsize[txt] = 1;
            if (this.tip === "Simple")
                txt = "&" + v[i].text;
            console.log("vreau " + txt);
            if (jsonObject.hasOwnProperty(txt)) { 
                this.hm["" + v[i].text] = extract(jsonObject[txt]);    
            }
            
        }
        notifyChange();
}

var sizeFormat = function(expr) {
    return "sizeof (" + expr + ")";
}

var extract = function(str) {
    if (str == "Invalid")
        return str;
    var st = "";
    var gas = 0;
    for (var i = 0; i < str.length; i++) {
    if (gas === 0 && i + 1 < str.length) {
        if (str[i] === '0' && str[i+1] === 'x')
            gas = 1;
    }
    if (gas === 1 && str[i] === ' ')
        break;
    if (gas === 1)
    st += str[i];
    }
    return st;
}

function notifyChange() {
    //refresh();
}

