import {getLastViewedAction, setLastViewedAction} from "./LastViewedReducer";
import {PayloadAction} from "@reduxjs/toolkit";
import {
    getLastViewed,
    getNotesAll,
    getSalary,
    getStages,
    GetStagesPayload,
    getTz,
    postNote,
    PostNotePayload,
    setLastViewed,
    setStage,
    SetStagePayload
} from "../actions";
import {IdAwareRequest, listenerMiddleware} from "./LocalStore";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {getSalaryAction, setSalaryAction} from "./SalaryReducer";
import {getStageAction, setStageAction, updateStageAction} from "./StageReducer";
import {getGeoTzAction, setGeoTzAction} from "./GeoTzReducer";
import {appendNoteAction, getNotesAction, postNoteAction, setNotesAction} from "./NotesAllReducer";

export default () => {
    console.log("Initializing effects");

    const messages = new MessagesV2(VERBOSE);

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getLastViewedAction.type,
        effect: async (action: PayloadAction<string>, listenerApi) => {
            listenerApi.dispatch(setLastViewedAction({completed: false}));
            let lastViewed = await messages.request(getLastViewed(action.payload));
            if (lastViewed?.error) {
                console.error(lastViewed.error);
                return;
            }
            if (lastViewed.length > 0) {
                listenerApi.dispatch(setLastViewedAction(lastViewed.pop()));
            }
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

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getStageAction.type,
        effect: async (action: PayloadAction<IdAwareRequest<GetStagesPayload>>, listenerApi) => {
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {completed: false}}));
            let r = await messages.request(getStages(action.payload.state));
            const stage = r?.response?.stage >= 0 ? r?.response?.stage : -1;
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {stage, completed: true}}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === updateStageAction.type,
        effect: async (action: PayloadAction<IdAwareRequest<SetStagePayload>>, listenerApi) => {
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {completed: false}}));
            let r = await messages.request(setStage(action.payload.state));
            const stage = r?.stage?.stage >= 0 ? r?.stage?.stage : -1;
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {stage, completed: true}}));
            if (!r.error && r.note) {
                listenerApi.dispatch(appendNoteAction(r.note));
            }
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getGeoTzAction.type,
        effect: async (action: PayloadAction<string>, listenerApi) => {
            listenerApi.dispatch(setGeoTzAction({completed: false}));
            let r = await messages.request(getTz(action.payload));
            listenerApi.dispatch(setGeoTzAction({...r, completed: true}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === getNotesAction.type,
        effect: async (_: PayloadAction, listenerApi) => {
            listenerApi.dispatch(setNotesAction({completed: false}));
            let r = await messages.request(getNotesAll());
            let data = r.error ? [] : r.response;
            listenerApi.dispatch(setNotesAction({data, completed: true}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === postNoteAction.type,
        effect: async (action: PayloadAction<PostNotePayload>, listenerApi) => {
            let r = await messages.request(postNote(action.payload));
            console.log('Added note:', r);
            if (!r.error && !r.note.error) {
                listenerApi.dispatch(appendNoteAction(r.note.response));
            }
        },
    });

}