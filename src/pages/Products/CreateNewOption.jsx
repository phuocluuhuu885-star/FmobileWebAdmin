import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  notification,
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";

const CreateNewOption = ({ productId }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [existingColors, setExistingColors] = useState([]);
  const token = Cookies.get("token");

  React.useEffect(() => {
    if (productId) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}products/detail-product/${productId}`)
        .then((res) => {
          if (res.data?.result?.option) {
            const colors = res.data.result.option.map(opt => opt.name_color);
            setExistingColors([...new Set(colors)]);
          }
        })
        .catch(err => console.error("Error fetching options for colors:", err));
    }
  }, [productId]);
  const handleFinish = (value) => {
    const fromData = new FormData();
    const hotOption = Boolean(value.hot_option);
    if (image) {
      fromData.append("image", image);
    }
    const selectedColor = Array.isArray(value.name_color) ? value.name_color[0] : value.name_color;
    fromData.append("name_color", selectedColor ?? "");
    fromData.append("product_id", productId);
    fromData.append("price", value.price ?? 0);
    fromData.append("ram", value.ram ?? "");
    fromData.append("storage_capacity", value.storage_capacity ?? "");
    fromData.append("condition_percent", value.condition_percent ?? "");
    fromData.append("battery_health", value.battery_health ?? "");
    fromData.append("is_original", value.is_original ?? "");
    fromData.append("screen", value.screen ? `${value.screen} inch` : "");
    // Ẩn giảm giá trên UI, mặc định gửi 0
    fromData.append("discount_value", 0);
    fromData.append("quantity", value.quantity ?? 0);
    fromData.append("hot_option", hotOption ? "true" : "false");
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
        notification.error({
          message: "Lỗi",
          description: err.response?.data?.message || "Tạo option thất bại!",
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
            <Select
              mode="tags"
              placeholder="Chọn màu có sẵn hoặc gõ màu mới rồi nhấn Enter"
              size="middle"
              className="w-[50%]"
              onChange={(values) => {
                const lastValue = values[values.length - 1];
                form.setFieldsValue({ name_color: lastValue ? [lastValue] : [] });
              }}
            >
              {existingColors.map(color => (
                <Select.Option key={color} value={color}>{color}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={"RAM"} name={"ram"}>
            <Select placeholder="Chọn RAM" className="w-[50%]">
              <Select.Option value="4GB">4GB</Select.Option>
              <Select.Option value="8GB">8GB</Select.Option>
              <Select.Option value="12GB">12GB</Select.Option>
              <Select.Option value="16GB">16GB</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={"Dung lượng (ROM)"} name={"storage_capacity"}>
            <Select placeholder="Chọn ROM" className="w-[50%]">
              <Select.Option value="64GB">64GB</Select.Option>
              <Select.Option value="128GB">128GB</Select.Option>
              <Select.Option value="256GB">256GB</Select.Option>
              <Select.Option value="512GB">512GB</Select.Option>
              <Select.Option value=">=1TB">&gt;=1TB</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={"Độ mới"} name={"condition_percent"}>
            <Select placeholder="Chọn độ mới" className="w-[50%]">
              <Select.Option value="95%">95%</Select.Option>
              <Select.Option value="98%">98%</Select.Option>
              <Select.Option value="99%">99%</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={"Tình trạng Pin"} name={"battery_health"}>
            <Select placeholder="Chọn tình trạng Pin" className="w-[50%]">
              <Select.Option value="<80%">&lt;80%</Select.Option>
              <Select.Option value="80% - 90%">80% - 90%</Select.Option>
              <Select.Option value=">90%">&gt;90%</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={"Tình trạng máy"} name={"is_original"}>
            <Select placeholder="Chọn tình trạng máy" className="w-[50%]">
              <Select.Option value="Zin nguyên bản">Zin nguyên bản</Select.Option>
              <Select.Option value="Đã thay màn">Đã thay màn</Select.Option>
              <Select.Option value="Đã thay pin">Đã thay pin</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={"Màn hình"} name={"screen"}>
            <Input
              placeholder="Ví dụ: 6.1"
              addonAfter="inch"
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
              precision={0}
              step={1000}
              parser={(v) => String(v ?? "").replace(/[^\d]/g, "")}
              placeholder="nhập giá tiền của option sản phẩm"
              size="middle"
              className="w-[50%]"
            />
          </Form.Item>
          <Form.Item label={"Số lượng"} name={"quantity"}>
            <InputNumber
              min={0}
              precision={0}
              step={1}
              parser={(v) => String(v ?? "").replace(/[^\d]/g, "")}
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
