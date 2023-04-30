const dynamoose = require("dynamoose");
require("dotenv").config();

export interface AssignedJob {
    id?: string
    jobId?: string
    author?: string
    rcpntUserId?: string
    assignedBy?: string
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
        rcpntUserId: {
            type: String,
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
export const JobAssignmentModel = dynamoose.model(process.env.DEV_TABLE_JOB_ASSIGNMENTS, jobAssignmentSchema);