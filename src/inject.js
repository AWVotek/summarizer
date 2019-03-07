(function() {
    // take the selected text if available
    let articles = window.getSelection().toString();
    let url = window.location.href;

    if (articles === "" && url.indexOf("spiegel.de") !== -1) {
        // just place a div at top right
        var jq = document.createElement('script');
        jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
        let p = $('.article-section').find('p')
        articles = p.text();
    }

    let result = TFIDF(articles);    
    
    $(result).css({
        "position": "fixed",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",        
        "background-color": "black",
        "z-index": 10000,        
        "cursor": "wait",
        "color": "#fff"
    }).appendTo("body");

    function removeOverlay() {
        $("#overlay").remove();
    }
    
    $(function () {
        $("body").click(function () {
            removeOverlay();
        });        
    });

})();



/*"position": "fixed",
"top": "50%",
"left": "50%",
"width": "50%",
"height": "50%",
"background-color": "rgba(0,0,0,.5)",
"z-index": 10000,
"vertical-align": "middle",
"text-align": "center",
"color": "#fff",
"cursor": "wait"*/