import React, { useEffect, useState } from "react";
import { Layout, notification, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import "./App.css";
import SideBar from "./components/SideBar";
import HeaderBar from "./components/HeaderBar";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { fetchMyProfileRequest } from "./redux/actions/MyProfile";
import { fetchCategoryRequest } from "./redux/actions/Category";
import { fetchStoreRequest } from "./redux/actions/Store";
import { fetchStaffRequest } from "./redux/actions/Staff";
import { fetchProductRequest } from "./redux/actions/Product";
import { fetchCustomerRequest } from "./redux/actions/Customer";
import { fetchBannerRequest } from "./redux/actions/Banner";
import { fetchInvoiceRequest } from "./redux/actions/Invoice";


const { Content } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();



  const itemMenu = [
    getItem(<Link to="/">Trang chủ</Link>, "/", <HomeIcon className="w-5 h-5" />),
    getItem("Sản phẩm", "product", <Squares2X2Icon className="w-5 h-5" />, [
      getItem(<Link to="/products">Sản phẩm</Link>, "/products"),
      getItem(<Link to="/categories">Loại sản phẩm</Link>, "/categories"),
      getItem(<Link to="/banner">Quảng cáo</Link>, "/banner"),
    ]),
    getItem(
      <Link to="/invoice">Hóa đơn</Link>,
      "/invoice",
      <ClipboardDocumentListIcon className="w-5 h-5" />
    ),
    getItem("Mọi người", "user", <UserGroupIcon className="w-5 h-5" />, [
      getItem(<Link to="/customers">Người dùng</Link>, "/customers"),
    ]),
  ];

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  // Check login + token expiration
  const token = Cookies.get("token");
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // Token has expired, redirect to the login page
          Cookies.remove("token");
          notification.error({
            message: "Token Expired",
            description: "Your session has expired. Please log in again.",
            duration: 3,
          }); // Clear the expired token
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    checkTokenExpiration(); // Check token expiration on initial render

    // Check token expiration on every route change
    const unlisten = navigate(checkTokenExpiration);

    return () => {
      unlisten; // Cleanup the listener when the component is unmounted
    };
  }, [token, navigate]);

  // Fetch dữ liệu ban đầu (profile + danh mục, sản phẩm, khách hàng...)
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      dispatch(fetchMyProfileRequest(decoded.userId, token));
    } catch (e) {
      // ignore
    }
  }, [dispatch]);



  useEffect(() => {
    dispatch(fetchCategoryRequest());
  }, []);
  useEffect(() => {
    dispatch(fetchStoreRequest(token));
  }, []);

  useEffect(() => {
    dispatch(fetchCustomerRequest("customer", token));
  }, []);

  useEffect(() => {
    dispatch(fetchStaffRequest("staff", token));
  }, []);

  useEffect(() => {
    dispatch(fetchProductRequest());
  }, []);

  useEffect(() => {
    dispatch(fetchBannerRequest());
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchInvoiceRequest(token));
    }
  }, []);


  return (
    <Layout className="h-[100vh]">
      <SideBar collapsed={collapsed} itemMenu={itemMenu} />
      <Layout className="h-[100vh]">
        <HeaderBar
          toggleMenu={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />
        <Content
          style={{
            margin: "10px 10px",
            padding: 24,
            background: colorBgContainer,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;