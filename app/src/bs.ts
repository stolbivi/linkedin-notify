import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, DOMAIN, IAppRequest, MESSAGE_ID, POST_ID, VERBOSE} from "./global";
import {LinkedInAPI} from "./services/LinkedInAPI";

const messages = new Messages(MESSAGE_ID, VERBOSE);
const api = new LinkedInAPI();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// global parameters
const CHECK_FREQUENCY = 0.5;

const startMonitoring = () => {
    console.debug("Starting monitoring");
    chrome.alarms.create('alarm', {periodInMinutes: CHECK_FREQUENCY, delayInMinutes: 0});
}

/**
 * Returns all cookies of the store for particular domain, requires host permissions in manifest
 * @param domain
 */
const getCookies = async (domain: string) => chrome.cookies.getAll({domain})

// Main course below! //

getCookies(DOMAIN)
    .then(cookies => api.isLogged(cookies))
    .then(logged => {
        if (logged) {
            startMonitoring();
        }
    });

messages.listen<IAppRequest, any>({
    [AppMessageType.OpenURL]: (message) =>
        chrome.tabs.create({url: message.payload.url, selected: true}),
    [AppMessageType.IsLogged]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.isLogged(cookies))
            .then(logged => ({isLogged: logged})),
    [AppMessageType.Badges]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const badgesResponse = await api.getTabBadges(token);
                const badges = api.extractBadges(badgesResponse);
                return {badges};
            }),
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
    [AppMessageType.ConversationDetails]: (message) =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const detailsResponse = await api.getConversationDetails(token, message.payload);
                const details = await api.extractConversationDetails(detailsResponse);
                return {details};
            }),
    [AppMessageType.ConversationAck]: (message) =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                await api.markConversationRead(token, message.payload);
                await api.markAllMessageAsSeen(token, message.payload)
            }),
    [AppMessageType.Notifications]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const notificationsResponse = await api.getNotifications(token);
                const notifications = api.extractNotifications(notificationsResponse);
                return {notifications};
            }),
    [AppMessageType.MarkNotificationsSeen]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.markAllNotificationsAsSeen(token)),
    [AppMessageType.MarkNotificationRead]: (message) =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.markNotificationRead(token, message.payload)),
    [AppMessageType.Invitations]: () =>
        getCookies(DOMAIN)
            .then(async cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const invitationsResponse = await api.getInvitations(token);
                const invitations = api.extractInvitations(invitationsResponse);
                return {invitations};
            }),
    [AppMessageType.HandleInvitation]: (message) =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.handleInvitation(token, message.payload)),
    [AppMessageType.CheckUnlocked]: () => new Promise((res) => {
        chrome.storage.local.get(["unlocked"], (result) => {
            res({unlocked: result["unlocked"] === true})
        });
    }),
    [AppMessageType.Unlock]: () =>
        getCookies(DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.repost(token, POST_ID))
            .then(r => new Promise((res) => chrome.storage.local.set({unlocked: true}, () => res(r))))
})

// listening to cookies store events
chrome.cookies.onChanged.addListener(async (changeInfo) => {
    if (changeInfo.cookie.name === LinkedInAPI.THE_COOKIE) {
        if (changeInfo.removed) {
            console.log("Stop monitoring");
            await chrome.alarms.clearAll();
            chrome.action.setIcon({path: "/content/icon-128-logout.png"});
            await chrome.action.setBadgeText({text: ""});
        } else {
            startMonitoring();
        }
    }
})

chrome.alarms.onAlarm.addListener(a => {
    // double check logging since logout can happen between moment alarm is cancelled and fired
    console.debug('Firing:', a);
    return getCookies(DOMAIN)
        .then(async cookies => {
            const l = await api.isLogged(cookies);
            if (l) {
                console.debug('Checking updates');
                chrome.action.setIcon({path: "/content/icon-128.png"});
                await chrome.action.setBadgeBackgroundColor({color: "#585858"});
                await chrome.action.setBadgeText({text: "sync"});

                const token = await api.getCsrfToken(cookies);
                const response = await api.getTabBadges(token);
                const badges = api.extractBadges(response);

                await chrome.action.setBadgeBackgroundColor({color: "#ce3b28"});
                const total = badges.MESSAGING + badges.NOTIFICATIONS + badges.MY_NETWORK;
                return chrome.action.setBadgeText({text: total > 0 ? total.toString() : ""});
            }
        })
});

