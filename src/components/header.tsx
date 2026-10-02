import { Search } from "./search";
import { Button } from "./ui/button";

const Header = () =>{

   return( <div className="w-full h-27.75 px-15 pt-7.5 pb-10 flex items-center justify-between bg-(image:--header-background) absolute top-0 left-0 right-0 z-50">
        <div className="flex gap-9 items-center">
            <a href="/" className="flex items-center gap-1.5 type-h2">
                <span className="text-foreground">KINO</span>
                <span className="text-primary">XII</span>
            </a>
            <h4 className="type-body-s">Sessions</h4>
        </div>
        <div className="flex gap-8 items-center">
            <Search />
            <div className="flex gap-3">
            <Button className="px-5.5 py-3.5 h-10.25">Sign up</Button>
            <Button variant="secondary" className="px-5.5 py-3.5 h-10.25">Log in</Button>
            </div>
        </div>
    </div>)

}


export default Header;