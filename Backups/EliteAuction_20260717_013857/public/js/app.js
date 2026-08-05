const auctionContainer = document.getElementById("auctionContainer");


async function loadAuctions() {

    try {

        const response = await fetch("/api/auctions");

        const auctions = await response.json();


        if (auctions.length === 0) {

            auctionContainer.innerHTML = `
                <div class="auction-card">
                    <h3>لا توجد مزادات حالياً</h3>
                    <p>
                    سيتم إضافة المزادات قريباً
                    </p>
                </div>
            `;

            return;
        }



        auctionContainer.innerHTML = "";


        auctions.forEach(auction => {


            const card = document.createElement("div");

            card.className = "auction-card";
card.onclick = () => {

window.location.href =
"auction.html?id=" + auction.id;

};

            card.innerHTML = `

${auction.image ? 
`
<img src="${auction.image}" 
style="width:100%;height:200px;object-fit:cover;border-radius:12px;">
`
:
`
<div style="height:200px;text-align:center;padding:70px;">
لا توجد صورة
</div>
`
}


<h3>
${auction.title}
</h3>


<p>
${auction.description}
</p>


<p class="price">
${auction.price} ${auction.currency || "$"}
</p>


<p>
التصنيف:
${auction.category}
</p>


<button>
زايد الآن
</button>

`;


            auctionContainer.appendChild(card);


        });


    }

    catch(error) {


        auctionContainer.innerHTML = `

        <div class="auction-card">

        <h3>
        خطأ في الاتصال بالخادم
        </h3>

        </div>

        `;


        console.log(error);

    }

}



loadAuctions();
