const dynamoose = require("dynamoose");
import dotenv from "dotenv"

dotenv.config()

export interface Salary {
    id?: string
    author?: string
    leftPayDistribution?: number,
    rightPayDistribution?: number,
    progressivePay?: string
}

const salarySchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    author: {
        type: String,
        required: true,
        index: {
            name: 'author-index',
            global: true
        }
    },
    leftPayDistribution: {
        type: Number,
        required: true
    },
    rightPayDistribution: {
        type: Number,
        required: true
    },
    progressivePay: {
        type: String,
        required: true
    }
}, {
    "saveUnknown": true,
    "timestamps": true
})

export const SalaryModel = dynamoose.model(process.env.DEV_TABLE_SALARY, salarySchema)