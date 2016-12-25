'use strict';

let lastTabId;

function removeContextMenus(tabId) {
  if (lastTabId === tabId) chrome.contextMenus.removeAll();
}

chrome.runtime.onConnect.addListener(function (port) {
  if (!port.sender.tab || port.name != 'contextMenus') {
    return;
  }
  let tabId = port.sender.tab.id;
  port.onDisconnect.addListener(function () {
    removeContextMenus(tabId);
  });

  port.onMessage.addListener(function (selected_audio) {
    chrome.contextMenus.removeAll(function () {
      if (selected_audio) {
        chrome.contextMenus.create({
          'title': 'Загрузить аудио файл', 'contexts': ['all'], 'onclick': function () {
            if (selected_audio) {
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, selected_audio, function(audioInfo) {
                    if (audioInfo) {
                      chrome.downloads.download({
                        url:audioInfo.url,
                        filename: `${audioInfo.author} - ${audioInfo.name}.mp3`
                      }, function (){});
                   }
                });
              });
            }
          }
        });
      }
    });
  });
});

// When a tab is removed, check if it added any context menu entries. If so, remove it
chrome.tabs.onRemoved.addListener(removeContextMenus);