import { Outlet } from "react-router"

import Footer from "@/components/footer"
import Header from "@/components/header"

const DashboardLayout = () => {
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
