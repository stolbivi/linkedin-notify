import dynamoose from "dynamoose"
import dotenv from "dotenv"

dotenv.config()

const userStagesSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    stageId: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    "saveUnknown": true,
    "timestamps": true
})

export const UserStages = dynamoose.model(process.env.DEV_TABLE_USER_STAGES, userStagesSchema)