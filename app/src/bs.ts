import {MessagesV2, Tabs} from "@stolbivi/pirojok";
import {LINKEDIN_DOMAIN, VERBOSE, LOGIN_URL} from "./global";
import {LinkedInAPI} from "./services/LinkedInAPI";
import {BackendAPI} from "./services/BackendAPI";
import {
    completion,
    conversationAck,
    getBadges,
    getConversationDetails,
    getConversationProfile,
    getConversations,
    getCookies,
    getFeatures,
    getInvitations,
    getIsLogged,
    getIsUnlocked,
    getLastViewed,
    getNotesAll,
    getNotesByProfile,
    getNotifications,
    getSalary,
    getStages,
    getSubscription,
    getTheme,
    getTz,
    handleInvitation,
    handleNewsLetterInvitation,
    markNotificationRead,
    markNotificationsSeen,
    openUrl,
    postNote,
    setFeatures,
    setLastViewed,
    setStage,
    setTheme,
    showNotesAndCharts,
    switchThemeRequest,
    unlock,
    postReply,
    getProfileByUrn,
    getCompanyByUrn
} from "./actions";
import {listenToThemeCookie} from "./themes/ThemeUtils";
import {store} from "./store/Store";

const messagesV2 = new MessagesV2(VERBOSE);
const tabs = new Tabs();

const api = new LinkedInAPI();
const backEndAPI = new BackendAPI();

// adding popup
chrome.action.onClicked.addListener(() =>
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')}));

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

// Main course below! //

getCookies(LINKEDIN_DOMAIN)
    .then(cookies => api.isLogged(cookies))
    .then(logged => {
        if (logged) {
            startMonitoring();
        }
    });

messagesV2.listen(openUrl);
messagesV2.listen(getIsLogged);
messagesV2.listen(getBadges);
messagesV2.listen(getConversations);
messagesV2.listen(getIsUnlocked);
messagesV2.listen(unlock);
messagesV2.listen(getConversationDetails);
messagesV2.listen(getConversationProfile);
messagesV2.listen(conversationAck);
messagesV2.listen(getNotifications);
messagesV2.listen(markNotificationsSeen);
messagesV2.listen(markNotificationRead);
messagesV2.listen(getInvitations);
messagesV2.listen(handleInvitation);
messagesV2.listen(handleNewsLetterInvitation);
messagesV2.listen(completion);
messagesV2.listen(getSalary);
messagesV2.listen(getTz);
messagesV2.listen(getFeatures);
messagesV2.listen(setFeatures);
messagesV2.listen(getStages);
messagesV2.listen(setStage);
messagesV2.listen(showNotesAndCharts);
messagesV2.listen(getNotesAll);
messagesV2.listen(getNotesByProfile);
messagesV2.listen(postNote);
messagesV2.listen(getSubscription);
messagesV2.listen(getLastViewed);
messagesV2.listen(setLastViewed);
messagesV2.listen(getTheme);
messagesV2.listen(setTheme);
messagesV2.listen(postReply);
messagesV2.listen(getProfileByUrn);
messagesV2.listen(getCompanyByUrn);

// listening to cookies store events
listenToThemeCookie((cookie) => {
    tabs.withAllTabs().then(tabs => {
        for (let i = 0; i < tabs.length; ++i) {
            try {
                messagesV2.requestTab(tabs[i].id, switchThemeRequest({theme: cookie.value}).toAction())
                    .catch(e => console.log(e));
            } catch (e) {
                console.log(e)
            }
        }
    });
});
chrome.cookies.onChanged.addListener(async (changeInfo) => {
    if (changeInfo.cookie.name === LinkedInAPI.COOKIE_AT) {
        if (changeInfo.removed) {
            console.log("Stop monitoring");
            await chrome.alarms.clearAll();
            await chrome.storage.session.remove("proFeatures");
            await chrome.storage.local.remove("proFeatures");
            chrome.cookies.getAll({}, function(cookies) {
                for (let i = 0; i < cookies.length; i++) {
                    if (cookies[i].domain == "www.linkedin.com" || cookies[i].domain == "api.lnmanager.com" || cookies[i].domain == "www.lnmanager.com") {
                        chrome.cookies.remove({
                            url: "https://" + cookies[i].domain + cookies[i].path,
                            name: cookies[i].name
                        });
                    }
                }
            });
            await chrome.action.setIcon({path: "/content/icon-128-logout.png"});
            await chrome.action.setBadgeText({text: ""});
        } else {
            chrome.action.setIcon({path: "/content/icon-128.png"});
            fetch(LOGIN_URL).then(_resp => {
                startMonitoring();
            });
        }
    }
});

function checkBadges() {
    console.debug('Firing badges checks');
    return getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => {
            const l = api.isLogged(cookies);
            if (l) {
                console.debug('Checking badges');
                chrome.action.setIcon({path: "/content/icon-128.png"});
                //await chrome.action.setBadgeBackgroundColor({color: "#585858"});
                //await chrome.action.setBadgeText({text: "sync"});

                const token = api.getCsrfToken(cookies);
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

    function getValue(n: any) {
        const id = n.miniCompany ? n.miniCompany : n.miniProfile;
        return id.split(":").pop();
    }

    return getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => {
            const l = api.isLogged(cookies);
            if (l) {
                console.debug('Updating feeds');
                const featuresResponse = await backEndAPI.getFeatures();
                if (featuresResponse && featuresResponse?.response?.features?.length > 0) {
                    const features = featuresResponse?.response?.features;
                    // const updatedAt = new Date(featuresResponse?.response?.updatedAt);
                    // console.log(updatedAt.toLocaleDateString());
                    const token = api.getCsrfToken(cookies);
                    const response = await api.getUpdates(token, 50);
                    const updates = api.extractUpdates(response);
                    if (updates?.threads?.length > 0) {
                        updates?.threads?.forEach((t: any) => {
                            const threadAuthor = getValue(t.author);
                            const matches = features.filter((f: any) =>
                                f.authors?.findIndex((a: string) => a.indexOf(threadAuthor) >= 0) >= 0);
                            matches.forEach(async m => {
                                switch (m.type) {
                                    case "like":
                                        const likeUrn = t.urn;
                                        const likedUrn = await backEndAPI.getShared(likeUrn);
                                        if (likedUrn?.response?.length > 0) {
                                            console.log('Skipping', likeUrn);
                                        } else {
                                            console.log('Liking', likeUrn, 'created by', t.author);
                                            await api.like(token, likeUrn);
                                            await backEndAPI.postShared({urn: likeUrn});
                                        }
                                        break;
                                    case "repost":
                                        const repostUrn = t.shareUrn;
                                        const repostedUrn = await backEndAPI.getShared(repostUrn);
                                        if (repostedUrn?.response?.length > 0) {
                                            console.log('Skipping', repostUrn);
                                        } else {
                                            console.log('Reposting', repostUrn, 'created by', t.author);
                                            await api.repost(token, repostUrn);
                                            await backEndAPI.postShared({urn: repostUrn});
                                        }
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

store.subscribe(() => {
    // TODO debug only
    console.log("Store:", store.getState());
})

let contentScriptReady = false;
//@ts-ignore
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.contentScriptReady) {
        contentScriptReady = true;
        sendResponse({ success: true });
    }
    return true; // Keep the message channel open for the response
});

chrome.cookies.onChanged.addListener((changeInfo) => {
    if (
        contentScriptReady &&
        changeInfo.cookie &&
        changeInfo.cookie.name === "li_theme" &&
        changeInfo.cookie.domain.includes(".linkedin.com")
    ) {
        const theme = changeInfo.cookie.value === "dark" ? "dark" : "light";
        chrome.tabs.query({ active: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function (theme) {
                    window.postMessage({ theme: theme }, "*");
                },
                args: [theme],
            }).catch((error) => {
                console.error('Error:', error);
            });
        });
    }
});

const visitedUrls: string[] = [];
chrome.history.onVisited.addListener((historyItem) => {
    let isInitialLoad = !visitedUrls.includes(historyItem.url);
    chrome.tabs.query({ active: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function (isInitialLoad) {
                window.postMessage({ type: "modifyElements" , initialLoad: isInitialLoad }, "*");
            },
            args: [isInitialLoad],
        }).catch((error) => {
            console.error('Error:', error);
        });
    });
    visitedUrls.push(historyItem.url);
});