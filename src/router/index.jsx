import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Home from "../pages/Home";
import App from "../App";
import Customers from "../pages/Users/Customers";
import Products from "./../pages/Products/Products";
import ProductsChart from "./../pages/Charts/Products";
import StoreChart from "./../pages/Charts/Store";
import Store from "./../pages/Users/Store";
import Banner from "./../pages/Products/Banner";
import ProductDetail from "../pages/Products/ProductDetail";
import Category from "../pages/Products/Category";
import CreateNewProduct from "../pages/Products/CreateNewProduct";
import EditProduct from "../pages/Products/editProduct";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/customers", element: <Customers /> },  
      { path: "/products", element: <Products />, children: [] },
      { path: "/categories", element: <Category /> },
      { path: "/stores", element: <Store /> },
      { path: "/banner", element: <Banner /> },
      { path: "/chart/product", element: <ProductsChart /> },
      { path: "/chart/store", element: <StoreChart /> },
    ],
  },
  { path: "/products/:id", element: <ProductDetail /> },
  { path: "/products/create", element: <CreateNewProduct /> },
  { path: "/products/edit-product/:id", element: <EditProduct /> },
]);
