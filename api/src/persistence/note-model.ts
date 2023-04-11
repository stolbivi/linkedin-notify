const dynamoose = require("dynamoose");

require("dotenv").config();

export interface Note {
    profile: string
    author: string
    text?: string
    stageFrom?: any
    stageTo?: any
    createdAt?: string
    updatedAt?: string,
    stageText?: string;
}

const noteSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    profile: {
        type: String,
        required: true,
        index: {
            name: "profile-index",
            global: true
        }
    },
    author: {
        type: String,
        required: true,
        index: {
            name: "author-index",
            global: true
        }
    },
    text: {
        type: String,
        required: false
    },
    stageFrom: {
        type: String,
        required: false
    },
    stageTo: {
        type: String,
        required: false
    },
    stageText: {
        type: String
    }
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const NoteModel = dynamoose.model(process.env.DEV_TABLE_NOTES, noteSchema);