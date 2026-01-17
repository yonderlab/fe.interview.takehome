import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import WelcomePage from './pages/Welcome'
import { welcomeLoader } from './loaders/plans'
import CustomizePlanPage, { loader as customizePlanLoader } from './pages/CustomizePlan'
import YourPlanPage, { loader as yourPlanLoader } from './pages/YourPlan'
import ErrorPage from './pages/ErrorPage'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
    loader: welcomeLoader,
  },
  {
    path: '/customize-plan',
    element: <CustomizePlanPage />,
    loader: customizePlanLoader,
    errorElement: <ErrorPage />,
  },
  {
    path: '/your-plan',
    element: <YourPlanPage />,
    loader: yourPlanLoader,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
