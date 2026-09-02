import type {
  PersonalInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillCategory,
  AwardCategory,
  ContactInfo,
} from '../types/resume';
import lineFollowingThumbnail from '../assets/front.jpg';
import taskManagerThumnail from '../assets/task-manager-report.png';

// photoUrl left blank until a real photo is provided — UI falls back to initials.
export const personal: PersonalInfo = {
  greeting: 'Hi, my name is',
  name: 'Minglang Chen',
  tagline:
    'Software Engineering Student @ UWaterloo — Refresh to get a different maze :)',
  location: 'Vancouver, BC',
  photoUrl: '',
};

export const education: EducationEntry[] = [
  {
    id: 'uwaterloo',
    school: 'University of Waterloo',
    credential: 'Bachelor of Applied Science in Software Engineering | Co-op',
    detail: 'Earned President\'s Scholorship of Distinction',
    location: 'Waterloo, ON',
    start: 'Sep 2026',
    end: 'Apr 2031',
  },
  {
    id: 'ubc',
    school: 'University of British Columbia',
    credential: 'Access Studies in Mathematics',
    detail: 'A+ in MATH 200: Multivariable Calculus',
    location: 'Waterloo, ON',
    start: 'Sep 2025',
    end: 'Dec 2025',
  },
  {
    id: 'uhill',
    school: 'University Hill Secondary School',
    credential: 'High School Diploma',
    detail: "Pre-calculus 12: 99\nCalculus 12: 100\nAP Physics 2 Honours 12: 99\nComputer Programming 12: 100",
    location: 'Vancouver, BC',
    start: 'Sep 2022',
    end: 'Jun 2026',
  },
];

export const experience: ExperienceEntry[] = [
  {
    id: 'vshacks',
    organization: 'vsHacks',
    role: 'Vice Chair',
    tags: ['Outreach', 'Web Management', 'GitHub', 'Event Operations'],
    location: 'Vancouver, BC',
    start: 'Sept 2024',
    end: 'Present',
    bullets: [
      'Organizer of vsHacks 2025 and 2026',
      'Maintain and build [vsHacks website](https://vshacks.com/)',
      '[vsHacks 2026](https://vshacks-2026.devpost.com/) | Vice Chair:',
      'Scaled the event to 400+ participants and $4K+ in sponsorship, owning outreach, web, GitHub, and operations',
      'Led sponsorship outreach, managed the Devpost registration portal, developed & maintained the event website, and served on the judging panel',
      'Developed a Discord bot to automate user registration and tag assignment',
      'Hosted a career advising workshop featuring a Machine Learning Engineer from Microsoft, managing event logistics and attendee engagement',
      '[vsHacks 2025](https://vshacks-2025.devpost.com/) | Organizer:',
      'Co-organized vsHacks 2025, a two-day online hackathon for high-schoolers, drawing 100+ participants and $3K in sponsorship from 5 companies',
      'Led sponsorship outreach, managed the Devpost registration portal, developed & maintained the event website',
      'Ran a GitHub workshop for beginner participants as part of a multi-track workshop program, served on the judging panel, and coordinated prize announcements and distribution',
    ],
  },
  {
    id: 'learning-buddies',
    organization: 'Learning Buddies Network',
    role: 'Math Mentor',
    tags: ['Mathematics', 'Tutoring', 'Communication', 'Lesson Planning'],
    location: 'Remote',
    start: 'October 2025',
    end: 'May 2026',
    bullets: [
      'Taught one-on-one math lessons to an elementary student twice weekly, preparing lesson plans and joining post-lesson mentor discussions to refine my teaching',
      'Built strong communication skills through regular contact with students, parents, coordinators, and mentors',
      'Raised my student’s performance in subtraction, division, and multi-step word problems, while introducing beyond-curriculum topics like decimals, area, fractions, and variables',
    ],
  },
  {
    id: 'physineering',
    organization: 'University Hill Secondary School — Physineering Club',
    role: 'Co-Leader',
    tags: ['Physics', 'Engineering', 'Teaching', 'Competition Prep'],
    location: 'Vancouver, BC',
    start: 'Sept 2025',
    end: 'June 2026',
    bullets: [
      'Conducted weekly meetings and delivered lectures',
      'Researched physics topics such as NFC and took apart consumer electronics, including a Google Pixel phone and a projector, to prepare hands-on lectures for club members',
      'Coordinated and led teams in competitions including FYKOS, the Kwantlen Science Challenge, and UBC Physics Olympics',
    ],
  },
  {
    id: 'math-challengers',
    organization: 'University Hill Secondary School — Math Challengers',
    role: 'Junior Mentor',
    tags: ['Mathematics', 'Mentorship', 'Competition Prep'],
    location: 'Vancouver, BC',
    start: 'Sep 2024',
    end: 'Jun 2025',
    bullets: [
      'Mentored the Grade 8 Math Challengers team while in Grade 11',
      'Hosted regular practice sessions and taught new concepts',
      'Team placed 2nd at the Math Challengers Regional competition',
    ],
  },
];

export const projects: ProjectEntry[] = [
  {
    id: 'line-following-vehicle',
    name: 'Autonomous Line-Following Vehicle',
    affiliation: 'University Hill Secondary School',
    location: 'Vancouver, BC',
    tags: ['Arduino', 'C++', 'Embedded Hardware'],
    bullets: [
      'Built an autonomous car that follows black-tape paths with IR sensors and avoids obstacles using an ultrasonic sensor',
      'Programmed the control logic on Arduino and drove the wheels’ speed and direction through a motor driver',
      'Designed and soldered the circuit, gaining hands-on hardware experience',
    ],
    githubUrl: 'https://github.com/langchengit/engineering-car-project',
    liveUrl: '',
    imageUrl: 'https://github.com/langchengit/engineering-car-project/tree/main/photos',
    thumbnail: lineFollowingThumbnail,
  },

   {
    id: 'task-manager-website',
    name: 'Task Manager Website',
    affiliation: 'University Hill Secondary School',
    location: 'Vancouver, BC',
    tags: ['HTML', 'CSS', 'JavaScript'],
    bullets: [
      `Capstone project inspired from toggl.com`,
      'A website that can keep track of your courses, tasks, and time',
      'Key features:',  
      'Dashboard: record courses and tasks; update and monitor the status of each; create folders for courses',
      'Timer: keep track of the time spent on each task',
      'Reports: based on the data from the timer, create pie chart and line graph for time spent per course and per day'
    ],
    githubUrl: 'https://github.com/langchengit/task-manager-project',
    liveUrl: 'https://taskmanager.minglanging.com/taskmanager.html',
    imageUrl: '',
    thumbnail: taskManagerThumnail,
  },
];

export const skills: SkillCategory[] = [
  {
    id: 'languages',
    label: 'Languages and Frameworks',
    items: ['Java', 'C++', 'Python', 'JavaScript', 'HTML/CSS', 'Tailwind'],
  },
  {
    id: 'tools',
    label: 'Tools & Platforms',
    items: ['Git', 'NodeJS', 'GitHub', 'VS Code', 'Vercel', 'DevPost'],
  },
  {
    id: 'strengths',
    label: 'Technical Strengths',
    items: [
      'Data Structures',
      'Algorithms',
      'Competitive Programming',
      'Mathematics',
      'Problem Solving',
    ],
  },
];

export const awards: AwardCategory[] = [
  {
    id: 'programming',
    label: 'Programming',
    items: [
      'USACO Silver Division',
      'Canadian Computing Competition — Junior Honor Roll, full marks (2023)',
      'Canadian Computing Competition — Senior Top 25% (2024)',
    ],
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    items: [
      'Euclid Contest — Top 25% (2024, 2025)',
      'AIME Participant',
      'CSMC Honor Roll (2023, 2025)',
      'Cayley Contest Honor Roll (2023)',
      'Fermat Contest Honor Roll (2024)',
      'Stanford Math Tournament — Team Top 40%',
    ],
  },
  {
    id: 'physics',
    label: 'Physics',
    items: ['UBC Physics Olympics — 2nd Place, Quizzics (2024, 2025)'],
  },
];

export const contact: ContactInfo = {
  email: 'minglang.chen@uwaterloo.ca',
  linkedin: 'https://linkedin.com/in/minglang-chen',
  github: '',
  location: 'Vancouver, BC',
};
