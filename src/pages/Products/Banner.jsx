import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBannerRequest } from "../../redux/actions/Banner";
import axios from "axios";

const Banner = () => {
  const data = useSelector((state) => state.bannerReducer.data);
  const loading = useSelector((state) => state.bannerReducer.loading);
  const error = useSelector((state) => state.bannerReducer.error);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const dispatch = useDispatch();

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => <img src={image} className="h-36" />,
    },
    {
      title: "",
      key: "action",
      render: (record) => {
        return (
          <div className="flex flex-row justify-around items-center">
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Bạn muốn xóa quảng cáo?",
                  okButtonProps: {
                    style: {
                      backgroundColor: "#407cff",
                    },
                  },
                  onOk: () => {
                    axios
                      .delete(
                        `${import.meta.env.VITE_BASE_URL}banner/delete/${
                          record._id
                        }`
                      )
                      .then((response) => {
                        dispatch(fetchBannerRequest());
                        notification.success({
                          message: "Thành công",
                          description: "Xóa quảng cáo thành công!",
                          duration: 3,
                          type: "success",
                        });
                      })
                      .catch((error) => {
                        console.log(error);
                        notification.error({
                          error: "Thất Bại",
                          description: "Xóa quảng cáo thất bại!",
                          duration: 3,
                          type: "error",
                        });
                      });
                  },
                });
              }}
            >
              xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-row justify-end mb-5">
        <Button
          onClick={() => {
            setEditData(null);
            setOpenDialog(true);
          }}
          type="primary"
          className="bg-[#407cff] px-10"
        >
          Add
        </Button>
      </div>
      <Table
        dataSource={data ? data.data : data}
        columns={columns}
        loading={loading}
        bordered
        rowKey={(record) => record._id}
      />
      <DialogAddBanner
        open={openDialog}
        data={editData}
        onCancel={() => {
          setOpenDialog(false);
        }}
      />
    </div>
  );
};

export default Banner;

const DialogAddBanner = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleFinish = (value) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_BASE_URL}banner/add`, formData)
      .then((response) => {
        console.log(response.data);
        dispatch(fetchBannerRequest());
        onCancel();
        form.resetFields();
        setLoading(false);
        notification.success({
          message: "Thành công",
          description: "Thêm quảng cáo thành công!",
          duration: 3,
          type: "success",
        });
      })
      .catch((error) => {
        // Handle error
        console.error(error);
        setLoading(false);
        notification.error({
          message: "Thất Bại",
          description: "Thêm quảng cáo thất bại",
          duration: 3,
          type: "error",
        });
      });
  };
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  return (
    <Modal open={open} footer={null} onCancel={handleCancel}>
      <Flex vertical justify="center">
        <Typography.Title className="self-center mt-3" level={3}>
          Tạo quảng cáo
        </Typography.Title>
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="image"
            label="Ảnh"
            rules={[{ required: true, message: "Please input your image!" }]}
          >
            <Input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </Form.Item>
          <div className="flex flex-row items-center justify-between ">
            <Form.Item>
              <Button
                htmlType="button"
                className="w-[230px]"
                onClick={handleCancel}
              >
                Hủy
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                loading={loading}
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] px-10 w-[230px]"
              >
                Lưu
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Flex>
    </Modal>
  );
};
