import React, { useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Select,
  Typography,
  notification,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import CreateNewOption from "./CreateNewOption";

const { Header } = Layout;

const CreateNewProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const token = Cookies.get("token");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [createProductSuccess, setCreateProductSuccess] = useState(false);
  const [productID, setProductID] = useState(null);
  const dataCategory = useSelector((state) => state.categoryReducer.data);

  const handleFinish = (values) => {
    axios
      .post(`${import.meta.env.VITE_BASE_URL}products/create-product`, values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCreateProductSuccess(true);
        setProductID(res.data.result);
        notification.success({
          message: "success",
          description: "Tạo sản phẩm thành công",
          duration: 3,
          type: "success",
        });
      })
      .catch(() => {
        notification.error({
          error: "error",
          description: "Tạo sản phẩm thất bại!",
          duration: 3,
          type: "error",
        });
      });
  };

  const renderFormItems = (items) =>
    items.map((item) => (
      <Form.Item
        key={item.name}
        label={item.label}
        name={item.name}
        rules={item.rules}
      >
        {item.component}
      </Form.Item>
    ));

  const formItems = [
    {
      label: "Tên sản phẩm",
      name: "name",
      rules: [{ required: true, message: "Nhập tên sản phẩm" }],
      component: (
        <Input size="middle" className="w-[50%]" placeholder="Tên sản phẩm" />
      ),
    },
    {
      label: "Tên nhà sản xuất",
      name: "manufacturer",
      component: (
        <Input
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin nhà sản xuất sản phẩm"
        />
      ),
    },
    {
      label: "Loại sản phẩm",
      name: "category_id",
      rules: [{ required: true, message: "Chọn loại sản phẩm" }],
      component: (
        <Select
          style={{ width: "50%" }}
          size="middle"
          placeholder="Chọn loại sản phẩm"
          options={dataCategory?.data.map((category) => ({
            label: category.name,
            value: category._id,
          }))}
          onChange={(value) => setSelectedCategory(value)}
        />
      ),
    },
    {
      label: "Trạng thái sản phẩm",
      name: "status",
      rules: [{ required: true, message: "Nhập trạng thái sản phẩm" }],
      component: (
        <Input
          size="middle"
           className="w-[50%]"
          placeholder="Nhập trạng thái sản phẩm (ví dụ: mới/cũ/like new...)"
        />
      ),
    },
    {
      label: "Mô tả sản phẩm",
      name: "description",
      rules: [{ required: true, message: "Nhập mô tả" }],
      component: (
        <Input.TextArea
          rows={5}
          size="middle"
          className="w-[70%]"
          placeholder="Mô tả sản phẩm"
        />
      ),
    },
    {
      label: "Hệ điều hành sản phẩm",
      name: "operatingSystem",
      rules: [{ required: true, message: "Chọn hệ điều hành sản phẩm" }],
      component: (
        <Select
          style={{ width: "50%" }}
          size="middle"
          placeholder="Chọn hệ điều hành sản phẩm"
        >
          <Select.Option value="Android">Android</Select.Option>
          <Select.Option value="IOS">IOS</Select.Option>
          <Select.Option value="Window">Window</Select.Option>
          <Select.Option value="MacOs">MacOs</Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header className="flex flex-row bg-slate-50 shadow-lg  items-center">
        <ArrowLeftOutlined
          className="w-7 h-7 text-xl"
          onClick={() => navigate(-1)}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {createProductSuccess ? "Tạo mới option" : "Tạo mới sản phẩm"}
        </Typography.Title>
      </Header>

      {createProductSuccess ? (
        <CreateNewOption productId={productID._id} />
      ) : (
        <Flex
          vertical
          className="border w-[50%] p-4 mx-auto my-auto mt-3 shadow-xl rounded-xl"
          style={{ flex: 1 }}
        >
          <Form form={form} layout="horizontal" onFinish={handleFinish}>
            {renderFormItems(formItems)}
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] w-[30%]"
              >
                Tạo sản phẩm
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      )}
    </div>
  );
};

export default CreateNewProduct;
