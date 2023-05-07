import React, {useEffect} from "react";
// @ts-ignore
import stylesheet from "./Kanban.scss";
import { useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import KanbanBoard from './Kanban/components/KanbanBoard';
import store from './Kanban/store';
import darkTheme from './Kanban/styles/themes/dark';
import lightTheme from './Kanban/styles/themes/light';
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../../global";
import {applyThemeProperties as setThemeUtil, COOKIE_THEME, useThemeSupport} from "../../themes/ThemeUtils";
import {theme as LightTheme} from "../../themes/light";
import {getTheme, SwitchThemePayload} from "../../actions";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../../themes/dark";
import Cookies from "js-cookie";

const Kanban = () => {
    const [theme, setTheme] = useState(lightTheme);
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);

    useEffect(() => {
        setTheme(Cookies.get(COOKIE_THEME) === 'light' ? lightTheme : darkTheme);
        messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                updateTheme(payload.theme);
                return Promise.resolve();
            }));
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                let theme = payload.theme === "light" ? LightTheme : DarkTheme;
                setTheme(payload.theme === 'light' ? lightTheme : darkTheme);
                setThemeUtil(theme, rootElement);
                return Promise.resolve();
            }));
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body" ref={rootElement}>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                            <div className="App">
                                <KanbanBoard/>
                            </div>
                    </ThemeProvider>
                </Provider>
            </div>
        </>
    )
}
export default Kanban;
