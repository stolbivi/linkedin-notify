import React from "react";
import "./ThemeSwitch.scss";
import {Sun} from "../icons/Sun";
import {Moon} from "../icons/Moon";
import {MessagesV2, Tabs} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import {setFeatures as setFeaturesAction, switchTheme} from "../actions";

type Props = {
    light: boolean
    setLight: (v: boolean) => void
};

export const ThemeSwitch: React.FC<Props> = ({light, setLight}) => {

    const messages = new MessagesV2(VERBOSE);
    const tabs = new Tabs();

    const onClick = () => {
        const newValue = !light;
        setLight(newValue);
        const theme = newValue ? "light" : "dark";
        messages.request(setFeaturesAction({theme, type: "theme", action: "set"}))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                }
            });
        // TODO send to all tabs
        tabs.withCurrentTab().then(tabs => {
            console.log("Switch theme to:", theme);
            messages.requestTab(tabs[0].id,
                switchTheme({theme})).then((r) => {
                if (r.error) {
                    console.error(r.error);
                }
            });
        });
    }

    return (
        <React.Fragment>
            <div className="switch" onClick={onClick}>
                {light && <Sun/>}
                <div className="circle"/>
                {!light && <Moon/>}
            </div>
        </React.Fragment>
    );
};