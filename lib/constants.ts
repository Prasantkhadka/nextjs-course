export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    title: "React Summit 2025",
    image: "/images/event1.png",
    slug: "react-summit-2025",
    location: "Amsterdam, Netherlands",
    date: "June 13-17, 2025",
    time: "9:00 AM - 6:00 PM CEST",
  },
  {
    title: "AWS re:Invent Conference",
    image: "/images/event2.png",
    slug: "aws-reinvent-2025",
    location: "Las Vegas, NV",
    date: "November 30 - December 4, 2025",
    time: "8:00 AM - 7:00 PM PST",
  },
  {
    title: "DevOps World Summit",
    image: "/images/event3.png",
    slug: "devops-world-summit-2025",
    location: "San Francisco, CA",
    date: "September 23-25, 2025",
    time: "9:00 AM - 5:00 PM PDT",
  },
  {
    title: "AI & Machine Learning Expo",
    image: "/images/event4.png",
    slug: "ai-ml-expo-2025",
    location: "London, UK",
    date: "October 15-16, 2025",
    time: "10:00 AM - 6:00 PM GMT",
  },
  {
    title: "Web3 Developer Conference",
    image: "/images/event5.png",
    slug: "web3-dev-conf-2025",
    location: "Austin, TX",
    date: "March 10-12, 2025",
    time: "9:00 AM - 6:00 PM CST",
  },
  {
    title: "Global Hackathon 2025",
    image: "/images/event6.png",
    slug: "global-hackathon-2025",
    location: "Virtual / Worldwide",
    date: "April 5-7, 2025",
    time: "24 Hours",
  },
];
