import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, Badges, IAppRequest, MESSAGE_ID} from "./global";
import {LinkedInAPI} from "./services/LinkedInAPI";
import Port = chrome.runtime.Port;

const messages = new Messages();
const api = new LinkedInAPI();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// global parameters
const DOMAIN = 'linkedin.com';
const CHECK_FREQUENCY = 0.5;

let lastBadge: Badges = {
    NOTIFICATIONS: 0,
    MESSAGING: 0,
    MY_NETWORK: 0
}

/**
 * Returns all cookies of the store for particular domain, requires host permissions in manifest
 * @param domain
 */
const getCookies = async (domain: string) => chrome.cookies.getAll({domain})

/**
 * Update action based on login status
 */
const updateAction = async (logged: boolean) => {
    chrome.action.setIcon({path: logged ? "/content/icon-128.png" : "/content/icon-128-logout.png"});
    if (!logged) {
        chrome.action.setBadgeText({text: ""}).then(/* nada */);
    }
    return logged;
}

// Main course below! //

// listening to popup messages
messages.onMessage<IAppRequest>(MESSAGE_ID,
    (message: IAppRequest, port: Port) => {
        console.debug('Message:', message);
        switch (message.type) {
            case AppMessageType.isLogged:
                return getCookies(DOMAIN)
                    .then(cookies => api.isLogged(cookies))
                    .then(async l => {
                        await updateAction(l);
                        port.postMessage({isLogged: l});
                        return message;
                    })
            case AppMessageType.signIn:
                return chrome.tabs.create({url: "https://" + DOMAIN, selected: true})
                    .then(_ => (message));
            case AppMessageType.test:
                return getCookies(DOMAIN)
                    .then(cookies => api.getCsrfToken(cookies))
                    .then(token => api.getTabBadges(token))
                    .then(result => console.log(JSON.stringify(result)))
                    .then(_ => (message));
            default:
                console.warn('Unsupported message type for:', message)
                return Promise.resolve(message);
        }
    });

// listening to cookies store events
chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === LinkedInAPI.THE_COOKIE) {
        updateAction(!changeInfo.removed).then(/* nada */);
    }
})

// registering periodic task checker
chrome.alarms.onAlarm.addListener(a => {
    console.debug('Firing:', a);
    return getCookies(DOMAIN)
        .then(async cookies => {
            const l = await api.isLogged(cookies);
            if (l) {
                console.debug('Checking updates');
                const token = await api.getCsrfToken(cookies);
                const response = await api.getTabBadges(token);
                const badges = api.extractBadges(response);
                console.log("Badges:", badges);
                const total = badges.MESSAGING + badges.NOTIFICATIONS + badges.MY_NETWORK;
                if (lastBadge.MESSAGING < badges.MESSAGING
                    || lastBadge.NOTIFICATIONS < badges.NOTIFICATIONS
                    || lastBadge.MY_NETWORK < badges.MY_NETWORK) {
                    // TODO notification
                }
                lastBadge = badges;
                return chrome.action.setBadgeText({text: total.toString()});
            }
        })
});

chrome.alarms.clearAll()
    .then(_ => chrome.alarms.create('alarm', {periodInMinutes: CHECK_FREQUENCY}));