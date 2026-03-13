import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import App from "../App";
import Home from "../pages/Home";
import Customers from "../pages/Users/Customers";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <App />,
    children: [{ index: true, element: <Home /> },
        { path: "/customers", element: <Customers /> }
    ],
  },
]);