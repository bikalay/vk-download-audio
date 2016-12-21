'use strict';

import * as constants from './constants';
import auth from './auth';
let lastTabId;
let selected_audio = null;
function removeContextMenus(tabId) {
  if (lastTabId === tabId) chrome.contextMenus.removeAll();
}

chrome.runtime.onConnect.addListener(function(port) {
  if (!port.sender.tab || port.name != 'contextMenus') {
    // Unexpected / unknown port, do not interfere with it
    return;
  }
  let tabId = port.sender.tab.id;
  port.onDisconnect.addListener(function() {
    removeContextMenus(tabId);
  });
  // Whenever a message is posted, expect that it's identical to type
  // createProperties of chrome.contextMenus.create, except for onclick.
  // "onclick" should be a string which maps to a predefined function
  port.onMessage.addListener(function(selected_audio) {
    chrome.contextMenus.removeAll(function() {
      console.log('selected_audio', selected_audio);
      if(selected_audio) {
        chrome.storage.local.get(constants.VK_AUTH_TOKEN, (result)=> {
          console.log('result', result);
          if (result && result[constants.VK_AUTH_TOKEN]) {
            selected_audio = JSON.parse(selected_audio);
            chrome.contextMenus.create({
              'title': 'download audio', 'contexts': ['all'], 'onclick': function () {
                    fetch(`https://api.vk.com/method/audio.getById?audios=${selected_audio[1]}_${selected_audio[0]}&access_token=${result[constants.VK_AUTH_TOKEN]}`)
                      .then((response) => {
                        return response.json();
                      })
                      .then((result) => {
                        let item = result && result.response && result.response[0];
                        if (item) {
                          let a = document.createElement('a');
                          a.href = item.url;
                          a.download = (selected_audio[3].trim() || 'unknown');
                          a.click();
                        }
                      });
              }
            });
          }
          else {
            chrome.contextMenus.create({
              'title': 'authorize', 'contexts': ['all'], 'onclick': function () {
                auth()
              }
            });
          }
        });
      }
    });
  });
});

// When a tab is removed, check if it added any context menu entries. If so, remove it
chrome.tabs.onRemoved.addListener(removeContextMenus);