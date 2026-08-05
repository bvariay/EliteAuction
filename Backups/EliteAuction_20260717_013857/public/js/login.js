async function login(){


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



try{


const response =
await fetch(
"/api/users/login",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email,
password

})

});


const data =
await response.json();



if(response.ok){


localStorage.setItem(
"user",
JSON.stringify(data.user)
);



alert(
"تم تسجيل الدخول بنجاح"
);



window.location.href="/";


}

else{


alert(
data.message || "فشل تسجيل الدخول"
);


}


}

catch(error){

console.log(error);

alert(
"خطأ في الاتصال"
);

}


}
