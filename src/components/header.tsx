import { useState } from "react";

import { LoginDialog } from "./Auth/login-dialog";
import { RegisterDialog } from "./Auth/register-dialog";
import { Search } from "./search";
import { Button } from "./ui/button";

type AuthDialog = "login" | "register" | null

const Header = () =>{
    // TODO: move to an auth context once protected actions (Notify Me,
    // Select Seats) need to open these too.
    const [dialog, setDialog] = useState<AuthDialog>(null)
    const close = (open: boolean) => { if (!open) setDialog(null) }

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
            <div className="flex gap-3">
            <Button onClick={() => setDialog("register")}>Sign up</Button>
            <Button variant="secondary" onClick={() => setDialog("login")}>Log in</Button>
            </div>
        </div>

        <LoginDialog
            open={dialog === "login"}
            onOpenChange={close}
            onSwitchToRegister={() => setDialog("register")}
        />
        <RegisterDialog
            open={dialog === "register"}
            onOpenChange={close}
            onSwitchToLogin={() => setDialog("login")}
        />
    </div>)

}


export default Header;
