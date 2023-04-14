import { Stages } from "../persistence/stages";

const StageLabels = {
    0: { label: "Interested" },
    1: { label: "Not interested" },
    2: { label: "Interviewing" },
    3: { label: "Failed interview" },
    4: { label: "Hired" },
    5: { label: "Not Looking Currently" },
    6: { label: "Open to New Offers" },
    7: { label: "Passive Candidate" },
    8: { label: "Actively Looking" },
    9: { label: "Future Interest" },
    10: { label: "Relocation" },
    11: { label: "Commute" },
    12: { label: "Hybrid" },
    13: { label: "Remote" },
    14: { label: "Contacted" },
    15: { label: "Pending Response" },
    16: { label: "Interview Scheduled" },
    17: { label: "Offer Extended" },
    18: { label: "Rejected" },
    19: { label: "Part-Time" },
    20: { label: "Full-Time" },
    21: { label: "Permanent" },
    22: { label: "Contract" },
    23: { label: "Freelance" }
}

const seedData = async () => {
    try {
      const stages = await Stages.scan().exec();
      if (stages.length === 0) {
        for (const [key, value] of Object.entries(StageLabels)) {
          const newStage = new Stages({
            id: key,
            name: value.label,
          });
          await newStage.save();
        }
        console.log('Seed data successful');
      } else {
        console.log('Data already exists');
      }
    } catch (error) {
      console.log('Error seeding data:', error);
    }
  };

export default seedData