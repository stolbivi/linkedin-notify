const dynamoose = require("dynamoose");
require("dotenv").config();

export interface AssignedJob {
    id?: string
    jobId?: string
    author?: string
    assignedBy?: string
    name?: string
    designation?:string
    profileImg?:string
    profileId?: string
    companyName?: string
    conversationUrn?: string
    userId?: string
}
const jobAssignmentSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        jobId: {
            type: String,
        },
        author: {
            type: String,
            index: {
                name: 'author-index',
                global: true
            }
        },
        name: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        profileImg: {
            type: String,
            required: false
        },
        profileId: {
            type: String,
            required: false
        },
        companyName: {
            type: String,
            required: false
        },
        conversationUrn: {
            type: String,
            required: false
        },
        userId: {
            type: String,
            required: false
        },
        assignedBy: {
            type: String,
        }
    },
    {
        saveUnknown: true,
        timestamps: true,
    }
);
export const JobAssignmentModel = dynamoose.model(process.env.TABLE_JOB_ASSIGNMENTS, jobAssignmentSchema);