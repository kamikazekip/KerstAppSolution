document.addEventListener("deviceready", function(){
    $( "#wrapper" ).load( "html/home.html", function(){
        var kerstAppHome = new KerstAppHome();
        kerstAppHome.init();
    });
}, true);