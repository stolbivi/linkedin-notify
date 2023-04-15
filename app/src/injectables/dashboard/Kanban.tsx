import React from "react";
// @ts-ignore
import stylesheet from "./Kanban.scss";
import { useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import KanbanBoard from './Kanban/components/KanbanBoard';
import { ModalProvider } from './Kanban/hooks/useModal';
import store from './Kanban/store';
import darkTheme from './Kanban/styles/themes/dark';
import lightTheme from './Kanban/styles/themes/light';


const Kanban = () => {
    const [theme, setTheme] = useState(lightTheme);

    const toggleTheme = () => {
        setTheme(theme.title === 'light' ? darkTheme : lightTheme);
    }
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="body">
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <ModalProvider>
                            <div className="App">
                                <KanbanBoard toggleTheme={toggleTheme}/>
                            </div>
                        </ModalProvider>
                    </ThemeProvider>
                </Provider>
            </div>
        </>
    )
}
export default Kanban;
