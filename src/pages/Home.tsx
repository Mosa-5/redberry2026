import { HeroCarousel } from "@/components/Hero/hero-carousel";
import { ComingSoon } from "@/components/Sections/coming-soon";
import { NowPlaying } from "@/components/Sections/now-playing";
import { RecentlyViewed } from "@/components/Sections/recently-viewed";

const Home = () => {
  return (
    <div className="flex w-full flex-col">
        <HeroCarousel />
        <div className="w-full flex flex-col gap-10">
        <RecentlyViewed />
        <NowPlaying limit={10} />
        {/* Full-bleed divider — sits outside the sections' 70px gutter. */}
        <div className="h-px w-full bg-raised" />
        <ComingSoon limit={10} />
        </div>
    </div>
  )
}

export default Home;