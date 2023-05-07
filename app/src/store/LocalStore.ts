import {configureStore, createListenerMiddleware} from "@reduxjs/toolkit"
import initListeners from "./Effects";
import lastViewedReducer, {LastViewed} from "./LastViewedReducer";
import showNotesAndChartsReducer, {ShowNotesAndCharts} from "./ShowNotesAndCharts";
import salaryReducer, {Salary} from "./SalaryReducer";
import stageReducer from "./StageReducer";
import {GeoTz, StageResponse} from "../actions";
import geoTzReducer from "./GeoTzReducer";
import notesAllReducer from "./NotesAllReducer";
import {NoteExtended} from "../global";
import columnsReducer from "./columns.slice";
import cardsReducer from "./cards.slice";

export const listenerMiddleware = createListenerMiddleware();
initListeners();

export interface DataWrapper<T> {
    data: T
}

export interface Completion {
    completed?: boolean
}

export type CompleteEnabled<T> = Partial<T> & Completion;

export interface IdAwareState<State> {
    [key: string]: State
}

export interface IdAwareRequest<State> {
    id: string
    state: State
}

interface RootState {
    lastViewed: CompleteEnabled<LastViewed>
    showNotesAndCharts: IdAwareState<ShowNotesAndCharts>
    salary: IdAwareState<CompleteEnabled<Salary>>
    stage: IdAwareState<CompleteEnabled<StageResponse>>
    geoTz: CompleteEnabled<GeoTz>
    notesAll: CompleteEnabled<DataWrapper<NoteExtended[]>>
    notesSelected: IdAwareState<CompleteEnabled<DataWrapper<NoteExtended[]>>>
}

export const localStore = configureStore({
    reducer: {
        lastViewed: lastViewedReducer,
        showNotesAndCharts: showNotesAndChartsReducer,
        salary: salaryReducer,
        stage: stageReducer,
        geoTz: geoTzReducer,
        notesAll: notesAllReducer,
        columns: columnsReducer,
        cards: cardsReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

localStore.subscribe(() => {
    // TODO remove, debug only
    console.log('Local store:', localStore.getState());
})

export const selectLastViewed = (state: RootState) => state.lastViewed;
export const selectShowNotesAndCharts = (state: RootState) => state.showNotesAndCharts;
export const selectSalary = (state: RootState) => state.salary;
export const selectStage = (state: RootState) => state.stage;
export const selectGeoTz = (state: RootState) => state.geoTz;
export const selectNotesAll = (state: RootState) => state.notesAll;

export type AppState = ReturnType<typeof localStore.getState>

export type AppDispatch = typeof localStore.dispatch

export default localStore