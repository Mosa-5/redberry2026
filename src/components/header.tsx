import { useState } from "react";

import { useGetMe } from "@/reactQuery/query/auth";

import { LoginDialog } from "./Auth/login-dialog";
import { RegisterDialog } from "./Auth/register-dialog";
import { ProfileMenu } from "./profile-menu";
import { Search } from "./search";
import { Skeleton } from "./skeleton";
import { Button } from "./ui/button";

type AuthDialog = "login" | "register" | null

const Header = () =>{
    // TODO: move to an auth context once protected actions (Notify Me,
    // Select Seats) need to open these too.
    const [dialog, setDialog] = useState<AuthDialog>(null)
    const close = (open: boolean) => { if (!open) setDialog(null) }
    // isLoading is only true while a stored token's /me is in flight. A
    // guest never fetches, so the buttons show at once with no flash.
    const { data: user, isLoading } = useGetMe()

   return( <div className="w-full h-27.75 px-15 pt-7.5 pb-10 flex items-center justify-between bg-(image:--header-background) absolute top-0 left-0 right-0 z-50">
        <div className="flex gap-9 items-center">
            <a href="/" className="flex items-center gap-1.5 type-h2">
                <span className="text-foreground">KINO</span>
                <span className="text-primary">XII</span>
            </a>
            <a href="/sessions" className="type-overline uppercase text-foreground">Sessions</a>
        </div>
        <div className="flex gap-8 items-center">
            <Search />
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
                <Button onClick={() => setDialog("register")}>Sign up</Button>
                <Button variant="secondary" onClick={() => setDialog("login")}>Log in</Button>
                </div>
            )}
        </div>

        <LoginDialog
            open={dialog === "login"}
            onOpenChange={close}
            onSwitchToRegister={() => setDialog("register")}
            onSuccess={() => setDialog(null)}
        />
        <RegisterDialog
            open={dialog === "register"}
            onOpenChange={close}
            onSwitchToLogin={() => setDialog("login")}
            onSuccess={() => setDialog(null)}
        />
    </div>)

}


export default Header;
