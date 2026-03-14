import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Table,
  notification,
} from "antd";
import Cookies from "js-cookie";
import axios from "axios";
import { fetchStaffRequest } from "../../redux/actions/Staff";

const Staffs = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.staffReducer.data);
  const loading = useSelector((state) => state.staffReducer.loading);
  const error = useSelector((state) => state.staffReducer.error);
  const token = Cookies.get("token");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openDialogAddStaff, setOpenDialogAddStaff] = useState(false);

  // useEffect(() => {
  //   dispatch(fetchStaffRequest("staff", token));
  //   console.log(data);
  // }, [dispatch]);
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
      title: "username",
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
      title: "",
      key: "delete",
      render: (record) => {
        return (
          <>
            <button
              className={`bg-red-500 rounded-xl w-16 h-7 text-white`}
              onClick={() => {
                Modal.confirm({
                  title: "Do you want delete the account staff?",
                  onOk: () => handleDeleteStaff(record._id),
                  okButtonProps: {
                    style: {
                      backgroundColor: "#407cff",
                    },
                  },
                });
              }}
            >
              Xóa
            </button>
          </>
        );
      },
    },
  ];

  const handleDeleteStaff = (id) => {
    axios
      .delete(
        `${import.meta.env.VITE_BASE_URL}user/delete-staff-account/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(fetchStaffRequest("staff", token));
        notification.success({
          message: "success",
          description: "Xóa tài khoản nhân viên thành công",
          duration: 3,
          type: "success",
        });
      })
      .catch((error) => {
        console.log(error);
        notification.error({
          error: "error",
          description: "Xóa tài khoản nhân viên thất bại",
          duration: 3,
          type: "error",
        });
      });
  };
  return (
    <div>
      <div className="flex flex-row justify-end mb-5">
        <Button
          onClick={() => {
            setOpenDialogAddStaff(true);
          }}
          type="primary"
          className="bg-[#407cff] px-10"
        >
          Add
        </Button>
      </div>
      <Table
        dataSource={data ? data.result : data}
        columns={columns}
        loading={loading}
        bordered
        rowKey={(record) => record._id}
      />
      <DialogAddStaff
        visible={openDialogAddStaff}
        onCancel={() => {
          setOpenDialogAddStaff(false);
        }}
      />
    </div>
  );
};

const DialogAddStaff = ({ visible, onCancel }) => {
  const token = Cookies.get("token");
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const dispatch = useDispatch();
  const handleFinish = () => {
    console.log(token);
    axios
      .post(
        `${import.meta.env.VITE_BASE_URL}user/create-staff`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        notification.success({
          message: "success",
          description: "create staff successfully",
          duration: 3,
          type: "success",
        });
        // Dispatch a new action to fetch the updated data
        dispatch(fetchStaffRequest("staff", token));

        // Close the modal
        onCancel();
      })
      .catch((error) => {
        console.log(error);
        notification.error({
          error: "error",
          description: "create staff failed",
          duration: 3,
          type: "error",
        });
      });
  };

  return (
    <Modal open={visible} footer={null} onCancel={onCancel}>
      <Flex className="bg-white" vertical>
        <p className="text-xl font-bold self-center my-5">Add Staff</p>
        <Form layout="vertical" size="middle" onFinish={handleFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              placeholder="enter email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              {
                min: 8,
                message: "Password must be at least 8 characters long.",
              },
            ]}
          >
            <Input.Password
              placeholder="enter password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            rules={[
              {
                required: true,
                message: "Please input your confirm password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The passwords do not match.")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="enter confirm password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </Form.Item>

          <div className="flex flex-row items-center justify-between ">
            <Form.Item>
              <Button htmlType="reset" className="w-[230px]">
                Clear
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] px-10 w-[230px]"
              >
                Submit
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Flex>
    </Modal>
  );
};

export default Staffs;
