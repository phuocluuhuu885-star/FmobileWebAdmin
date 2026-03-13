import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerRequest } from "../../redux/actions/Customer";
import { Avatar, Modal, Pagination, Table, notification } from "antd";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
// import CustomersInvoice from "./CustomersInvoice";


const Customers = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.customerReducer.data);
  const loading = useSelector((state) => state.customerReducer.loading);
  const error = useSelector((state) => state.customerReducer.error);
  const token = Cookies.get("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // useEffect(() => {
  //   const token = Cookies.get("token");
  //   dispatch(fetchCustomerRequest("customer", token));
  // }, [dispatch, currentPage, pageSize]);

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "username",
      key: "username",
      
    },
    {
      title: "Ảnh",
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
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
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
                        `${import.meta.env.VITE_BASE_URL
                        }user/change-active-account/${record._id}`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      )
                      .then((response) => {
                        dispatch(fetchCustomerRequest("customer", token));
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
              className={`${active ? `bg-green-500  ` : `bg-red-500`
                } rounded-lg px-3 py-2 text-white`}
            >
              {active ? "Kích hoạt" : "Chưa kích hoạt"}
            </button>
          </>
        );
      },
    },
  ];

  // const handleTableChange = (pagination, filters, sorter) => {
  //   setCurrentPage(pagination.current);
  //   setPageSize(pagination.pageSize);
  // };

  return (
      <div>
        <Table
          dataSource={data ? data.result : data}
          columns={columns}
          loading={loading}
          bordered
          // pagination={{
          //   current: currentPage,
          //   pageSize: pageSize,
          //   total: data ? data.totalPages : 0,
          // }}
          // onChange={handleTableChange}
          rowKey={(record) => record._id}
        />
         {/* Thêm Route cho trang khách hàng */}
      {/* <Route path="/_:id" component={CustomersInvoice} /> */}
      </div>
  );
};

export default Customers;
