const dynamoose = require("dynamoose");

require("dotenv").config();

export interface LastViewed {
    profile: string
    author: string
    createdAt?: string
    updatedAt?: string
}

export interface LastViewedId extends LastViewed {
    id: string
}

const lastViewedSchema = new dynamoose.Schema({
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
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const LastViewedModel = dynamoose.model(process.env.TABLE_LAST_VIEWED, lastViewedSchema);