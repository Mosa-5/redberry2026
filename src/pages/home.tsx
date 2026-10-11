import { HeroCarousel } from "@/components/hero/hero-carousel";
import { ComingSoon } from "@/components/sections/coming-soon";
import { NowPlaying } from "@/components/sections/now-playing";
import { RecentlyViewed } from "@/components/sections/recently-viewed";

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