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
}

module.exports = handler;