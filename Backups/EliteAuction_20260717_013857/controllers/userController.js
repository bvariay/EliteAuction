const bcrypt = require("bcryptjs");
const database = require("../database/db");

async function register(req, res) {

    const db = database.getDB();

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All fields required"
        });

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    try {

        const stmt = db.prepare(`
            INSERT INTO users
            (name,email,password)
            VALUES (?,?,?)
        `);

        stmt.run([
            name,
            email,
            hashedPassword
        ]);

        stmt.free();

        database.saveDB();

        res.json({
            message: "User created"
        });

    } catch (err) {

        res.status(400).json({
            message: "Email already exists"
        });

    }

}

async function login(req,res){

const db =
database.getDB();


const stmt =
db.prepare(
"SELECT * FROM users WHERE email=?"
);


stmt.bind([
req.body.email
]);


if(!stmt.step()){

stmt.free();

return res.status(404).json({

message:"User not found"

});

}


const user =
stmt.getAsObject();

stmt.free();


const ok =
await bcrypt.compare(

req.body.password,

user.password

);


if(!ok){

return res.status(401).json({

message:"Wrong password"

});

}


res.json({

message:"Login successful",

user:{

id:user.id,

name:user.name,

email:user.email,

role:user.role

}

});


}

module.exports = {

register,

login

};
