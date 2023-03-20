import {Theme} from "../global";
import {MutableRefObject} from "react";

export function setTheme(theme: Theme, rootElement: MutableRefObject<HTMLElement>) {
    if (rootElement.current) {
        for (let name in theme) {
            if (Object.prototype.hasOwnProperty.call(theme, name)) {
                rootElement.current.style.setProperty(name, theme[name])
            }
        }
    }
}