import React from "react";
import "./ThemeSwitch.scss";
import {Sun} from "../icons/Sun";
import {Moon} from "../icons/Moon";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import {setTheme} from "../actions";

type Props = {
    light: boolean
    setLight: (v: boolean) => void
};

export const ThemeSwitch: React.FC<Props> = ({light, setLight}) => {

    const messages = new MessagesV2(VERBOSE);

    const onClick = () => {
        const newValue = !light;
        setLight(newValue);
        const theme = newValue ? "light" : "dark";
        messages.request(setTheme(theme)).finally();
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