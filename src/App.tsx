import { Route, Routes } from "react-router"

import { AuthDialogProvider } from "./components/Auth/auth-dialog-provider"
import { AuthGuard } from "./components/Auth/auth-guard"
import DashboardLayout from "./layouts/dashboardLayout"
import Home from "./pages/Home"
import Profile from "./pages/Profile"

const App = () => {
  return (
    // The router is in main.tsx, so this provider — and App itself — can use
    // router hooks; actions replayed after login navigate.
    <AuthDialogProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route element={<AuthGuard />}>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </AuthDialogProvider>
  )
}

export default App
