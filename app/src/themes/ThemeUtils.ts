import {Theme} from "../global";
import {MutableRefObject, useRef, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {getTheme, SwitchThemePayload, switchThemeRequest} from "../actions";
import {createFromRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as LightTheme} from "./light";
import {theme as DarkTheme} from "./dark";
import Cookie = chrome.cookies.Cookie;

export const COOKIE_THEME = "li_theme";
const DOMAIN = ".www.linkedin.com";

export function applyThemeProperties(theme: Theme, rootElement: MutableRefObject<HTMLElement>) {
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

export function useThemeSupport<T extends HTMLElement>(messages: MessagesV2, defaultTheme: Theme): [Theme, MutableRefObject<T>, (_: string) => void] {

    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const rootElement = useRef<T>();

    const updateTheme = (value: string) => {
        let theme = value === "light" ? LightTheme : DarkTheme;
        applyThemeProperties(theme, rootElement);
        setTheme(theme);
    }

    messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
    messages.listen(createFromRequest<SwitchThemePayload, any>(switchThemeRequest,
        (payload) => {
            updateTheme(payload.theme);
            return Promise.resolve();
        }));

    return [theme, rootElement, updateTheme];
}