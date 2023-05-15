enum IStatus {
  AVAILABILITY = 'AVAILABILITY',
  STATUS = 'STATUS',
  TYPE = 'TYPE',
  GEOGRAPHY = 'GEOGRAPHY',
  GROUPS = 'GROUPS',
  ALL='ALL'
}


export type TStatus =
  | "AVAILABILITY"
  | "STATUS"
  | "TYPE"
  | "GEOGRAPHY"
  | "GROUPS"
  | "ALL";


export default IStatus;