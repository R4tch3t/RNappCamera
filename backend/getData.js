const http = require('http');
const hostname = '0.0.0.0';
const port = 3002;
const mysql = require('mysql');
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    let inJSON = '';
    let outJSON = {};
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "R4tch3t321",
        database: "fotos"
    });
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
        inJSON += chunk;
    }).on('end', () => {
        try {
            inJSON = JSON.parse(inJSON);
            con.connect(function (err) {
                if (err) {
                    console.log(`Error: ${err}`);
                } else {
                    con.query("SELECT id FROM foto ORDER BY id ASC", function (err, result, fields) {
                        if (!err) {
                            outJSON = result
                            outJSON = JSON.stringify(outJSON);
                            res.end(`${outJSON}`);
                        }
                    });
                }
            });
        } catch (e) {
            console.log(`error: ${e}`);

        }
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});