import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID} from "./global";
import Port = chrome.runtime.Port;

const messages = new Messages();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// reading cookies
const DOMAIN = 'linkedin.com';
const THE_COOKIE = 'li_at';

/**
 * Returns all cookies of the store for particular domain, requires host permissions in manifest
 * @param domain
 */
const getAllCookies = async (domain: string) => {
    return chrome.cookies.getAll({domain})
}

/**
 *  Checks is any user is possibly logged in
 */
const isLogged = async (): Promise<boolean> => {
    const cookies = await getAllCookies(DOMAIN);
    const theCookie = cookies.find(c => c.name === THE_COOKIE);
    return Number(theCookie?.expirationDate) * 1000 > new Date().getTime();
}

const updateAction = async () => {
    const _l = await isLogged();
    console.log('User currently logged:', _l);
    chrome.action.setIcon({path: _l ? "/content/icon-128.png" : "/content/icon-128-logout.png"});
    return _l;
}

updateAction().then(/* nada */);

// listening to popup messages
messages.onMessage<IAppRequest>(MESSAGE_ID,
    (message: IAppRequest, port: Port) => {
        console.debug('Message:', message);
        switch (message.type) {
            case AppMessageType.isLogged:
                return updateAction().then(l => {
                    port.postMessage({response: l});
                    return message;
                });
            case AppMessageType.signIn:
                chrome.tabs.create({url: "https://www." + DOMAIN, selected: true})
                    .then(_ => (message));
            default:
                console.warn('Unsupported message type for:', message)
                return Promise.resolve(message);
        }
    });

// listening to cookies store events
chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === THE_COOKIE) {
        chrome.action.setIcon({path: !changeInfo.removed ? "/content/icon-128.png" : "/content/icon-128-logout.png"});
    }
})