const fs = require("fs");

const database = require("./database/db");


async function migrate(){


const db =
await database.connectDB();



const auctions =
JSON.parse(
fs.readFileSync(
"./data/auctions.json",
"utf8"
)
);



const stmt =
db.prepare(`

INSERT INTO auctions
(
title,
description,
category,
price,
currency,
image
)

VALUES (?,?,?,?,?,?)

`);



for(const auction of auctions){


stmt.run([

auction.title || "",

auction.description || "",

auction.category || "",

auction.price || 0,

auction.currency || "$",

auction.image || null

]);


}



stmt.free();


database.saveDB();


console.log(
"Migration completed:",
auctions.length,
"auctions"
);


}


migrate();
