import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  notification,
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";

const CreateNewOption = ({ productId }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const token = Cookies.get("token");
  const handleFinish = (value) => {
    console.log({ ...value, productId });
    const fromData = new FormData();
    if (image) {
      fromData.append("image", image);
    }
    fromData.append("name_color", value.name_color ?? "");
    fromData.append("product_id", productId);
    fromData.append("price", value.price ?? 0);
    fromData.append("discount_value", value.discount_value ?? 0);
    fromData.append("quantity", value.quantity ?? 0);
    fromData.append("hot_option", value.hot_option ?? false);
    axios
      .post(
        `${import.meta.env.VITE_BASE_URL}products/create-option`,
        fromData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        form.resetFields();
        notification.success({
          message: "success",
          description: "Tạo option thành công",
          duration: 3,
          type: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        notification.error({
          error: "error",
          description: "Tạo option thất bại!",
          duration: 3,
          type: "error",
        });
      });
  };
  return (
    <div>
      <Flex
        vertical
        className="border w-[50%] p-4 mx-auto my-auto mt-3 shadow-xl rounded-xl"
        style={{ flex: 1 }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleFinish}
          labelCol={{ span: 4 }}
          labelAlign="left"
        >
          <Form.Item label={"Màu"} name={"name_color"}>
            <Input
              placeholder="nhập tên màu của option sản phẩm"
              size="middle"
              className="w-[50%]"
            />
          </Form.Item>
          <Form.Item name="image" label="Ảnh option">
            <Input
              className="w-[50%]"
              placeholder="Ảnh option"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  // Display image preview
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImage(file);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Form.Item>
          <Form.Item label={"giá tiền"} name={"price"}>
            <InputNumber
              min={0}
              placeholder="nhập giá tiền của option sản phẩm"
              size="middle"
              className="w-[50%]"
            />
          </Form.Item>
          <Form.Item label={"Giảm giá (theo %)"} name={"discount_value"}>
            <InputNumber
              min={0}
              max={50}
              placeholder="nhập phần trăm giảm giá của option sản phẩm"
              size="middle"
              className="w-[50%]"
            />
          </Form.Item>
          <Form.Item label={"Số lượng"} name={"quantity"}>
            <InputNumber
              min={0}
              placeholder="nhập số lượng của option sản phẩm"
              size="middle"
              className="w-[50%]"
            />
          </Form.Item>
          <Form.Item
            label={"hot option"}
            name={"hot_option"}
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
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
    </div>
  );
};

export default CreateNewOption;
