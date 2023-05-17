import { DefaultTheme } from "styled-components";
import ICategory from "../interfaces/ICategory";

const getCategoryBackgroundColor = (theme: DefaultTheme, value: ICategory) => {
  switch (value) {

    case ICategory.Interested:
      return theme.colors.interested;

    case ICategory.NotInterested:
      return theme.colors.notInterested;

    case ICategory.Interviewing:
      return theme.colors.interviewing;

    case ICategory.FailedInterview:
      return theme.colors.failedInterview;

    case ICategory.Hired:
      return theme.colors.hired;

    case ICategory.Not_Open:
      return theme.colors.passiveCandidate;

    case ICategory.Open:
      return theme.colors.openToNewOffers;

    case ICategory.Passive:
      return theme.colors.passiveCandidate;

    case ICategory.Active:
      return theme.colors.activelyLooking;

    case ICategory.Future:
      return theme.colors.futureInterest;

    case ICategory.Relocation:
      return theme.colors.relocation;

    case ICategory.Commute:
      return theme.colors.commute;

    case ICategory.Hybrid:
      return theme.colors.hybrid;

    case ICategory.Remote:
      return theme.colors.remote;

    case ICategory.Contacted:
      return theme.colors.contacted;

    case ICategory.Pending:
      return theme.colors.pendingResponse;

    case ICategory.Interview:
      return theme.colors.interviewScheduled;

    case ICategory.Offer:
      return theme.colors.offerExtended;

    case ICategory.Rejected:
      return theme.colors.rejected;

    case ICategory.Part_Time:
      return theme.colors.partTime;

    case ICategory.Full_Time:
      return theme.colors.fullTime;

    case ICategory.Permanent:
      return theme.colors.permanent;

    case ICategory.Contract:
      return theme.colors.contract;

    case ICategory.Freelance:
      return theme.colors.freelance;

    default:
      return theme.colors.futureInterest;
  }
}

export default getCategoryBackgroundColor;