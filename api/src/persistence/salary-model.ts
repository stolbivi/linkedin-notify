const dynamoose = require("dynamoose");
import dotenv from "dotenv"

dotenv.config()

export interface Salary {
    id?: string
    author?: string
    leftPayDistribution?: string,
    rightPayDistribution?: string,
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
        type: String,
        required: false
    },
    rightPayDistribution: {
        type: String,
        required: false
    },
    progressivePay: {
        type: String,
        required: false
    }
}, {
    "saveUnknown": true,
    "timestamps": true
})

export const SalaryModel = dynamoose.model(process.env.DEV_TABLE_SALARY, salarySchema)