// take the selected text if available
let articles = window.getSelection().toString();
let url = window.location.href;

if (articles === "" && url.indexOf("spiegel.de") !== -1) {
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
    "color": "#fff",
    "padding": "50px",
    "opacity": "0.8",
    "border-radius": "25px",
    "box-shadow": "10px 10px gray"
}).appendTo("body");

function removeOverlay() {
    $("#overlay").remove();
}

$(function () {
    $("body").click(function () {
        removeOverlay();
    });        
});