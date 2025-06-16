// src/routes/Root.jsx
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Exercises from "../pages/Exercises";
import Routine from "../pages/Routine";
import Profile from "../pages/Profile";
import Store from "../pages/Store";
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
        element: <ProtectedRoute><Exercises /></ProtectedRoute>,
      },
      {
        path: "routine",
        element: <ProtectedRoute><Routine /></ProtectedRoute>,
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: "store",
        element: <ProtectedRoute><Store /></ProtectedRoute>
      },
    ],
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}