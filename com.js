'use strict';

var watcher;
var toShow = [];

function fetchCT(callback) {
  var eltCT = document.getElementsByClassName('share-panel-start-at-time')[0];
  if(typeof eltCT !== 'undefined') callback(eltCT);
  else {
    window.setTimeout(function() {
      var shareBtn = document.getElementsByClassName('action-panel-trigger-share')[0];
      if(typeof shareBtn !== 'undefined') {
        shareBtn.click();
        shareBtn.click();
      }
      fetchCT(callback);
    }, 250);
  }
}

function show(com, elt) {
  stopWatching();

  var comSpace = document.getElementsByClassName('coc-com')[0];

  document.getElementsByClassName('coc-profile')[0].src = com.profile;
  document.getElementsByClassName('coc-author')[0].innerHTML = com.author;
  document.getElementsByClassName('coc-text')[0].innerHTML = com.text;

  comSpace.className = 'coc-com coc-show';

  window.setTimeout(function() {
    comSpace.className = 'coc-com coc-hide';
    startWatching(elt);
  }, 5000);
}

function startWatching(elt) {
  watcher = window.setInterval(function() {
    if(typeof toShow[elt.value] !== 'undefined') show(toShow[elt.value], elt);
  }, 250);
}

function stopWatching() {
  window.clearInterval(watcher);
}

function clean() {
  window.clearInterval(watcher);
  toShow = [];
  var comSpace = document.getElementsByClassName('coc-com')[0];
  if(typeof comSpace !== 'undefined') comSpace.className = 'coc-com coc-hide';
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  clean();

  var player = document.getElementById('player-api');

  var timeP = /[\d]{1,2}:[\d]{1,2}/;
  var aP = /<\/a>|<a href=".*">/g;
  for(var com in message.coms) {
    var text = message.coms[com].snippet.topLevelComment.snippet.textDisplay;
    var author = message.coms[com].snippet.topLevelComment.snippet.authorDisplayName;
    var aProfile = message.coms[com].snippet.topLevelComment.snippet.authorProfileImageUrl;

    text = text.replace(aP, '');

    if(timeP.test(text)) {
      var sKey = timeP.exec(text)[0];

      var sKeys = sKey.split(':');
      if(sKeys[0].length === 2 && sKeys[0].charAt(0) === '0') sKeys[0] = sKeys[0].slice(0, 1);
      sKey = sKeys.join(':');

      toShow[sKey] = {};
      toShow[sKey].text = text.trim();
      toShow[sKey].author = author;
      toShow[sKey].profile = aProfile;
    }
  }

  fetchCT(function(elt) {
    var comSpace = document.createElement('div');
    comSpace.setAttribute('class', 'coc-com coc-hide');

    var infoBlock = document.createElement('div');
    infoBlock.setAttribute('class', 'coc-info');

    var profileElt = document.createElement('img');
    profileElt.setAttribute('class', 'coc-profile');

    var authorElt = document.createElement('div');
    authorElt.setAttribute('class', 'coc-author');

    var textElt = document.createElement('div');
    textElt.setAttribute('class', 'coc-text');

    infoBlock.appendChild(profileElt);
    infoBlock.appendChild(authorElt);

    comSpace.appendChild(infoBlock);
    comSpace.appendChild(textElt);

    player.appendChild(comSpace);

    startWatching(elt);
  });
});
