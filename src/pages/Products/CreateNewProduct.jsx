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
      component: <Input size="middle" placeholder="Tên sản phẩm" />,
    },
    {
      label: "Tên nhà sản xuất",
      name: "manufacturer",
      component: (
        <Input
          size="middle"
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
          className="w-full"
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
        <Select
          className="w-full"
          size="middle"
          placeholder="Chọn trạng thái sản phẩm"
        >
          <Select.Option value="mới">Mới</Select.Option>
          <Select.Option value="cũ">Cũ</Select.Option>
        </Select>
      ),
    },
    {
      label: "Độ mới (%)",
      name: "condition_percent",
      component: (
        <Select
          className="w-full"
          size="middle"
          placeholder="Chọn phần trăm độ mới (máy cũ)"
          allowClear
        >
          <Select.Option value="100">100%</Select.Option>
          <Select.Option value="99">99%</Select.Option>
          <Select.Option value="98">98%</Select.Option>
          <Select.Option value="95">95%</Select.Option>
        </Select>
      ),
    },
    {
      label: "Tình trạng Pin (%)",
      name: "battery_health",
      component: (
        <Input size="middle" placeholder="Nhập phần trăm Pin (VD: 90%)" />
      ),
    },
    {
      label: "Tình trạng sửa chữa",
      name: "is_original",
      component: (
        <Select
          className="w-full"
          size="middle"
          placeholder="Zin hay đã thay thế?"
          allowClear
        >
          <Select.Option value="Zin nguyên bản">Zin nguyên bản</Select.Option>
          <Select.Option value="Đã thay linh kiện">Đã thay linh kiện</Select.Option>
        </Select>
      ),
    },
    {
      label: "Cam kết bảo hành",
      name: "warranty_time",
      component: (
        <Select
          className="w-full"
          size="middle"
          placeholder="Chọn thời gian bảo hành"
          allowClear
        >
          <Select.Option value="1 tháng">1 tháng</Select.Option>
          <Select.Option value="3 tháng">3 tháng</Select.Option>
          <Select.Option value="6 tháng">6 tháng</Select.Option>
          <Select.Option value="12 tháng">12 tháng</Select.Option>
        </Select>
      ),
    },
    {
      label: "Hệ điều hành sản phẩm",
      name: "operatingSystem",
      rules: [{ required: true, message: "Chọn hệ điều hành sản phẩm" }],
      component: (
        <Select
          className="w-full"
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
    {
      label: "Dung lượng RAM (GB)",
      name: "ram",
      component: (
        <InputNumber size="middle" className="w-full" placeholder="VD: 8" min={1} />
      ),
    },
    {
      label: "Dung lượng ROM (GB)",
      name: "rom",
      component: (
        <InputNumber size="middle" className="w-full" placeholder="VD: 256" min={1} />
      ),
    },
    {
      label: "Mô tả sản phẩm",
      name: "description",
      rules: [{ required: true, message: "Nhập mô tả" }],
      component: <Input.TextArea rows={5} size="middle" placeholder="Mô tả sản phẩm" />,
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
          className="border w-full max-w-3xl p-6 mx-auto my-auto mt-6 shadow-xl rounded-xl bg-white"
          style={{ flex: 1 }}
        >
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            colon={false}
            onFinish={handleFinish}
          >
            {renderFormItems(formItems)}
            <Form.Item wrapperCol={{ span: 17, offset: 7 }} style={{ marginTop: 8 }}>
              <Button
                htmlType="submit"
                type="primary"
                 className="bg-[#407cff] min-w-[180px]"
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
