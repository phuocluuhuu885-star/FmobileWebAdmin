import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Modal, Pagination, Table, message, notification } from "antd";
import Cookies from "js-cookie";
import axios from "axios";
import { fetchStoreRequest } from "../../redux/actions/Store";

const Store = () => {
  const data = useSelector((state) => state.storeReducer.data);
  const loading = useSelector((state) => state.storeReducer.loading);
  const error = useSelector((state) => state.storeReducer.error);

  const dispatch = useDispatch();

  const token = Cookies.get("token");

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      render: (text) => (
        <Avatar
          src={
            text
              ? text
              : "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
          }
          className=""
        />
      ),
    },
    {
      title: "Ảnh bìa",
      dataIndex: "banner",
      key: "banner",
      render: (text) => (
        <Avatar
          src={
            text
              ? text
              : "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
          }
          className=""
        />
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Kích hoạt",
      dataIndex: "is_active",
      key: "active",
      render: (active, record) => {
        return (
          <>
            <button
              onClick={() => {
                Modal.confirm({
                  title: "Bạn muốn thay đổi trạng thái của cửa hàng này?",
                  okButtonProps: {
                    style: {
                      backgroundColor: "#407cff",
                    },
                  },
                  onOk: () => {
                    axios
                      .put(
                        `${import.meta.env.VITE_BASE_URL}store/change-active/${
                          record._id
                        }`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      )
                      .then((response) => {
                        dispatch(fetchStoreRequest(token));
                        notification.success({
                          message: "Thành công",
                          description: "Chuyển trạng thái thành công!",
                          duration: 3,
                        });
                      })
                      .catch((error) => {
                        notification.error({
                          error: "Thất Bại",
                          description: "Chuyển trạng thái thất bại!",
                          duration: 3,
                          type: "error",
                        });
                      });
                  },
                });
              }}
              className={`${
                active ? `bg-green-500  ` : `bg-red-500`
              } rounded-lg px-3 py-2 text-white`}
            >
              {active ? "Kích hoạt" : "Chưa kích hoạt"}
            </button>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        dataSource={data ? data.data : data}
        columns={columns}
        loading={loading}
        bordered
        rowKey={(record) => record._id}
      />
    </div>
  );
};

export default Store;
