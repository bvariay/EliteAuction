const database = require("./database/db");


async function test(){

const db =
await database.connectDB();


console.log(
"SQLite connected successfully"
);


console.log(
db.exec("SELECT name FROM sqlite_master WHERE type='table'")
);


}


test();
