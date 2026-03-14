import React, { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchProductDetailRequest } from "../../redux/actions/DetailProduct";

const { Header } = Layout;

const EditProduct = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const dataCategory = useSelector((state) => state.categoryReducer.data);
  const [data, setData] = useState;

  useEffect(() => {
    if (id) {
      axios.get(
        `${import.meta.env.VITE_BASE_URL}products/detail-product/${id}`
      );
    }
    console.log(data);
  }, [id]);

  const handleFinish = (values) => {};

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
      rules: [{ required: true, message: "Chọn trạng thái sản phẩm" }],
      component: (
        <Select
          style={{ width: "50%" }}
          size="middle"
          placeholder="Chọn trạng thái sản phẩm"
        >
          <Select.Option value="mới">Mới</Select.Option>
          <Select.Option value="cũ">Cũ</Select.Option>
        </Select>
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
      label: "Thông tin màn hình",
      name: "screen",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin màn hình sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin camera",
      name: "camera",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin camera sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin chipset",
      name: "chipset",
      component: (
        <Input
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin chipset sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin cpu",
      name: "cpu",
      component: (
        <Input
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin cpu sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin gpu",
      name: "gpu",
      component: (
        <Input
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin gpu sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin rom",
      name: "rom",
      component: (
        <InputNumber
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin rom sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin ram",
      name: "ram",
      component: (
        <InputNumber
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin ram sản phẩm"
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
    {
      label: "Thông tin pin",
      name: "battery",
      component: (
        <Input
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin pin sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin cân nặng",
      name: "weight",
      component: (
        <InputNumber
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin cân nặng sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin kết nối",
      name: "connection",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin kết nối của sản phẩm"
        />
      ),
    },
    {
      label: "Tính năng đặc biệt",
      name: "specialFeature",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin tính năng đặc biệt của sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin khác",
      name: "other",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
          className="w-[50%]"
          placeholder="Thông tin khác của sản phẩm"
        />
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
          Sửa thôn tin sản phẩm
        </Typography.Title>
      </Header>
      <Flex
        vertical
        className="border w-[50%] p-4 mx-auto my-auto mt-3 shadow-xl rounded-xl"
        style={{ flex: 1 }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleFinish}
          labelCol={{ span: 6 }}
          labelAlign="left"
          initialValues={{
            name: data ? data?.result.name : "",
            manufacturer: data ? data?.result.manufacturer : "",
            category_id: data ? data?.result.category_id?.name : undefined,
            status: data ? data?.result.status : undefined,
            description: data ? data?.result.description : "",
            screen: data ? data?.result.screen : "",
            camera: data ? data?.result.camera : "",
            chipset: data ? data?.result.chipset : "",
            cpu: data ? data?.result.cpu : "",
            gpu: data ? data?.result.gpu : "",
            rom: data ? data?.result.rom : undefined,
            ram: data ? data?.result.ram : undefined,
            operatingSystem: data ? data?.result.operatingSystem : undefined,
            battery: data ? data?.result.battery : "",
            weight: data ? data?.result.weight : undefined,
            connection: data ? data?.result.connection : "",
            specialFeature: data ? data?.result.specialFeature : "",
            other: data ? data?.result.other : "",
          }}
        >
          {renderFormItems(formItems)}
          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              className="bg-[#407cff] w-[30%]"
            >
              Sửa sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </div>
  );
};

export default EditProduct;
