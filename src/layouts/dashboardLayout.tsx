import Footer from "@/components/footer"
import Header from "@/components/header"


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>)
}

export default DashboardLayout;