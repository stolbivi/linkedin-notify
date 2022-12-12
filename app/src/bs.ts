import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, Badges, IAppRequest, MESSAGE_ID} from "./global";
import Port = chrome.runtime.Port;

const messages = new Messages();

// adding popup
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
});

// global parameters
const DOMAIN = 'linkedin.com';
const THE_COOKIE = 'li_at';
const CSRF = 'JSESSIONID';
const CHECK_FREQUENCY = 0.5;
const CODE_REGEX = /(?:<code*.*>)([\s\S]*?)(<\/code>)/g;
const JSON_REGEX = /\{.+\}/g;
let lastBadge: Badges = {
    NOTIFICATIONS: 0,
    MESSAGING: 0,
    MY_NETWORK: 0
}

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

const getLiAt = async (): Promise<string> => {
    const cookies = await getAllCookies(DOMAIN);
    const token = cookies.find(c => c.name === THE_COOKIE);
    return token?.value;
}

const getCsrfToken = async (): Promise<string> => {
    const cookies = await getAllCookies(DOMAIN);
    const token = cookies.find(c => c.name === CSRF);
    return token?.value.replace(/['"]+/g, '');
}

// Main course below! //

// @ts-ignore
const testFetch = () => {
    return getCsrfToken().then(token => {
        fetch("https://www.linkedin.com/voyager/api/voyagerMessagingGraphQL/graphql?queryId=messengerConversations.d5089df1b5a665ee527be74b9ab1859e&variables=(mailboxUrn:urn%3Ali%3Afsd_profile%3AACoAAD-41IsBDrmZmrQ9egCK7qVrpoudB-89ebA)", {
            "headers": {
                "accept": "application/graphql",
                "csrf-token": token,
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        })
            .then(response => response.json())
            .then(response => console.log(response))
    })
}

const getAllCodes = async (): Promise<Array<any>> => {
    return getLiAt().then(c =>
        fetch("https://www.linkedin.com/", {
            "headers": {
                "li_at": c,
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        })
            .then(response => response.text())
            .then(text => text
                .match(CODE_REGEX)
                .map(tag => tag.match(JSON_REGEX)).flat().filter(s => s && s.length > 0)
                .map(s => s.replace(/&quot;/g, "\""))
                .map(s => s.replace(/&#92;/g, "\\"))
                // .map(s => {
                //     console.log(s);
                //     return s
                // })
                .map(decoded => JSON.parse(decoded))
            )
    )
}

const getProfileUrn = (codes: Array<any>): string => {
    const profile = codes.find(c => c.data && c.data["$type"] === "com.linkedin.voyager.common.Me") as any;
    return profile.data["*miniProfile"].split(":").pop();
}

const getBadges = (codes: Array<any>): any => {
    return codes.filter(c => c.data && c.data["$type"] === "com.linkedin.restli.common.CollectionResponse")
        .filter(c => {
            const elements = c.data.elements as Array<any>;
            return elements?.filter(e => e["$type"] === "com.linkedin.voyager.common.communications.TabBadge").length > 0
        })
        .map(c => {
            const elements = c.data.elements as Array<any>;
            const badges = elements.map(e => ({[e.tab]: e.count}))
            return Object.assign({}, ...badges);
        })[0]
}

// listening to popup messages
messages.onMessage<IAppRequest>(MESSAGE_ID,
    (message: IAppRequest, port: Port) => {
        console.debug('Message:', message);
        switch (message.type) {
            case AppMessageType.isLogged:
                return isLogged()
                    .then(l => updateAction(l))
                    .then(l => {
                        port.postMessage({isLogged: l});
                        return message;
                    });
            case AppMessageType.signIn:
                chrome.tabs.create({url: "https://" + DOMAIN, selected: true})
                    .then(_ => (message));
            case AppMessageType.test:
                // TODO testing queries
                return getAllCodes().then(codes => {
                    const urn = getProfileUrn(codes);
                    console.log("Profile URN:", urn);
                    return message;
                })
            default:
                console.warn('Unsupported message type for:', message)
                return Promise.resolve(message);
        }
    });

// listening to cookies store events
chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === THE_COOKIE) {
        updateAction(!changeInfo.removed).then(/* nada */);
    }
})

// registering periodic task checker
chrome.alarms.onAlarm.addListener(a => {
    console.debug('Firing:', a);
    isLogged().then(l => {
        if (l) {
            console.debug('Checking updates');
            return getAllCodes().then(codes => {
                const badges = getBadges(codes);
                console.log("Badges:", badges);
                const total = badges.MESSAGING + badges.NOTIFICATIONS + badges.MY_NETWORK;
                if (lastBadge.MESSAGING < badges.MESSAGING
                    || lastBadge.NOTIFICATIONS < badges.NOTIFICATIONS
                    || lastBadge.MY_NETWORK < badges.MY_NETWORK) {
                    // TODO notification
                }
                lastBadge = badges;
                return chrome.action.setBadgeText({text: total.toString()});
            })
        }
    })
});

chrome.alarms.clearAll()
    .then(_ => chrome.alarms.create('alarm', {periodInMinutes: CHECK_FREQUENCY}));