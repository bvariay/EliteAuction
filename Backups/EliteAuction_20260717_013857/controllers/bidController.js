const database = require("../database/db");



function createBid(req,res){

    const db = database.getDB();


    const auction_id = req.body.auction_id;
    const user_id = req.body.user_id;
    const amount = Number(req.body.amount);



    if(!auction_id || !user_id || !amount){

        return res.status(400).json({
            message:"Missing data"
        });

    }



    const auctionStmt =
    db.prepare(
    "SELECT * FROM auctions WHERE id=?"
    );


    auctionStmt.bind([
        auction_id
    ]);


    if(!auctionStmt.step()){

        auctionStmt.free();

        return res.status(404).json({
            message:"Auction not found"
        });

    }


    const auction =
    auctionStmt.getAsObject();


    auctionStmt.free();



    const currentPrice =
    auction.current_price || auction.price;



    if(amount <= currentPrice){

        return res.status(400).json({
            message:"Bid must be higher than current price"
        });

    }



    const bidStmt =
    db.prepare(`

    INSERT INTO bids
    (auction_id,user_id,amount)

    VALUES (?,?,?)

    `);



    bidStmt.run([

        auction_id,
        user_id,
        amount

    ]);


    bidStmt.free();



    const updateStmt =
    db.prepare(`

    UPDATE auctions

    SET current_price=?

    WHERE id=?

    `);



    updateStmt.run([

        amount,
        auction_id

    ]);


    updateStmt.free();



    database.saveDB();



    res.json({

        message:"Bid created",

        current_price:amount

    });


}





function getBids(req,res){

    const db = database.getDB();


    const stmt =
    db.prepare(`

    SELECT

    bids.id,
    users.name,
    bids.amount,
    bids.created_at

    FROM bids

    JOIN users

    ON users.id = bids.user_id

    WHERE auction_id=?

    ORDER BY bids.id DESC

    `);



    stmt.bind([
        req.params.auction_id
    ]);


    let bids=[];


    while(stmt.step()){

        bids.push(
            stmt.getAsObject()
        );

    }


    stmt.free();


    res.json(bids);

}





module.exports = {

    createBid,

    getBids

};
