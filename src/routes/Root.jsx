// src/routes/Root.jsx
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Exercises from "../pages/Exercises";
import Chest from "../pages/Chest";
import Legs from "../pages/Legs";
import Profile from "../pages/Profile";
import ErrorPage from "../pages/ErrorPage";
import ProtectedRoute from "../components/ProtectedRoute"; // Importa el componente

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "exercises",
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          {
            index: true,
            element:<Exercises />
          },
          {
            path: "chest",
            element: <Chest />
          },
          {
            path: "legs",
            element: <Legs />
          },
        ]
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}