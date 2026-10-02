import { HeroCarousel } from "@/components/Hero/hero-carousel";
import { ComingSoon } from "@/components/Sections/coming-soon";
import { NowPlaying } from "@/components/Sections/now-playing";

const Home = () => {
  return (
    <div className="flex w-full flex-col">
        <HeroCarousel />
        <NowPlaying />
        <ComingSoon />
        
    </div>
  )
}

export default Home;