import ICard from "../interfaces/ICard";
import ICategory from "../interfaces/ICategory";
import IStatus from "../interfaces/IStatus";

const mockCards: ICard[] = [
  {
    id: '2fab1909-0b9f-4783-976c-4ffecb805ac5',
    category: ICategory.Freelance,
    title: 'Reset password button not working',
    description: 'The button does not contain any feedback, when you click on it, it does nothing',
    status: IStatus.TYPE,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
    hidden: false
  },
  {
    id: '5be53f27-a69c-4128-bf40-86cd572267a5',
    category: ICategory.Not_Open,
    title: 'Create clear filters button',
    description: 'The user can select the filters but they should also be able to clear them without having to reload the page',
    status: IStatus.AVAILABILITY,
    hidden: false,
    name: "Delta",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/C5603AQGs8ZdA75b8xw/profile-displayphoto-shrink_100_100/0/1562746228464?e=1686787200&v=beta&t=bkY1XicsAouKQoNaTDph0TWCrmQr6eDNwJwAJQDLzw0",
  },
  {
    id: '6ed5a4b0-1e2c-4b71-ab42-e740f02da496',
    category: ICategory.Active,
    title: 'Set up the staging environment',
    description: '',
    status: IStatus.AVAILABILITY,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
  {
    id: '55cac86b-c223-4eed-992a-e231e9232d42',
    category: ICategory.Relocation,
    title: 'Send first deploy to prod',
    description: '',
    status: IStatus.GEOGRAPHY,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
  {
    id: '74d031c0-59bb-4f4b-9910-71bb1c88c624',
    category: ICategory.Freelance,
    title: 'Create landing page',
    description: '',
    status: IStatus.GROUPS,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
  {
    id: 'a04170d8-5f03-4a97-bbd7-cbc9516d0840',
    category: ICategory.Freelance,
    title: 'Make the onDragEnd function more efficient',
    description: '',
    status: IStatus.STATUS,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
  {
    id: '29065b36-8873-4ccd-8c42-dcff14736650',
    category: ICategory.Pending,
    title: 'Send first deploy to develop environment',
    description: '',
    status: IStatus.GROUPS,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
  {
    id: '32eb3393-eddc-487a-abc3-1c199b86c4a2',
    category: ICategory.FailedInterview,
    title: 'Create light and dark theme switch',
    description: '',
    status: IStatus.GEOGRAPHY,
    hidden: false,
    name: "John",
    designation: "Software Engineer",
    profileImg: "https://media.licdn.com/dms/image/D5603AQGQ6XYsp4EwRA/profile-displayphoto-shrink_100_100/0/1676511773808?e=1686787200&v=beta&t=tBhJJfXjv6S3zqrcluLaLjT57EWd9eb3PsLr8lQMAyU",
  },
]

export default mockCards;