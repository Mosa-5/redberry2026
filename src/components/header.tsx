import { Link, useNavigate } from "react-router";

import { useGetMe } from "@/reactQuery/queries/auth";

import { useAuthDialog } from "./auth/auth-dialog-context";
import { ProfileMenu } from "./profile-menu";
import { Search } from "./search";
import { Skeleton } from "./skeleton";
import { Button } from "./ui/button";

const Header = () =>{
    const { open } = useAuthDialog()
    const navigate = useNavigate()
    // isLoading is only true while a stored token's /me is in flight. A
    // guest never fetches, so the buttons show at once with no flash.
    const { data: user, isLoading } = useGetMe()

   return( <div className="w-full h-27.75 px-15 pt-7.5 pb-10 flex items-center justify-between bg-(image:--header-background) absolute top-0 left-0 right-0 z-50">
        <div className="flex gap-9 items-center">
            <Link to="/" className="flex items-center gap-1.5 type-h2">
                <span className="text-foreground">KINO</span>
                <span className="text-primary">XII</span>
            </Link>
            <Link to="/sessions" className="type-overline uppercase text-foreground">Sessions</Link>
        </div>
        <div className="flex gap-8 items-center">
            <Search onSelect={(result) => navigate(`/movies/${result.slug}`)} />
            {user ? (
                <ProfileMenu user={user} />
            ) : isLoading ? (
                // Same footprint as the profile trigger while the session restores.
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-xs" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ) : (
                <div className="flex gap-3">
                <Button onClick={() => open("register")}>Sign up</Button>
                <Button variant="secondary" onClick={() => open("login")}>Log in</Button>
                </div>
            )}
        </div>
    </div>)

}


export default Header;
