import {getLastViewedAction, setLastViewedAction} from "./LastViewedReducer";
import {PayloadAction} from "@reduxjs/toolkit";
import {setCompletionAction} from "./CompletionReducer";
import {getLastViewed, setLastViewed} from "../actions";
import {listenerMiddleware} from "./LocalStore";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";

export default () => {
    console.log("Initializing effects");

    const messages = new MessagesV2(VERBOSE);

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getLastViewedAction.type,
        effect: async (action: PayloadAction<string>, listenerApi) => {
            listenerApi.dispatch(setCompletionAction({key: getLastViewedAction.type, value: false}));
            let lastViewed = await messages.request(getLastViewed(action.payload));
            if (lastViewed.error) {
                console.error(lastViewed.error);
                return;
            }
            listenerApi.dispatch(setLastViewedAction(lastViewed));
            let lastViewedUpdated = await messages.request(setLastViewed(extractIdFromUrl(window.location.href)))
            if (lastViewedUpdated.error) {
                console.error(lastViewedUpdated.error);
            }
            listenerApi.dispatch(setCompletionAction({key: getLastViewedAction.type, value: true}));
        },
    });

}