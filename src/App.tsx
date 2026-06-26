import { Suspense, lazy, useEffect } from 'react';
import { initSignals } from './lib/signals';
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

// Code-split the Three.js scene so page content paints before the heavy 3D
// bundle loads. The CSS background color shows until the canvas streams in.
const Background = lazy(() =>
  import('./three/Background').then((m) => ({ default: m.Background })),
);

export default function App() {
  useEffect(() => {
    initSignals();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Background />
      </Suspense>
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
