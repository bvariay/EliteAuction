const accountArea =
document.getElementById("accountArea");


function updateAccountUI(){

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );


    if(user){

        accountArea.innerHTML = `

        <span>
        مرحباً ${user.name}
        </span>

        <button onclick="logout()">
        خروج
        </button>

        `;

    }

}



function logout(){

    localStorage.removeItem("user");

    window.location.reload();

}



updateAccountUI();
