import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Modal,
  notification,
  Upload,
  message,
  Flex,
  Spin,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
const { Sider } = Layout;
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogout } from "../redux/actions/Auth";
import Cookies from "js-cookie";
import "./sideBar.css";
import { fetchMyProfileRequest } from "../redux/actions/MyProfile";

const SideBar = ({ collapsed, itemMenu }) => {
  const location = useLocation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [openDialogAvatar, setOpenDialogAvatar] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState("/");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.myProfileReducer.data);

  const tokenCookie = Cookies.get("token");

  useEffect(() => {
    const pathName = location.pathname;
    setSelectedKeys(pathName);
  }, [location.pathname]);

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const hideLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  const confirmLogout = () => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}logout`, {
        headers: { Authorization: "Bearer " + tokenCookie },
      })
      .then((response) => {
        dispatch(fetchLogout());
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/login");
      })
      .catch((error) => {
        notification.error({
          message: "Logout Failed",
          description: error.response.data.message
            ? error.response.data.message
            : error,
          duration: 3,
        });
      });
    hideLogoutModal();
  };

  return (
    <>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div>
          <div className="flex flex-col justify-center items-center my-6">
            <Avatar
              onClick={() => {
                setOpenDialogAvatar(true);
              }}
              size={collapsed ? 50 : 100}
              src={
                myProfile?.data.avatar
                  ? myProfile?.data.avatar
                  : "https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png"
              }
            />
            {collapsed ? null : (
              <Typography className="text-white text-xl mt-2">
                {myProfile?.data?.username}
              </Typography>
            )}
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            selectedKeys={[selectedKeys]}
            mode="inline"
            items={itemMenu}
          />
        </div>
        <button
          onClick={showLogoutModal}
          className={`flex ${
            collapsed ? `justify-center` : `justify-start`
          } items-center px-6 py-2.5 mb-5 rounded-xl logout-button`}
        >
          <ArrowLeftOnRectangleIcon className="text-gray-100 w-6 h6" />
          {collapsed ? null : (
            <span className="text-gray-100 ml-3">Đăng xuất</span>
          )}
        </button>
        <Modal
          title="Confirm Logout"
          open={logoutModalVisible}
          onOk={confirmLogout}
          onCancel={hideLogoutModal}
          okText="Logout"
          cancelText="Cancel"
          okButtonProps={{ style: { background: "red" } }}
        >
          Are you sure you want to logout?
        </Modal>
        <DialogAvatar
          data={myProfile}
          open={openDialogAvatar}
          onCancel={() => {
            setOpenDialogAvatar(false);
          }}
        />
      </Sider>
    </>
  );
};

export default SideBar;

const DialogAvatar = ({ open, onCancel, data }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const dispatch = useDispatch();
  const token = Cookies.get("token");

  const handleFileUpload = async ({ file }) => {
    const fromData = new FormData();
    fromData.append("avatar", file);
    setLoading(true);
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}user/upload-avatar/${data?.data._id}`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setLoading(false);
        message.success({ content: "chỉnh sửa ảnh thành công", duration: 3 });
        dispatch(fetchMyProfileRequest(data?.data._id, token));
      })
      .catch((error) => {
        setLoading(false);
        message.error({ content: "chỉnh sửa ảnh thất bại", duration: 3 });
      });
  };

  return (
    <Modal open={open} footer={null} onCancel={onCancel}>
      <Flex vertical justify="center" align="center">
        <Typography.Title level={3} className="mt-5">
          Chỉnh sửa ảnh đại diện
        </Typography.Title>
        <Upload
          name="avatar"
          className="avatar-uploader"
          showUploadList={false}
          multiple
          customRequest={handleFileUpload}
        >
          {loading ? (
            <Spin>
              <Avatar
                className="m-3 avatar-hovered"
                size={200}
                src={data?.data.avatar}
              />
            </Spin>
          ) : (
            <Avatar
              className="m-3 avatar-hovered"
              size={200}
              src={
                data?.data.avatar
                  ? data?.data.avatar
                  : "https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png"
              }
            />
          )}
        </Upload>
      </Flex>
    </Modal>
  );
};
