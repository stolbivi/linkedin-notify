import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CompleteEnabled, IdAwareRequest, IdAwareState} from "./LocalStore";

export interface Salary {
    urn?: string
    title?: string
    symbol?: string
    formattedPay?: string
    formattedPayValue?: number
    progressivePay?: string
    progressivePayValue?: number
    note?: string
    payDistribution?: string[]
    payDistributionValues?: number[]
    payPeriodAnnual?: string[]
    experienceYears?: number
}

export interface GetSalaryRequest {
    id: string
    conversation?: boolean
}

const initialState: IdAwareState<CompleteEnabled<Salary>> = {};

const slice = createSlice({
    name: "salaryState",
    initialState,
    reducers: {
        getSalaryAction: (_1, _2: PayloadAction<IdAwareRequest<GetSalaryRequest>>) => {
        },
        setSalaryAction: (state, action: PayloadAction<IdAwareRequest<CompleteEnabled<Salary>>>) => {
            if (!state[action.payload.id]) {
                state[action.payload.id] = {};
            }
            // @ts-ignore
            Object.keys(action.payload.state).forEach(key => state[action.payload.id][key] = action.payload.state[key]);
        }
    }
});

export const {getSalaryAction, setSalaryAction} = slice.actions
export default slice.reducer