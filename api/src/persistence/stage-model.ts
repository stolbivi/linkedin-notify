const dynamoose = require("dynamoose");

require("dotenv").config();

export enum StageEnum {
    Interested,
    NotInterested,
    Interviewing,
    FailedInterview,
    Hired
}

export interface Stage {
    stage: StageEnum
    email?: string
    createdAt?: string
    updatedAt?: string
}

export interface StageWithId extends Stage {
    id: string
}

const stageSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    stage: {
        type: Number,
        required: true
    }
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const StageModel = dynamoose.model(process.env.TABLE_STAGES, stageSchema);