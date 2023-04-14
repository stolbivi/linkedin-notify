const dynamoose = require("dynamoose");

require("dotenv").config();

export enum ParentStageEnum {
    AVAILABILITY,
    GEOGRAPHY,
    STATUS,
    TYPE,
    Groups
}
export enum StageEnum {
    Interested,
    NotInterested,
    Interviewing,
    FailedInterview,
    Hired,
    Not_Looking_Currently,
    Open_To_New_Offers,
    Passive_Candidate,
    Actively_Looking,
    Future_Interest,
    Relocation,
    Commute,
    Hybrid,
    Remote,
    Contacted,
    Pending_Response,
    Interview_Scheduled,
    Offer_Extended,
    Rejected,
    Part_Time,
    Full_Time,
    Permanent,
    Contract,
    Freelance
}

export interface Stage {
    stage: StageEnum
    parentStage?: number
    name?: string
    designation?:string
    profileImageUrl?:string
    author?: string
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
    author: {
        type: String,
        required: false,
        index: {
            name: "author-index",
            global: true
        }
    },
    email: {
        type: String,
        required: false
    },
    stage: {
        type: Number,
        required: true
    },
    parentStage: {
        type: Number,
        required: false
    },
    groupId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        required: true
    }
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const StageModel = dynamoose.model(process.env.TABLE_STAGES, stageSchema);