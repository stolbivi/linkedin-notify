import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    title: string,

    colors: {
      primary: string,
      interested: string,
      notInterested: string,
      interviewing: string,
      failedInterview: string,
      hired: string,
      notLookingCurrently: string,
      openToNewOffers: string,
      passiveCandidate: string,
      activelyLooking: string,
      futureInterest: string,
      relocation: string,
      commute: string,
      hybrid: string,
      remote: string,
      contacted: string,
      pendingResponse: string,
      interviewScheduled: string,
      offerExtended: string,
      rejected: string,
      partTime: string,
      fullTime: string,
      permanent: string,
      contract: string,
      freelance: string,
      feature: string,
      bug: string,
      deploy: string,
      infra: string,
      refactor: string,
      text_primary: string,
      text_secondary: string,
      text_tertiary: string,
      placeholder: string,
      background: string,
      components_background: string,
      border: string,
      switch: string,
      scrollbar_background: string,
      scrollbar_thumb: string,
      scrollbar_thumb_hover: string,
      text_black: string,
      text_white: string
    }
  }
}