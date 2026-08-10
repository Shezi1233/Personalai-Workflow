import HeroFuturistic from "@/components/ui/hero-futuristic";
import { RobotVideoSection } from "@/components/RobotVideoSection";
import {
  Nav,
  Features,
  Showcase,
  Testimonials,
  Cta,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroFuturistic />
        <RobotVideoSection />
        <Features />
        <Showcase />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
