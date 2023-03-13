const dynamoose = require("dynamoose");

require("dotenv").config();

export interface Shared {
    profile?: string
    urn: string
    createdAt?: string
    updatedAt?: string
}

const sharedSchema = new dynamoose.Schema({
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
    urn: {
        type: String,
        required: true,
        index: {
            name: "urn-index",
            global: true
        }
    },
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const SharedModel = dynamoose.model(process.env.TABLE_SHARED, sharedSchema);