export interface PersonalInfo {
  /** Line typed out above the name in the hero. */
  greeting: string;
  name: string;
  tagline: string;
  location: string;
  photoUrl: string;
  /** Shown in the notification bar above the hero's location badge. */
  availability: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  credential: string;
  detail?: string;
  location: string;
  start: string;
  end: string;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  tags: string[];
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  affiliation?: string;
  location?: string;
  tags: string[];
  bullets: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  thumbnail?: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  items: string[];
}

export interface AwardCategory {
  id: string;
  label: string;
  items: string[];
}

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  location: string;
}
