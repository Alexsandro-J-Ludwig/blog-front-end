import ReactDOM from "react-dom/client";
import './index.css'
import { Main } from './pages/menu/menu'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import React from 'react';
import { RegisterPage } from "./pages/register-page/RegisterPage";
import { ProfilePage } from "./pages/profile/Profile";
import { getUserFromToken } from "./utils/loginVerify";

function ProfileRedirect() {
  const user = getUserFromToken();
  if (user && user.username) {
    return <Navigate to={`/profile/${user.username}`} replace />;
  }
  return <Navigate to="/register" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/profile/:username",
    element: <ProfilePage />
  },
  {
    path: "/profile",
    element: <ProfileRedirect />
  }
]);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}