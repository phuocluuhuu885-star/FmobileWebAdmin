import {
  Col,
  Flex,
  Layout,
  Row,
  Typography,
  Badge,
  Skeleton,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Checkbox,
  notification,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import EditableTagSelect from "../../components/EditableTagSelect";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetailRequest } from "../../redux/actions/DetailProduct";
import Cookies from "js-cookie";
import { setSelectedOption } from "../../redux/actions/SelectOption";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDialogOption, setOpenDialogOption] = useState(false);
  const [api, setApi] = useState(null);
  const [apiMethod, setApiMethod] = useState(null);
  const [optionSelected, setOptionSelected] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = Cookies.get("token");

  const data = useSelector((state) => state.productDetailReducer.data);
  const loading = useSelector((state) => state.productDetailReducer.loading);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetailRequest(id));
    }
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide > 0 ? prevSlide - 1 : data?.result.image.length - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide < data?.result.image.length - 1 ? prevSlide + 1 : 0
    );
  };

  const handleChangeActive = () => {
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}products/change-active-product/${id}`
      )
      .then((response) => {
        dispatch(fetchProductDetailRequest(id));
        notification.success({
          message: "success",
          description: "Change active successfully",
          duration: 3,
          type: "success",
        });
      })
      .catch(() => {
        notification.error({
          error: "error",
          description: "Change active  failed",
          duration: 3,
          type: "error",
        });
      });
  };

  if (loading) {
    return (
      <Flex vertical>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Flex>
    );
  }

  return (
    <Layout className="bg-white">
      <Header className="flex flex-row bg-slate-50 shadow-lg justify-between items-center fixed w-full top-0 z-10">
        <div className="flex flex-row items-center">
          <ArrowLeftIcon
            className="w-8 h-8 mr-5"
            onClick={() => {
              navigate(-1);
            }}
          />
          <Typography className="text-lg font-semibold">
            {data?.result.name}
          </Typography>
        </div>
        <div className="">
          <button
            onClick={() => {
              Modal.confirm({
                title: "Bạn muốn thay đổi trạng thái sản phẩm",
                okButtonProps: {
                  style: {
                    backgroundColor: "#407cff",
                  },
                },
                onOk: () => {
                  handleChangeActive();
                },
              });
            }}
            className={`flex justify-center items-center ${
              data?.result.is_active ? `bg-green-500  ` : `bg-red-500`
            } rounded-xl text-white min-w-0-[80px] px-2 h-10`}
          >
            {data?.result.is_active ? "Kích hoạt" : "Chưa kích hoạt"}
          </button>
        </div>
      </Header>
      <Content className="mt-[4%] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-10">
          {data?.result?.option?.map((option, index) => {
            return (
              <div
                key={index}
                className="flex flex-row p-4 border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 items-start justify-between relative cursor-pointer min-h-[220px]"
                onClick={() => {
                  setApiMethod("update");
                  dispatch(setSelectedOption(option));
                  setApi(
                    `${import.meta.env.VITE_BASE_URL}products/update-option/${
                      option._id
                    }`
                  );
                  setOpenDialogOption(true);
                }}
              >
                <div className="relative flex-shrink-0 mr-3">
                  <img
                    src={option.image}
                    className="w-24 h-24 md:w-28 md:h-28 object-contain bg-gray-50 rounded-xl p-1 border border-gray-100"
                    alt={option.name_color}
                  />
                  {option.hot_option && (
                    <Tag
                      color="red"
                      className="absolute -top-2 -left-2 m-0 font-semibold shadow-sm border-none"
                    >
                      🔥 Nổi bật
                    </Tag>
                  )}
                </div>
                <div className="flex flex-col flex-grow min-w-0 pr-2 space-y-1">
                  <div className="text-gray-900 font-semibold text-sm">
                    Màu sắc: <span className="font-normal text-gray-700">{option.name_color}</span>
                  </div>
                  {option.ram && (
                    <div className="text-xs text-gray-600">
                      RAM: <span className="text-gray-800 font-medium">{option.ram}</span>
                    </div>
                  )}
                  {option.storage_capacity && (
                    <div className="text-xs text-gray-600">
                      Bộ nhớ: <span className="text-gray-800 font-medium">{option.storage_capacity}</span>
                    </div>
                  )}
                  {option.condition_percent && (
                    <div className="text-xs text-gray-600">
                      Độ mới: <span className="text-gray-800 font-medium">{option.condition_percent}</span>
                    </div>
                  )}
                  {option.battery_health && (
                    <div className="text-xs text-gray-600">
                      Pin: <span className="text-gray-800 font-medium">{option.battery_health}</span>
                    </div>
                  )}
                  {option.is_original && (
                    <div className="text-xs text-gray-600">
                      Tình trạng: <span className="text-gray-800 font-medium">{option.is_original}</span>
                    </div>
                  )}
                  {option.warranty_time && (
                    <div className="text-xs text-gray-600">
                      Bảo hành: <span className="text-gray-800 font-medium">{option.warranty_time}</span>
                    </div>
                  )}
                  <div className="text-xs text-blue-600 font-semibold pt-1">
                    Giá gốc: {option.price.toLocaleString("vi-VN")} đ
                  </div>
                  <div className="text-xs text-gray-500">
                    Kho: <span className="text-gray-700 font-medium">{option.quantity}</span> | Đã bán: <span className="text-gray-700 font-medium">{option.soldQuantity}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 self-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    Modal.confirm({
                      title: "Xóa option",
                      content: `Bạn muốn xóa option này?`,
                      okButtonProps: {
                        style: {
                          backgroundColor: "#407cff",
                        },
                      },
                      onOk: () => {
                        axios
                          .delete(
                            `${
                              import.meta.env.VITE_BASE_URL
                            }products/delete-option/${option._id}`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          )
                          .then((res) => {
                            dispatch(fetchProductDetailRequest(id));
                            notification.success({
                              message: "success",
                              description: "Xóa option thành công",
                              duration: 3,
                              type: "success",
                            });
                          })
                          .catch(() => {
                            notification.error({
                              error: "error",
                              description: "Xóa option thất bại!",
                              duration: 3,
                              type: "error",
                            });
                          });
                      },
                    });
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
          <button
            onClick={() => {
              setOptionSelected(null);
              dispatch(setSelectedOption(null));
              setApi(`${import.meta.env.VITE_BASE_URL}products/create-option`);
              setApiMethod("add");
              setOpenDialogOption(true);
            }}
            className="flex flex-col justify-center items-center p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all duration-200 min-h-[220px]"
          >
            <PlusIcon className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-500 font-medium text-sm">Thêm option mới</span>
          </button>
        </div>
        <hr className="my-5" />
        <Row>
          <Col span={12} className="flex flex-col px-10">
            <Text className="text-base">
              {data?.result.category_id.name && (
                <>
                  <span className="font-bold">Thể loại:</span>{" "}
                  {data?.result.category_id.name}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.status && (
                <>
                  <span className="font-bold">Trạng thái:</span>{" "}
                  {data?.result.status}
                </>
              )}
            </Text>
            
            <Text className="text-base">
              {data?.result.screen && (
                <>
                  <span className="font-bold">Màn hình:</span>{" "}
                  {data?.result.screen}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.camera && (
                <>
                  <span className="font-bold">Camera:</span>{" "}
                  {data?.result.camera}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.chipset && (
                <>
                  <span className="font-bold">chipset:</span>{" "}
                  {data?.result.chipset}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.cpu && (
                <>
                  <span className="font-bold">cpu:</span> {data.result.cpu}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.gpu && (
                <>
                  <span className="font-bold">gpu:</span> {data.result.gpu}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.operatingSystem && (
                <>
                  <span className="font-bold">Hệ điều hành:</span>{" "}
                  {data?.result.operatingSystem}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.battery && (
                <>
                  <span className="font-bold">Dung lượng pin:</span>{" "}
                  {data?.result.battery}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.weight && (
                <>
                  <span className="font-bold">Cân nặng:</span>{" "}
                  {data?.result.weight}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.connection && (
                <>
                  <span className="font-bold">Kết nối:</span>{" "}
                  {data?.result.connection}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.specialFeature && (
                <>
                  <span className="font-bold">Tính năng đặc biệt:</span>{" "}
                  {data?.result.specialFeature}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.manufacturer && (
                <>
                  <span className="font-bold">Nhà sản xuất:</span>{" "}
                  {data?.result.manufacturer}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.other && (
                <>
                  <span className="font-bold">Thông tin khác:</span>{" "}
                  {data?.result.other}
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.description && (
                <>
                  <span className="font-bold">Mô tả chi tiết sản phẩm:</span>{" "}
                  {data?.result.description}
                </>
              )}
            </Text>
          </Col>
          <Col span={12} className=""></Col>
        </Row>

        <ContentDialogOption
          open={openDialogOption}
          productId={data?.result._id}
          urlApi={api}
          method={apiMethod}
          close={() => {
            setOpenDialogOption(false);
            setOptionSelected(null);
          }}
        />
      </Content>
    </Layout>
  );
};

export default ProductDetail;

const ContentDialogOption = ({ open, urlApi, method, productId, close }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIntegrity, setSelectedIntegrity] = useState("");
  const token = Cookies.get("token");
  const dispatch = useDispatch();

  const data = useSelector(
    (state) => state.selectedOptionReducer.selectedOption
  );

  const productData = useSelector((state) => state.productDetailReducer.data);
  const existingColors = productData?.result?.option
    ? [...new Set(productData.result.option.map(opt => opt.name_color))]
    : [];

  useEffect(() => {
    if (!open) return;

    if (method === "update" && data) {
      let isOriginalVal = data.is_original ?? "";
      // Ưu tiên lấy screen từ trường screen của Option;
      // Fallback: nếu is_original dạng cũ "Đã thay màn (xxx)", trích xuất "xxx"
      let screenReplacedVal = data.screen ?? "";

      if (isOriginalVal.startsWith("Đã thay màn")) {
        // Dữ liệu cũ: ghép chi tiết vào is_original → tách ra
        if (!screenReplacedVal) {
          const match = isOriginalVal.match(/\(([^)]+)\)/);
          if (match && match[1]) {
            screenReplacedVal = match[1]; // VD: "Chính hãng", "Không chính hãng"
          }
        }
        isOriginalVal = "Đã thay màn";
      }

      setSelectedIntegrity(isOriginalVal);

      form.setFieldsValue({
        name_color: data.name_color ?? "",
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
        hot_option: Boolean(data.hot_option),
        ram: data.ram ?? "",
        storage_capacity: data.storage_capacity ?? "",
        condition_percent: data.condition_percent ?? "",
        battery_health: data.battery_health ?? "",
        is_original: isOriginalVal,
        screen_replaced_type: screenReplacedVal,
      });
    } else {
      // Khi thêm option mới, luôn clear dữ liệu option cũ.
      form.resetFields();
      setSelectedIntegrity("");
      form.setFieldsValue({
        name_color: "",
        price: 0,
        quantity: 0,
        hot_option: false,
        ram: "",
        storage_capacity: "",
        condition_percent: "",
        battery_health: "",
        is_original: "",
        screen_replaced_type: "",
      });
      setImage(null);
    }
  }, [open, method, data, form]);
  
  const handleFinish = (value) => {
    const fromData = new FormData();
    const hotOption = Boolean(value.hot_option);
    if (image) {
      fromData.append("image", image);
    }
    const selectedColor = Array.isArray(value.name_color) ? value.name_color[0] : value.name_color;
    fromData.append("name_color", selectedColor ?? "");
    fromData.append("product_id", productId);
    fromData.append("price", value.price);
    fromData.append("ram", value.ram ?? "");
    fromData.append("storage_capacity", value.storage_capacity ?? "");
    fromData.append("condition_percent", value.condition_percent ?? "");
    fromData.append("battery_health", value.battery_health ?? "");

    fromData.append("is_original", value.is_original ?? "");
    // Nếu chọn "Đã thay màn", lưu loại màn hình tự nhập vào trường screen của Option
    fromData.append("screen", selectedIntegrity === "Đã thay màn" ? (value.screen_replaced_type ?? "") : "");

    // Ẩn giảm giá trên UI, mặc định gửi 0
    fromData.append("discount_value", 0);
    fromData.append("quantity", value.quantity);
    fromData.append("hot_option", hotOption ? "true" : "false");
    switch (method) {
      case "add":
        axios
          .post(urlApi, fromData, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(fetchProductDetailRequest(productId));
            setLoading(false);
            form.resetFields();
            close();
            notification.success({
              message: "Thành công",
              description: "Thêm thể loại thành công!",
              duration: 3,
              type: "success",
            });
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
            notification.error({
              message: "Thất Bại",
              description: error.response?.data?.message || "Thêm thể loại thất bại",
              duration: 3,
              type: "error",
            });
          });
        break;
      case "update":
        setLoading(true);
        axios
          .put(urlApi, fromData, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(fetchProductDetailRequest(productId));
            setLoading(false);
            form.resetFields();
            close();
            notification.success({
              message: "Thành công",
              description: "Sửa thể loại thành công!",
              duration: 3,
              type: "success",
            });
            close();
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
            notification.error({
              message: "Thất Bại",
              description: error.response?.data?.message || "Sửa thể loại thất bại",
              duration: 3,
              type: "error",
            });
          });
        break;
      default:
        return null;
    }
  };
  const handleCancel = () => {
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      width={"40%"}
      style={{ minWidth: 600 }}
      footer={null}
      closable={() => {
        close();
        form.resetFields();
        setSelectedIntegrity("");
      }}
      onCancel={() => {
        close();
        form.resetFields();
        setSelectedIntegrity("");
      }}
    >
      <Flex vertical className="p-4 mx-auto my-auto mt-3" style={{ flex: 1 }}>
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
                <EditableTagSelect
                  storageKey="ram"
                  defaultOptions={["4GB", "6GB", "8GB", "12GB", "16GB"]}
                  placeholder="Chọn hoặc nhập RAM mới"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Dung lượng (ROM)"} name={"storage_capacity"}>
                <EditableTagSelect
                  storageKey="storage"
                  defaultOptions={["32GB", "64GB", "128GB", "256GB", "512GB", ">=1TB"]}
                  placeholder="Chọn hoặc nhập ROM mới"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Độ mới"} name={"condition_percent"}>
                <EditableTagSelect
                  storageKey="condition"
                  defaultOptions={["90%", "95%", "97%", "98%", "99%"]}
                  placeholder="Chọn hoặc nhập độ mới"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={"Tình trạng Pin"} name={"battery_health"}>
                <EditableTagSelect
                  storageKey="battery"
                  defaultOptions={["<70%", "<80%", "80% - 90%", ">90%"]}
                  placeholder="Chọn hoặc nhập tình trạng pin"
                />
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

            <Col span={12}>
              <Form.Item
                label={"Giá tiền (vnđ)"}
                name={"price"}
                initialValue={data ? data.price : 0}
              >
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
              <Form.Item
                label={"Số lượng"}
                name={"quantity"}
                initialValue={data ? data.quantity : null}
              >
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
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name={"hot_option"}
                valuePropName="checked"
                initialValue={data ? data.hot_option : null}
              >
                <Checkbox>Hot option (Nổi bật)</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Button
                htmlType="button"
                className="w-full h-10"
                onClick={handleCancel}
              >
                Clear
              </Button>
            </Col>
            <Col span={12}>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] w-full h-10"
              >
                Cập nhật
              </Button>
            </Col>
          </Row>
        </Form>
      </Flex>
    </Modal>
  );
};
