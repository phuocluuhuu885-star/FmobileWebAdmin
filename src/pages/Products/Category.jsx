import {
  Avatar,
  Button,
  Flex,
  FloatButton,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchCategoryRequest } from "../../redux/actions/Category";

const Category = () => {
  const data = useSelector((state) => state.categoryReducer.data);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [api, setApi] = useState(null);
  const [apiMethod, setApiMethod] = useState(null);
  const dispatch = useDispatch();
  const token = Cookies.get("token");

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 100,
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => <Avatar src={image} size={50} />,
    },
    {
      title: "",
      key: "action",
      render: (record) => {
        return (
          <div className="flex flex-row justify-around items-center">
            <Button
              onClick={() => {
                setApi(
                  `${import.meta.env.VITE_BASE_URL}category/edit/${record._id}`
                );
                setApiMethod("update");
                setItemSelected(record);
                setOpenDialog(true);
              }}
            >
              Sửa
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
          type="primary"
          className="bg-[#407cff] px-10"
          onClick={() => {
            setApi(`${import.meta.env.VITE_BASE_URL}category/add`);
            setApiMethod("add");
            setItemSelected(null);
            setOpenDialog(true);
          }}
        >
          Add
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data}
        bordered
        rowKey={(record) => record._id}
      />
      <DialogFormCategory
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        data={itemSelected}
        urlApi={api}
        method={apiMethod}
      />
    </div>
  );
};

export default Category;

const DialogFormCategory = ({ open, onClose, data, urlApi, method }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = Cookies.get("token");

  useEffect(() => {
    if (data && data.image) {
      setImage(data.image);
      setImagePreview(data.image);
    }
  }, [data]);

  const handleFinish = (value) => {
    console.log(value.name);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", value.name);
    switch (method) {
      case "add":
        console.log("b");
        setLoading(true);
        axios
          .post(urlApi, formData, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(fetchCategoryRequest());
            setLoading(false);
            notification.success({
              message: "Thành công",
              description: "Thêm thể loại thành công!",
              duration: 3,
              type: "success",
            });
            onClose();
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
            notification.error({
              message: "Thất Bại",
              description: "Thêm thể loại thất bại",
              duration: 3,
              type: "error",
            });
          });
        break;
      case "update":
        console.log("a");
        setLoading(true);
        axios
          .put(urlApi, formData, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(fetchCategoryRequest());
            setLoading(false);
            notification.success({
              message: "Thành công",
              description: "Sửa thể loại thành công!",
              duration: 3,
              type: "success",
            });
            onClose();
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
            notification.error({
              message: "Thất Bại",
              description: "Sửa thể loại thất bại",
              duration: 3,
              type: "error",
            });
          });
        break;
      default:
        console.log("c");
        return null;
    }
  };
  const handleCancel = () => {
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setImage(null);
        setImagePreview(null);
        onClose();
      }}
      footer={null}
    >
      <Flex vertical>
        <Typography.Title level={3} className="self-center mt-3">
          {data ? "Sửa thể loại" : "Thêm thể loại"}
        </Typography.Title>
        <Form
          form={form}
          layout="vertical"
          size="middle"
          onFinish={handleFinish}
        >
          <Form.Item
            name="name"
            label="Tên thể loại"
            rules={[{ required: true, message: "Nhập tên thể loại!" }]}
            initialValue={data ? data.name : null}
          >
            <Input placeholder="Tên thể loại" />
          </Form.Item>
          <Form.Item name="image" label="Ảnh thể loại">
            <Input
              placeholder="Ảnh thể loại"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  // Display image preview
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImage(file);
                    setImagePreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Form.Item>
          {imagePreview && (
            <div className="mb-2 flex justify-center">
              <img src={imagePreview} className="w-28" />
            </div>
          )}
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
