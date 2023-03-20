import {Theme} from "../global";
import {MutableRefObject} from "react";
import Cookie = chrome.cookies.Cookie;

export const COOKIE_THEME = "li_theme";
const DOMAIN = ".www.linkedin.com";

export function setTheme(theme: Theme, rootElement: MutableRefObject<HTMLElement>) {
    if (rootElement.current) {
        for (let name in theme) {
            if (Object.prototype.hasOwnProperty.call(theme, name)) {
                rootElement.current.style.setProperty(name, theme[name])
            }
        }
    }
}

export function getThemeCookie() {
    return new Promise<Cookie>((res, rej) => {
        chrome.cookies.getAll({domain: DOMAIN, name: COOKIE_THEME})
            .then(cookies => {
                if (cookies?.length > 0) {
                    res(cookies[0]);
                } else {
                    rej("No theme cookie found");
                }
            })
    })
}

export function setThemeCookie(theme: string) {
    return chrome.cookies.set({
        domain: DOMAIN,
        name: COOKIE_THEME,
        value: theme,
        url: "https://www.linkedin.com"
    })
}

export function listenToThemeCookie(handler: (cookie: Cookie) => void) {
    chrome.cookies.onChanged.addListener(async (changeInfo) => {
        let cookie = changeInfo.cookie;
        if (cookie.name === COOKIE_THEME) {
            handler(cookie);
        }
    });
}
