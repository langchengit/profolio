export interface PersonalInfo {
  name: string;
  tagline: string;
  location: string;
  photoUrl: string;
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
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}
