import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, Badges, DOMAIN, IAppRequest, MESSAGE_ID, VERBOSE} from "./global";
import {LinkedInAPI} from "./services/LinkedInAPI";

const messages = new Messages(MESSAGE_ID, VERBOSE);
const api = new LinkedInAPI();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// global parameters
const CHECK_FREQUENCY = 0.5;

let lastBadge: Badges = {
    MY_NETWORK: 0,
    MESSAGING: 0,
    NOTIFICATIONS: 0
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
messages.listen<IAppRequest, any>({
    [AppMessageType.IsLogged]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.isLogged(cookies))
            .then(async l => {
                await updateAction(l);
                return {isLogged: l};
            }),
    [AppMessageType.OpenURL]: (message) =>
        chrome.tabs.create({url: message.payload.url, selected: true}),
    [AppMessageType.Conversations]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const meResponse = await api.getMe(token);
                const profileUrn = api.extractProfileUrn(meResponse);
                const conversationResponse = await api.getConversations(token, profileUrn);
                const conversations = api.extractConversations(conversationResponse);
                return {conversations};
            }),
    [AppMessageType.Notifications]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const notificationsResponse = await api.getNotifications(token);
                const notifications = api.extractNotifications(notificationsResponse);
                return {notifications};
            }),
    [AppMessageType.Invitations]: () =>
        getCookies(DOMAIN)
            .then(async cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const invitationsResponse = await api.getInvitations(token);
                const invitations = api.extractInvitations(invitationsResponse);
                return {invitations};
            }),
    [AppMessageType.Badges]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const badgesResponse = await api.getTabBadges(token);
                const badges = api.extractBadges(badgesResponse);
                return {badges};
            }),
    [AppMessageType.HandleInvitation]: (message) =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.handleInvitation(token, message.payload))
})

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
                const total = badges.MESSAGING + badges.NOTIFICATIONS + badges.MY_NETWORK;
                if (lastBadge.MESSAGING < badges.MESSAGING
                    || lastBadge.NOTIFICATIONS < badges.NOTIFICATIONS
                    || lastBadge.MY_NETWORK < badges.MY_NETWORK) {
                    // TODO notification API seems to be broken in Manifest v3
                }
                lastBadge = badges;
                return chrome.action.setBadgeText({text: total.toString()});
            }
        })
});

chrome.alarms.clearAll()
    .then(_ => chrome.alarms.create('alarm', {periodInMinutes: CHECK_FREQUENCY}));