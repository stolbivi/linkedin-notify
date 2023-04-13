import {createListenerMiddleware, PayloadAction} from '@reduxjs/toolkit'
import {TabAwarePayload} from "./MasterStore";
import {createRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";

export const listenerMiddleware = createListenerMiddleware();

const messages = new MessagesV2(VERBOSE);

export const propagateRequest = createRequest<PayloadAction<TabAwarePayload<any>>, void>("propagateAction");

listenerMiddleware.startListening({
    predicate: () => true,
    effect: async (action: PayloadAction<TabAwarePayload<any>>, _) => {
        console.debug("Propagating per tab action:", action.payload.tabId, "payload:", action.payload.payload);
        messages.requestTab(action.payload.tabId, propagateRequest(action).toAction())
            .finally(/* nada */);
    },
});