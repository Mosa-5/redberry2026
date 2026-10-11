import { Route, Routes } from "react-router"

import { AuthDialogProvider } from "./components/auth/auth-dialog-provider"
import { AuthGuard } from "./components/auth/auth-guard"
import { BookingProvider } from "./components/booking/booking-provider"
import RootLayout from "./layouts/root-layout"
import Home from "./pages/home"
import Movie from "./pages/movie"
import NotFound from "./pages/not-found"
import Profile from "./pages/profile"
import Sessions from "./pages/sessions"

const App = () => {
  return (
    // The router is in main.tsx, so this provider — and App itself — can use
    // router hooks; actions replayed after login navigate. Booking sits
    // inside it because opening the modal may ask for a login first.
    <AuthDialogProvider>
      <BookingProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="movies/:slug" element={<Movie />} />
            <Route path="sessions" element={<Sessions />} />
            <Route element={<AuthGuard />}>
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BookingProvider>
    </AuthDialogProvider>
  )
}

export default App
