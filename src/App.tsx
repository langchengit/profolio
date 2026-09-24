import { Header } from './components/Header';
import { ScrollProgress } from './components/ScrollProgress';
import { Hero } from './components/Hero';
import { Experience } from './components/Experience';
import { Education } from './components/Education';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Awards } from './components/Awards';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-accent focus:bg-bg focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.18em] focus:text-accent"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <Experience />
        <Education />
        <Projects />
        <Skills />
        <Awards />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
