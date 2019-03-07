chrome.runtime.onInstalled.addListener(function() {
    // do nothing
});
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "src/jquery.js" }, function() {
        chrome.tabs.executeScript(null, { file: "src/utils.js" }, function() {
            chrome.tabs.executeScript(null, { file: "src/inject.js" });
        });
    });
	
});