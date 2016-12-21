'use strict';

let lastTabId;
let selected_audio = null;
function removeContextMenus(tabId) {
  if (lastTabId === tabId) chrome.contextMenus.removeAll();
}

chrome.runtime.onConnect.addListener(function (port) {
  if (!port.sender.tab || port.name != 'contextMenus') {
    // Unexpected / unknown port, do not interfere with it
    return;
  }
  let tabId = port.sender.tab.id;
  port.onDisconnect.addListener(function () {
    removeContextMenus(tabId);
  });
  // Whenever a message is posted, expect that it's identical to type
  // createProperties of chrome.contextMenus.create, except for onclick.
  // "onclick" should be a string which maps to a predefined function
  port.onMessage.addListener(function (selected_audio) {
    chrome.contextMenus.removeAll(function () {
      console.log('selected_audio', selected_audio);
      if (selected_audio) {
        chrome.contextMenus.create({
          'title': 'Download audio', 'contexts': ['all'], 'onclick': function () {
            if (selected_audio) {
              let audioInfo = JSON.parse(selected_audio)
              let a = document.createElement('a');
              a.href = audioInfo.url;
              a.download = `${audioInfo.name}`;
              a.setAttribute('download', `${audioInfo.name}`);
              a.click();
            }
          }
        });
      }
    });
  });
});

// When a tab is removed, check if it added any context menu entries. If so, remove it
chrome.tabs.onRemoved.addListener(removeContextMenus);