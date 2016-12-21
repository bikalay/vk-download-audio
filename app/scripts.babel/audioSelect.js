'use strict';

let _port;

function getPort() {
  if (_port) return _port;
  _port = chrome.runtime.connect({name: 'contextMenus'});
  _port.onDisconnect.addListener(() => {
    _port = null;
  });
  return _port;
}

function findAudioId(el) {
  if(!el || !el.getAttribute) {
    return;
  }
  if(el.getAttribute('data-audio')) {
    return el.getAttribute('data-audio');
  }
  else {
    return el.parentNode && findAudioId(el.parentNode);
  }
}

document.addEventListener('mousedown', function(event) {
  //right click
  if(event.button === 2) {
    let audio = findAudioId(event.target);
    if(audio) {
      getPort().postMessage(audio);
    }
    else {
      getPort().postMessage(null);
    }
  }
}, true);