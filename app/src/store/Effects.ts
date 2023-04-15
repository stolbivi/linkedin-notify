import {getLastViewedAction, setLastViewedAction} from "./LastViewedReducer";
import {PayloadAction} from "@reduxjs/toolkit";
import {getLastViewed, getSalary, setLastViewed} from "../actions";
import {IdAwareRequest, listenerMiddleware} from "./LocalStore";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {getSalaryAction, setSalaryAction} from "./SalaryReducer";

export default () => {
    console.log("Initializing effects");

    const messages = new MessagesV2(VERBOSE);

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getLastViewedAction.type,
        effect: async (action: PayloadAction<string>, listenerApi) => {
            listenerApi.dispatch(setLastViewedAction({completed: false}));
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
            listenerApi.dispatch(setLastViewedAction({completed: true}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getSalaryAction.type,
        effect: async (action: PayloadAction<IdAwareRequest<string>>, listenerApi) => {
            listenerApi.dispatch(setSalaryAction({id: action.payload.id, state: {completed: false}}));
            let r = await messages.request(getSalary(action.payload.state));
            let salary = r.error
                ? {formattedPay: "N/A", note: r.error}
                : {...r.result, title: r.title, urn: r.urn};
            listenerApi.dispatch(setSalaryAction({id: action.payload.id, state: {...salary, completed: true}}));
        },
    });

}