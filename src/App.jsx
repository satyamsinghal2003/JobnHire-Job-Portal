import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css'
import AppLayout from "./layouts/app-layout";
import LandingPage from "./pages/landingPage";
import Onboarding from "./pages/Onboarding"
import JobListing from "./pages/job-listing"
import JobPage from "./pages/job"
import PostJob from "./pages/post-job"
import SavedJobs from "./pages/saved-jobs"
import MyJobs from "./pages/my-jobs"
import Auth from "./pages/auth"
import { ThemeProvider } from "@/components/theme-provider"
import UrlProvider from "./context";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children:[
      {
        path:'/',
        element: <LandingPage />
      },
      {
        path:'/onboarding',
        element: <Onboarding />
      },
      {
        path:'/jobs',
        element: <JobListing />
      },
      {
        path:'/job/:id',
        element: <JobPage />
      },
      {
        path:'/post-job',
        element: <PostJob />
      },
      {
        path:'/saved-jobs',
        element: <SavedJobs />
      },
      {
        path:'/my-jobs',
        element: <MyJobs />
      },
      {
        path:'/auth',
        element: <Auth />
      },
    ]
  }
])

function App() {

  return (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <UrlProvider>
      <RouterProvider router= {router} />
    </UrlProvider>
  </ThemeProvider>
  )
}

export default App
