const dynamoose = require("dynamoose")

require("dotenv").config();

const stagesSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    name: {
        type: String,
        requried: true
    }
},{
    "saveUnknown": true,
    "timestamps": true
})

export const Stages = dynamoose.model(process.env.DEV_TABLE_ALL_STAGES, stagesSchema)