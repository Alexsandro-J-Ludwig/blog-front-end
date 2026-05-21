import ReactDOM from "react-dom/client";
import './index.css'
import { Main } from './pages/menu/menu'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import { RegisterPage } from "./pages/register-page/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/register",
    element: <RegisterPage />
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