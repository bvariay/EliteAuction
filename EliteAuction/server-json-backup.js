const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(express.static(path.join(__dirname, "public")));


const dataFile = path.join(
    __dirname,
    "data",
    "auctions.json"
);



function readAuctions(){

    const data = fs.readFileSync(
        dataFile,
        "utf8"
    );

    return JSON.parse(data);

}



function saveAuctions(data){

    fs.writeFileSync(
        dataFile,
        JSON.stringify(data, null, 2)
    );

}

const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "uploads/");

    },

    filename: function(req, file, cb){

        cb(null, Date.now() + "-" + file.originalname);

    }

});


const upload = multer({
    storage: storage
});


// API اختبار

app.get("/api", (req,res)=>{

    res.json({

        app:"Elite Auction",
        status:"running",
        version:"1.0"

    });

});




// جلب المزادات

app.get("/api/auctions",(req,res)=>{

    const auctions = readAuctions();

    res.json(auctions);

});

// جلب مزاد واحد حسب الرقم

app.get("/api/auctions/:id",(req,res)=>{


    const auctions = readAuctions();


    const auction = auctions.find(a => 
        a.id == req.params.id
    );


    if(!auction){

        return res.status(404).json({

            message:"Auction not found"

        });

    }


    res.json(auction);


});


// إضافة مزاد جديد

app.post("/api/auctions", upload.single("image"), (req,res)=>{


    const auctions = readAuctions();


    const newAuction = {image: req.file ? "/uploads/" + req.file.filename : null,

        id: Date.now(),

        title:req.body.title,

        description:req.body.description,

        category:req.body.category,

        price:req.body.price

    };


    auctions.push(newAuction);


    saveAuctions(auctions);


    res.json(newAuction);


});





app.listen(PORT,"0.0.0.0",()=>{


    console.log("");
    console.log("==============================");
    console.log(" Elite Auction Server Started ");
    console.log(" http://127.0.0.1:3000 ");
    console.log("==============================");


});
