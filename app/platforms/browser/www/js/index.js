document.addEventListener("deviceready", function(){
	//alert("READY");
    $( "#wrapper" ).load( "html/home.html", function(){
        var kerstAppHome = new KerstAppHome();
        kerstAppHome.init();
    });
}, true);

window.snowMachine = new SnowMachine();
window.snowMachine.createSnow(150);
window.snowMachine.loop();

window.onresize = function() {
    window.snowMachine.width =  window.snowMachine.ctx.canvas.width  = document.body.offsetWidth,
    window.snowMachine.height = window.snowMachine.ctx.canvas.height = document.body.offsetHeight;
};