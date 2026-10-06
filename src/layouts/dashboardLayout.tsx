import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"

import Footer from "@/components/footer"
import Header from "@/components/header"

const DashboardLayout = () => {
  const { pathname } = useLocation()

  // Client-side navigation keeps the scroll position; a new page should
  // start at the top. Keyed on the path, so tab switches via ?tab= don't jump.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>)
}

export default DashboardLayout;
