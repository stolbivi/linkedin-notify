const dynamoose = require("dynamoose");

require("dotenv").config();

export enum ParentStageEnum {
    AVAILABILITY,
    STATUS,
    TYPE,
    GEOGRAPHY,
    GROUPS
}
export enum StageEnum {
    Interested,
    NotInterested,
    Interviewing,
    FailedInterview,
    Hired,
    Not_Open,
    Open,
    Passive,
    Active,
    Future,
    Relocation,
    Commute,
    Hybrid,
    Remote,
    Contacted,
    Pending,
    Interview,
    Offer,
    Rejected,
    Part_Time,
    Full_Time,
    Permanent,
    Contract,
    Freelance
}

export interface Stage {
    stage?: number
    parentStage?: number
    name?: string
    designation?:string
    profileImg?:string
    author?: string
    email?: string
    createdAt?: string
    updatedAt?: string
    stageText?: string
    profileId?: string
    companyName?: string
    conversationUrn?: string
    userId?: string
}

export interface StageWithId extends Stage {
    id?: string
}

const stageSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: false
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
        required: false
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        required: false
    },
    profileId: {
        type: String,
        required: false
    },
    stageText: {
        type: String,
        required: false
    },
    companyName: {
        type: String,
        required: false
    },
    conversationUrn: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        required: false
    }
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const StageModel = dynamoose.model(process.env.TABLE_STAGES, stageSchema);