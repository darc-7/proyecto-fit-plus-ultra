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
        element: <ProtectedRoute allowedRoles={["cliente"]}><Exercises /></ProtectedRoute>,
      },
      {
        path: "routine",
        element: <ProtectedRoute allowedRoles={["cliente"]}><Routine /></ProtectedRoute>,
      },
      {
        path: "store",
        element: <ProtectedRoute allowedRoles={["cliente"]}><Store /></ProtectedRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute allowedRoles={["cliente", "entrenador", "administrador"]}><Profile /></ProtectedRoute>
      },
      /* {
        path: "clientes",
        element: (
          <ProtectedRoute allowedRoles={["entrenador"]}>
            <ClientesCatalogView />
          </ProtectedRoute>
        )
      },
      */
    ],
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}