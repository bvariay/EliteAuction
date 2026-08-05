const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");


const dbPath = path.join(
    __dirname,
    "eliteauction.db"
);


let db;


async function connectDB(){

    const SQL = await initSqlJs();


    if(fs.existsSync(dbPath)){

        const fileBuffer =
        fs.readFileSync(dbPath);

        db =
        new SQL.Database(fileBuffer);

    }

    else{

        db =
        new SQL.Database();

    }


    return db;

}



function saveDB(){

    const data =
    db.export();


    fs.writeFileSync(
        dbPath,
        Buffer.from(data)
    );

}



module.exports = {

    connectDB,

    saveDB,

    getDB:()=>db

};
