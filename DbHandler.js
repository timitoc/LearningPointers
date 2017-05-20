var mysql = require('mysql');
function handler() {
    var con = null;
    this.init = function() {
        con = mysql.createConnection({
            host: "localhost",
            user: "lp_user",
            password: "abc",
            database: "LP"
        });

        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            
        });
    }
    // TODO: Add prepared statement
    this.getCodeFromId = function(id, callback) {
       con.query("SELECT * FROM code_share WHERE id=" + id, function(err, result){
            if (err) 
                console.log("DB err: " + JSON.stringify(err));
            else
                console.log("DB log: " + JSON.stringify(result));
            if (err || result.length == 0)
                callback(" ", false);
            callback(result[0].source_code, true);
       }); 
    }
}

module.exports = handler;