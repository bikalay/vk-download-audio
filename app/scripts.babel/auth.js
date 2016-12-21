import {VK_APP_ID} from './properties';
export default function() {
  'use strict';
  window.open(`https://oauth.vk.com/authorize?client_id=${VK_APP_ID}&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=audio&response_type=token`);
}
