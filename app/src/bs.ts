import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, LINKEDIN_DOMAIN, MESSAGE_ID, SHARE_URN, VERBOSE} from "./global";
import {LinkedInAPI} from "./services/LinkedInAPI";
import {BackendAPI} from "./services/BackendAPI";
import {MapsAPI} from "./services/MapsAPI";

const messages = new Messages(MESSAGE_ID, VERBOSE);
const api = new LinkedInAPI();
const backEndAPI = new BackendAPI();
const mapsAPI = new MapsAPI();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// global parameters
const CHECK_FREQUENCY = 0.5;
const CHECK_BADGES = 'check-badges';
const AUTO_FREQUENCY = 1;
const AUTO_FEATURES = 'auto-features';

const startMonitoring = () => {
    console.debug("Starting monitoring");
    chrome.alarms.create(CHECK_BADGES, {periodInMinutes: CHECK_FREQUENCY, delayInMinutes: 0});
    chrome.alarms.create(AUTO_FEATURES, {periodInMinutes: AUTO_FREQUENCY, delayInMinutes: 0.2});
}

/**
 * Returns all cookies of the store for particular domain, requires host permissions in manifest
 * @param domain
 */
const getCookies = async (domain: string) => chrome.cookies.getAll({domain})

// Main course below! //

getCookies(LINKEDIN_DOMAIN)
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
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.isLogged(cookies))
            .then(logged => ({isLogged: logged})),
    [AppMessageType.Badges]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const badgesResponse = await api.getTabBadges(token);
                const badges = api.extractBadges(badgesResponse);
                return {badges};
            }),
    [AppMessageType.Conversations]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const meResponse = await api.getMe(token);
                const profileUrn = api.extractProfileUrn(meResponse);
                const conversationResponse = await api.getConversations(token, profileUrn);
                const conversations = api.extractConversations(conversationResponse);
                return {conversations};
            }),
    [AppMessageType.ConversationDetails]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const detailsResponse = await api.getConversationDetails(token, message.payload);
                const details = await api.extractConversationDetails(detailsResponse);
                return {details};
            }),
    [AppMessageType.ConversationAck]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                await api.markConversationRead(token, message.payload);
                await api.markAllMessageAsSeen(token, message.payload)
            }),
    [AppMessageType.Notifications]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const notificationsResponse = await api.getNotifications(token);
                const notifications = api.extractNotifications(notificationsResponse);
                return {notifications};
            }),
    [AppMessageType.MarkNotificationsSeen]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.markAllNotificationsAsSeen(token)),
    [AppMessageType.MarkNotificationRead]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.markNotificationRead(token, message.payload)),
    [AppMessageType.Invitations]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(async cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const invitationsResponse = await api.getInvitations(token);
                const invitations = api.extractInvitations(invitationsResponse);
                return {invitations};
            }),
    [AppMessageType.HandleInvitation]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.handleInvitation(token, message.payload)),
    [AppMessageType.CheckUnlocked]: () => new Promise((res) => {
        chrome.storage.local.get(["unlocked"], (result) => {
            res({unlocked: result["unlocked"] === true})
        });
    }),
    [AppMessageType.Unlock]: () =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(token => api.repost(token, SHARE_URN))
            .then(r => new Promise((res) => chrome.storage.local.set({unlocked: true}, () => res(r)))),
    [AppMessageType.Completion]: (message) =>
        backEndAPI.getCompletion(message.payload),
    [AppMessageType.SalaryPill]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const locationResponse = await api.getLocation(token, message.payload);
                const location = api.extractLocation(locationResponse);
                const experienceResponse = await api.getExperience(token, message.payload);
                const experience = api.extractExperience(experienceResponse);
                const titleResponse = await api.getTitle(token, experience.urn);
                const title = api.extractTitle(titleResponse);
                let request = {...title, ...experience, location};
                if (experience.company?.universalName) {
                    const organizationResponse = await api.getOrganization(token, experience.company?.universalName);
                    const organization = api.extractOrganization(organizationResponse);
                    request = {...request, organization}
                }
                return backEndAPI.getSalary(request);
            }),
    [AppMessageType.Tz]: (message) =>
        getCookies(LINKEDIN_DOMAIN)
            .then(cookies => api.getCsrfToken(cookies))
            .then(async token => {
                const locationResponse = await api.getLocation(token, message.payload);
                return api.extractLocation(locationResponse);
            })
            .then(async location => {
                const {city, state, country} = location;
                const address = [city, state, country].filter(a => !!a && a !== "")
                const geo = await mapsAPI.getGeocode(address.join(", "));
                const {lat, lng} = geo.results[0].geometry.location;
                return {lat, lng, city};
            })
            .then(async geo => {
                const tz = await backEndAPI.getTz(geo.lat, geo.lng);
                return {tz, geo};
            }),
    [AppMessageType.Features]: () =>
        backEndAPI.getFeatures(),
    [AppMessageType.SetFeatures]: (message) =>
        backEndAPI.setFeatures(message.payload)
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

function checkBadges() {
    console.debug('Firing badges checks');
    return getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => {
            const l = await api.isLogged(cookies);
            if (l) {
                console.debug('Checking badges');
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
}

function autoFeatures() {
    console.debug('Firing feed updates');

    function getValue(n: string) {
        return n.split(":").pop();
    }

    return getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => {
            const l = await api.isLogged(cookies);
            if (l) {
                console.debug('Updating feeds');
                const featuresResponse = await backEndAPI.getFeatures();
                if (featuresResponse && featuresResponse?.response?.features?.length > 0) {
                    const features = featuresResponse?.response?.features;
                    const token = await api.getCsrfToken(cookies);
                    const response = await api.getUpdates(token, 50);
                    const updates = api.extractUpdates(response);
                    if (updates?.threads?.length > 0) {
                        updates?.threads?.forEach((t: any) => {
                            const threadAuthor = getValue(t.author);
                            const matches = features.filter((f: any) =>
                                f.authors.findIndex((a: string) => a.indexOf(threadAuthor) >= 0) >= 0);
                            matches.forEach(async m => {
                                switch (m.type) {
                                    case "like":
                                        console.log('Liking', t.urn, 'created by', t.author);
                                        await api.like(token, t.urn);
                                        break;
                                    case "repost":
                                        console.log('Reposting', t.shareUrn, 'created by', t.author);
                                        await api.repost(token, t.shareUrn);
                                        break;
                                }
                            })
                        })
                    }
                }
            }
        })
}

chrome.alarms.onAlarm.addListener(a => {
    switch (a.name) {
        case CHECK_BADGES:
            return checkBadges();
        case AUTO_FEATURES:
            return autoFeatures();
    }
});

