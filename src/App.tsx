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
      <ScrollProgress />
      <Header />
      <main className="relative z-10">
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
