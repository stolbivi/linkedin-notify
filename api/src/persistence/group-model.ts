const dynamoose = require("dynamoose")

require("dotenv").config();

const groupSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    name: {
        type: String,
        required: true
    }
},{
    "saveUnknown": true,
    "timestamps": true
})

export const Groups = dynamoose.model(process.env.TABLE_ALL_GROUPS, groupSchema)