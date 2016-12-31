'use strict';

let _port;

function getPort() {
  if (_port) return _port;
  _port = chrome.runtime.connect({name: 'contextMenus'});
  _port.onDisconnect.addListener(() => {
    console.info('Port disconnected');
    _port = null;
  });
  return _port;
}

function findAudioId(el) {
  if(!el || !el.getAttribute) {
    return;
  }
  if(el.getAttribute('data-full-id')) {
    let audioInfo = {
      id: el.getAttribute('data-full-id')
    };
    try {
      let trackData = JSON.parse(el.getAttribute('data-audio'));
      //get tags
      let regex = /(<([^>]+)>)/ig
      audioInfo.name = (trackData[3] && trackData[3].replace(regex, ''))|| 'Unknown';
      audioInfo.author = (trackData[4] && trackData[4].replace(regex, '')) || 'Unknown';
    }
    catch(e) {
      console.error('Can\'t parse audio data');
    }
    return audioInfo;
  }
  else {
    return el.parentNode && findAudioId(el.parentNode);
  }
}

document.addEventListener('mousedown', function(event) {
  //right click
  if(event.button === 2) {
    let audioInfo = findAudioId(event.target);
    getPort().postMessage(JSON.stringify(audioInfo));
  }
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let audioInfo = JSON.parse(request);
  let data = `act=reload_audio&al=1&ids=${audioInfo.id}`;
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', '/al_audio.php', true);
  xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if(xmlhttp.status == 200) {
        let match = xmlhttp.responseText.match(/(https:\\\/\\\/[^"]+)/);
        console.log(match);
        if(match && match[0]) {
          audioInfo.url = match[0].replace(/\\/g, '');
          sendResponse(audioInfo);
        }
      }
    }
  };
  xmlhttp.send(data);
  return true;
});