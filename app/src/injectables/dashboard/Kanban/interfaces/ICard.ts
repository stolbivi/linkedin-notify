import ICategory from "./ICategory";
import IStatus from "./IStatus";

interface ICard {
  id: string,
  category: ICategory,
  title: string,
  description: string,
  status: IStatus,
  hidden: boolean,
  name: string,
  designation?: string,
  profileImg?: string,
  profileId?: string,
  userId?: string,
  companyName?: string,
  conversationUrn?: string
  statuses?: []
}

export default ICard;