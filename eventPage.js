'use strict';

var videoId;

(function() {
  if(typeof gapi !== 'undefined') return;

  var head = document.getElementsByTagName('head')[0];

  var gapiS = document.createElement('script');
  gapiS.type = 'text/javascript';
  gapiS.src = "https://apis.google.com/js/client.js?onload=initGapi";

  head.appendChild(gapiS);
})();

function initGapi() {
  var key = 'AIzaSyAVuJa44Hi82zbzBaSxe_l7PA5-B64uCP0';
  gapi.client.setApiKey(key);
}

function requestComs(id) {
  function getResponse(res) {
    var mess;
    if(res.code && res.data[0].debugInfo == 'QuotaState: BLOCKED') {
      mess = 'Invalid API key provided';
    } else {
      mess = 'Success';
    }
  }
  var req = gapi.client.request({
    'path': 'https://www.googleapis.com/youtube/v3/commentThreads',
    'params': { 'part': 'snippet', 'videoId': id, 'maxResults': 100 }
  });

  return req;
}

chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.sync.get({
    isEnabled: true
  }, function(items) {
    if(items.isEnabled) {
      chrome.storage.sync.set({
        isEnabled: false
      }, function() {
        chrome.browserAction.setIcon({path: "comon_off.png"});
      });
    } else {
      chrome.storage.sync.set({
        isEnabled: true
      }, function() {
        chrome.browserAction.setIcon({path: "comon_on.png"});
      });
    }
  });
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.sync.get({
    isEnabled: true
  }, function(items) {
    if(!items.isEnabled) return;
    var parser = document.createElement('a');
    parser.href = tab.url;

    var curVideoId = (typeof parser.search !== 'undefined') ? parser.search.split('=')[1] : undefined;
    if(typeof curVideoId !== 'undefined' && changeInfo.status == 'complete' && curVideoId != videoId) {
      requestComs(curVideoId).then(function(res) {
        videoId = curVideoId;
        chrome.tabs.sendMessage(tabId, { coms: res.result.items });
      }, function(err) {
        console.log('Error when requesting coms:', err);
      });
    }
  });
});
