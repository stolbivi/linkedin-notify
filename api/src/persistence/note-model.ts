const dynamoose = require("dynamoose");

require("dotenv").config();

export interface Note {
    profile: string
    author: string
    text?: string
    stageFrom?: number
    stageTo?: number
    createdAt?: string
    updatedAt?: string
}

export interface NoteWithId extends Note {
    id: string
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
        type: Number,
        required: false
    },
    stageTo: {
        type: Number,
        required: false
    },
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const NoteModel = dynamoose.model(process.env.TABLE_NOTES, noteSchema);