import { Groups } from "../persistence/group-model";

export enum StageParentData {
    AVAILABILITY = "Availability",
    GEOGRAPHY = "Geography",
    STATUS = "Status",
    TYPE = "Type",
    TAG = "Tag"
}

export enum StageEnum {
    Interested,
    NotInterested,
    Interviewing,
    FailedInterview,
    Hired,
    Not_Looking_Currently,
    Open_To_New_Offers,
    Passive_Candidate,
    Actively_Looking,
    Future_Interest,
    Relocation,
    Commute,
    Hybrid,
    Remote,
    Contacted,
    Pending_Response,
    Interview_Scheduled,
    Offer_Extended,
    Rejected,
    Part_Time,
    Full_Time,
    Permanent,
    Contract,
    Freelance
}

export const seedGroupData = async() => {
    const count = await Groups.scan().exec();
    let id = 1;
    if (count > 0) {
        console.log("Database already seeded, skipping...");
        return;
    }

    const groups = [];
    for (const parent of Object.values(StageParentData)) {
        groups.push({ id: id.toString(), name: parent });
        id++;
    }

    await Groups.batchPut(groups);
    console.log("Database seeded successfully.");
}
