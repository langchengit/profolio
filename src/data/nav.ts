export interface NavItem {
  id: string;
  label: string;
}

// Order matches the on-page section order; `id` matches each <section id>.
export const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'awards', label: 'Awards' },
  { id: 'contact', label: 'Contact' },
];
