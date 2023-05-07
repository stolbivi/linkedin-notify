import {getLastViewedAction, setLastViewedAction} from "./LastViewedReducer";
import {PayloadAction} from "@reduxjs/toolkit";
import {
    deleteNote, deleteStage,
    getConversationProfile,
    getLastViewed, getLatestStage,
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
import {IdAwareRequest, listenerMiddleware, localStore} from "./LocalStore";
import {MessagesV2} from "@stolbivi/pirojok";
import {extractIdFromUrl, VERBOSE} from "../global";
import {getSalaryAction, GetSalaryRequest, setSalaryAction} from "./SalaryReducer";
import {getLatestStageAction, getStageAction, setStageAction, updateStageAction} from "./StageReducer";
import {getGeoTzAction, setGeoTzAction} from "./GeoTzReducer";
import {
    appendNoteAction,
    deleteNoteAction,
    getNotesAction,
    postNoteAction,
    setNotesAction,
    triggerDeleteNoteAction
} from "./NotesAllReducer";
import {StageParentData} from "../injectables/notes/StageSwitch";

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
        effect: async (action: PayloadAction<IdAwareRequest<GetSalaryRequest>>, listenerApi) => {
            listenerApi.dispatch(setSalaryAction({id: action.payload.id, state: {completed: false}}));
            let requestId = action.payload.state.id;
            if (action.payload.state.conversation) {
                // @ts-ignore
                requestId = await messages.request(getConversationProfile(action.payload.state.id));
            }
            let r = await messages.request(getSalary(requestId));
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
        predicate: (action) => action.type === getLatestStageAction.type,
        effect: async (action: PayloadAction<IdAwareRequest<GetStagesPayload>>, listenerApi) => {
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {completed: false}}));
            let r = await messages.request(getLatestStage(action.payload.state.url));
            const stage = r?.stage >= 0 ? r?.stage : -1;
            const stageText = r?.stageText ? r?.stageText : null;
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {stage, stageText, completed: true}}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === updateStageAction.type,
        effect: async (action: PayloadAction<IdAwareRequest<SetStagePayload>>, listenerApi) => {
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {completed: false}}));
            let r = await messages.request(setStage(action.payload.state));
            const stage = r?.stage?.response?.stage >= 0 ? r?.stage?.response?.stage : -1;
            const stageText = r?.stage?.response?.stageText ? r?.stage?.response?.stageText : null;
            listenerApi.dispatch(setStageAction({id: action.payload.id, state: {stage, stageText, completed: true}}));
            if (!r.error && r.note) {
                listenerApi.dispatch(appendNoteAction(r.note.response));
            }
            if(action.payload.state.existingChildStageId
                && action.payload.state.parentStage !== Object.values(StageParentData).indexOf(StageParentData.GEOGRAPHY)
                && action.payload.state.parentStage !== Object.values(StageParentData).indexOf(StageParentData.GROUPS)
                && action.payload.state.existingChildStageId  !== r.stage.response.id) {
                listenerApi.dispatch(triggerDeleteNoteAction({id: action.payload.state.existingChildStageId}));
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
        predicate: (action) => action.type === deleteNoteAction.type,
        effect: async (action: any, listenerApi) => {
            listenerApi.dispatch(setNotesAction({completed: false}));
            await messages.request(deleteNote(action.payload.id));
            await messages.request(deleteStage(action.payload.id));
            listenerApi.dispatch(triggerDeleteNoteAction(action.payload));
            localStore.dispatch(getLatestStageAction({id: action.payload.url, state: {url: action.payload.url}}));
            listenerApi.dispatch(setNotesAction({completed: true}));
        },
    });

    listenerMiddleware.startListening({
        predicate: (action) => action.type === postNoteAction.type,
        effect: async (action: PayloadAction<PostNotePayload>, listenerApi) => {
            let r = await messages.request(postNote(action.payload));
            if (!r.error && !r.note.error) {
                listenerApi.dispatch(appendNoteAction(r.note.response));
            }
        },
    });

}