import * as constants from './constants';
const TIMEOUT = 100;
if(/oauth.vk.com/.test(window.location.href)) {
  setInterval( ()=> {
    if(/access_token/.test(window.location.href)) {
      let access_token = window.location.href.match(/access_token=([^\&&]+)/)[1];
      if(access_token) {
        let obj = {};
        obj[constants.VK_AUTH_TOKEN] = access_token;
        console.log(access_token);
          chrome.storage.local.set(obj, ()=>{
            window.close();
          });
      }
    }
  }, TIMEOUT);
}