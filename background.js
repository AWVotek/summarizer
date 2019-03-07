chrome.runtime.onInstalled.addListener(function() {
    // do nothing
});
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "jquery.js" }, function() {
        chrome.tabs.executeScript(null, { file: "utils.js" }, function() {
            chrome.tabs.executeScript(null, { file: "inject.js" });
        });
    });
	
});