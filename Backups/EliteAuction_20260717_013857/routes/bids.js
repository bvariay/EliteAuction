const express = require("express");

const router = express.Router();

const controller =
require("../controllers/bidController");


router.post(
"/",
controller.createBid
);


router.get(
"/:auction_id",
controller.getBids
);


module.exports = router;
