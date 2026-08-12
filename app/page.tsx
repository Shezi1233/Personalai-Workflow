import HeroFuturistic from "@/components/ui/hero-futuristic";
import { RobotVideoSection } from "@/components/RobotVideoSection";
import {
  Nav,
  About,
  MarqueeSection,
  Skills,
  Projects,
  Experience,
  Education,
  Contact,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroFuturistic />
        <RobotVideoSection />
        <About />
        <MarqueeSection />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
