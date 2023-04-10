import dynamoose from "dynamoose"
import dotenv from "dotenv"

dotenv.config()

export interface Job {
    id?: string
    title?: string
    salary?: string
    company?: string
    hiringContact?: string
    type?: string
    geography?: string
    status?: string
    assigned?: string
}

const jobSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    hiringContact: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    geography: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    assigned: {
        type: String,
        required: true
    }
}, {
    "saveUnknown": true,
    "timestamps": true
})

export const JobModel = dynamoose.model(process.env.DEV_TABLE_JOBS, jobSchema)