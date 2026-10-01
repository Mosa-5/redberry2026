const Footer = () => {

   return (
     <footer className="w-full bg-background px-8.5 pt-6.75 pb-8.5 flex flex-col gap-5">
        <div className="h-px w-full bg-raised" />
        <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-1 type-button">
                <span className="text-foreground">KINO</span>
                <span className="text-primary">XII</span>
            </a>
            <p className="type-body-s text-muted-foreground">
                © 2026 Kino XII. All rights reserved.
            </p>
        </div>
     </footer>
   )

}


export default Footer;
