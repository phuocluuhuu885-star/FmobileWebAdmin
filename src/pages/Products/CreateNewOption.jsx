import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  notification,
  Row,
  Col
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";

const CreateNewOption = ({ productId }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [existingColors, setExistingColors] = useState([]);
  const [selectedIntegrity, setSelectedIntegrity] = useState("");
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
    // Nếu chọn "Đã thay màn", lưu loại màn hình tự nhập vào trường screen của Option
    fromData.append("screen", selectedIntegrity === "Đã thay màn" ? (value.screen_replaced_type ?? "") : "");
    
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
        setSelectedIntegrity("");
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
        className="border w-[60%] p-6 mx-auto my-auto mt-3 shadow-xl rounded-xl bg-white"
        style={{ flex: 1 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={"Màu"} name={"name_color"}>
                <Select
                  mode="tags"
                  placeholder="Chọn hoặc gõ màu mới"
                  size="middle"
                  className="w-full"
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
            </Col>
            
            <Col span={12}>
              <Form.Item label={"RAM"} name={"ram"}>
                <Select placeholder="Chọn RAM" className="w-full">
                  <Select.Option value="4GB">4GB</Select.Option>
                  <Select.Option value="8GB">8GB</Select.Option>
                  <Select.Option value="12GB">12GB</Select.Option>
                  <Select.Option value="16GB">16GB</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item label={"Dung lượng (ROM)"} name={"storage_capacity"}>
                <Select placeholder="Chọn ROM" className="w-full">
                  <Select.Option value="64GB">64GB</Select.Option>
                  <Select.Option value="128GB">128GB</Select.Option>
                  <Select.Option value="256GB">256GB</Select.Option>
                  <Select.Option value="512GB">512GB</Select.Option>
                  <Select.Option value=">=1TB">&gt;=1TB</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Độ mới"} name={"condition_percent"}>
                <Select placeholder="Chọn độ mới" className="w-full">
                  <Select.Option value="95%">95%</Select.Option>
                  <Select.Option value="98%">98%</Select.Option>
                  <Select.Option value="99%">99%</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Tình trạng Pin"} name={"battery_health"}>
                <Select placeholder="Chọn tình trạng Pin" className="w-full">
                  <Select.Option value="<80%">&lt;80%</Select.Option>
                  <Select.Option value="80% - 90%">80% - 90%</Select.Option>
                  <Select.Option value=">90%">&gt;90%</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Tình trạng máy"} name={"is_original"}>
                <Select
                  placeholder="Chọn tình trạng máy"
                  className="w-full"
                  onChange={(v) => {
                    setSelectedIntegrity(v);
                    if (v !== "Đã thay màn") {
                      form.setFieldValue("screen_replaced_type", undefined);
                    }
                  }}
                >
                  <Select.Option value="Zin nguyên bản">Zin nguyên bản</Select.Option>
                  <Select.Option value="Đã thay màn">Đã thay màn</Select.Option>
                  <Select.Option value="Đã thay pin">Đã thay pin</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {selectedIntegrity === "Đã thay màn" && (
              <Col span={12}>
                <Form.Item
                  label={"Loại màn hình thay thế"}
                  name={"screen_replaced_type"}
                  rules={[{ required: true, message: "Vui lòng nhập loại màn hình thay thế" }]}
                  tooltip="Nhập mô tả màn hình đã thay, ví dụ: Màn GX, Màn linh kiện, Màn zin ép kính..."
                >
                  <Input
                    placeholder="VD: Màn GX, Màn zin ép kính, Màn linh kiện..."
                    size="middle"
                    className="w-full"
                    allowClear
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item label={"Giá tiền"} name={"price"}>
                <InputNumber
                  min={0}
                  precision={0}
                  step={1000}
                  parser={(v) => String(v ?? "").replace(/[^\d]/g, "")}
                  placeholder="Nhập giá tiền"
                  size="middle"
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Số lượng"} name={"quantity"}>
                <InputNumber
                  min={0}
                  precision={0}
                  step={1}
                  parser={(v) => String(v ?? "").replace(/[^\d]/g, "")}
                  placeholder="Nhập số lượng"
                  size="middle"
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="image" label="Ảnh option">
                <Input
                  className="w-full"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImage(file);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name={"hot_option"}
                valuePropName="checked"
              >
                <Checkbox>Hot option (Nổi bật)</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" className="mt-4">
            <Col span={24}>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] w-full h-10 text-base"
              >
                Lưu Option
              </Button>
            </Col>
          </Row>
        </Form>
      </Flex>
    </div>
  );
};

export default CreateNewOption;
