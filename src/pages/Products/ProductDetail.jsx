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
  Button,
  Checkbox,
  notification,
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
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetailRequest } from "../../redux/actions/DetailProduct";
import Cookies from "js-cookie";
import { setSelectedOption } from "../../redux/actions/SelectOption";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  // const [data, setData] = useState(null);
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
      .catch((error) => {
        console.log(error);
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
        <div className="flex items-center mx-10">
          {data?.result?.option?.map((option, index) => {
            return (
              <div
                key={index}
                className="flex flex-row p-3 m-2 border rounded-xl shadow-lg items-center relative"
              >
                <div
                  className="flex"
                  onClick={() => {
                    setApiMethod("update");
                    dispatch(setSelectedOption(option));
                    console.log(option);
                    setApi(
                      `${import.meta.env.VITE_BASE_URL}products/update-option/${
                        option._id
                      }`
                    );
                    setOpenDialogOption(true);
                  }}
                >
                  <img
                    src={option.image}
                    className="w-28 h-28 object-contain mr-1"
                  />
                  <div className="flex flex-col">
                    <Text className="text-base">
                      Màu sắc: {option.name_color}
                    </Text>
                    <Text className="text-base">
                      Giá tiền gốc: {option.price.toLocaleString("vi-VN")} đ
                    </Text>
                    <Text className="text-base">
                      Số lượng trong kho: {option.quantity}
                    </Text>
                    <Text className="text-base">
                      Số lượng đã bán: {option.soldQuantity}
                    </Text>
                    <Text className="text-base">
                      Giảm giá: {option.discount_value}%
                    </Text>
                  </div>
                  {option.hot_option ? (
                    <img
                      src="/hot.png"
                      className="absolute w-10 -top-3 -left-3"
                    />
                  ) : (
                    ""
                  )}
                </div>
                <div
                  className="ml-5"
                  onClick={() => {
                    Modal.confirm({
                      title: "Xóa option",
                      content: `Bạn muốn xóa option này}?`,
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
                          .catch((err) => {
                            console.log(err);
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
                  <TrashIcon className="w-8 h-8" color="red" />
                </div>
              </div>
            );
          })}
          <button
            onClick={() => {
              setOptionSelected(null);
              setApi(`${import.meta.env.VITE_BASE_URL}products/create-option`);
              setApiMethod("add");
              setOpenDialogOption(true);
            }}
            className="flex justify-center items-center w-28 h-28 ml-3 border-dashed border-2 border-gray-300 rounded-lg"
          >
            <PlusIcon className="w-16 h-16" />
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
              {data?.result.description && (
                <>
                  <span className="font-bold">Mô tả:</span>{" "}
                  {data?.result.description}
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
              {data?.result.ram && (
                <>
                  <span className="font-bold">ram:</span> {data.result.ram} GB
                </>
              )}
            </Text>
            <Text className="text-base">
              {data?.result.rom && (
                <>
                  <span className="font-bold">rom:</span> {data.result.rom} GB
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
  const token = Cookies.get("token");
  const dispatch = useDispatch();

  const data = useSelector(
    (state) => state.selectedOptionReducer.selectedOption
  );

  const handleFinish = (value) => {
    console.log("value: ", value);
    console.log("image: ", image);
    const fromData = new FormData();
    const check = value.hot_option == undefined || null ? false : true;
    if (image) {
      fromData.append("image", image);
    }
    fromData.append("name_color", value.name_color);
    fromData.append("product_id", productId);
    fromData.append("price", value.price);
    fromData.append("discount_value", value.discount_value);
    fromData.append("quantity", value.quantity);
    fromData.append("hot_option", check);
    switch (method) {
      case "add":
        console.log("b");
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
      width={"40%"}
      style={{ minWidth: 600 }}
      footer={null}
      closable={() => {
        close();
        form.resetFields();
      }}
      onCancel={() => {
        close();
        form.resetFields();
      }}
    >
      <Flex vertical className=" p-4 mx-auto my-auto mt-3" style={{ flex: 1 }}>
        <Form
          form={form}
          onFinish={handleFinish}
          labelCol={{ span: 5 }}
          labelAlign="left"
        >
          <Form.Item
            label={"Màu"}
            name={"name_color"}
            initialValue={data ? data.name_color : null}
          >
            <Input
              placeholder="nhập tên màu của option sản phẩm"
              size="middle"
            />
          </Form.Item>
          <Form.Item name="image" label="Ảnh option">
            <Input
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
          <Form.Item
            label={"giá tiền (vnđ)"}
            name={"price"}
            initialValue={data ? data.price : 0}
          >
            <InputNumber
              min={0}
              placeholder="nhập giá tiền của option sản phẩm"
              size="middle"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            label={"Giảm giá (theo %)"}
            name={"discount_value"}
            initialValue={data ? data.discount_value : 0}
          >
            <InputNumber
              type="number"
              min={0}
              max={50}
              placeholder="nhập phần trăm giảm giá của option sản phẩm"
              size="middle"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            label={"Số lượng"}
            name={"quantity"}
            initialValue={data ? data.quantity : null}
          >
            <InputNumber
              min={0}
              placeholder="nhập số lượng của option sản phẩm"
              size="middle"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            label={"hot option"}
            name={"hot_option"}
            valuePropName="checked"
            initialValue={data ? data.hot_option : null}
          >
            <Checkbox />
          </Form.Item>
          <div
            className="flex flex-row items-center justify-around"
            style={{ width: "100" }}
          >
            <Form.Item>
              <Button
                htmlType="button"
                className="w-[230px]"
                onClick={handleCancel}
              >
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
