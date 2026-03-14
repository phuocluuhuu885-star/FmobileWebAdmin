import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  FloatButton,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
  notification,
} from "antd";
import ShowReviewsModal from "./danhgia";

import { useDispatch, useSelector } from "react-redux";
import { fetchProductRequest } from "../../redux/actions/Product";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
const { Title } = Typography;
const { confirm } = Modal;
import { PlusIcon } from "@heroicons/react/24/solid";
import { PlusOutlined } from "@ant-design/icons";
import "./DialogUpdateProduct.css";
import { fetchProductDetailRequest } from "../../redux/actions/DetailProduct";
const { Text } = Typography;
const Products = () => {
  const token = Cookies.get("token");
  const loadingProduct = useSelector((state) => state.productReducer.loading);
  const dataProduct = useSelector((state) => state.productReducer.data);
  const errorProduct = useSelector((state) => state.productReducer.error);

  const loadingCategory = useSelector((state) => state.categoryReducer.loading);
  const dataCategory = useSelector((state) => state.categoryReducer.data);
  const errorCategory = useSelector((state) => state.categoryReducer.error);

  const loadingStore = useSelector((state) => state.storeReducer.loading);
  const dataStore = useSelector((state) => state.storeReducer.data);
  const errorStore = useSelector((state) => state.storeReducer.error);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selected, setSelected] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState();
  const [openDialogSendEmail, setOpenDialogSendEmail] = useState(false);
  const [openDialogEditProduct, setOpenDialogEditProduct] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState(null);

  // Hàm xử lý khi click vào nút hiển thị đánh giá
  const handleShowReviews = (productId) => {
    setSelectedProductId(productId);
  };


  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <button
          onClick={() => {
            console.log(record._id);
            navigate(`/products/${record._id}`);
            setOpenDialog(true);
          }}
        >
          <Typography>{text}</Typography>
        </button>
      ),
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "category_id",
      key: "category_id",
      render: (category) => <Typography>{category.name}</Typography>,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => <img src={text} className="w-20" />,
    },
    {
      title: "Giá",
      dataIndex: "minPrice",
      key: "price",
      render: (text) => (
        <Typography>{text ? text.toLocaleString("vi-VN") : ""}</Typography>
      ),
    },
    // {
    //   title: "Cửa hàng",
    //   dataIndex: "store_id",
    //   key: "store_id",
    //   render: (store) => <Typography>{store.name}</Typography>,
    // },
    {
      title: "Kích hoạt",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <button
          onClick={() => {
            confirm({
              title: "Bạn muốn thay đổi trạng thái của sản phẩm này?",
              onOk: () => {
                axios
                  .put(
                    `${
                      import.meta.env.VITE_BASE_URL
                    }products/change-active-product/${record._id}`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  )
                  .then((response) => {
                    dispatch(fetchProductRequest());
                    notification.success({
                      message: "Thành công",
                      description: "Chuyển trạng thái thành công!",
                      duration: 3,
                      type: "success",
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    notification.error({
                      error: "Thất Bại",
                      description: "Chuyển trạng thái thất bại!",
                      duration: 3,
                      type: "error",
                    });
                  });
              },
              okButtonProps: {
                style: {
                  backgroundColor: "#407cff",
                },
              },
            });
          }}
          className={`${
            active ? `bg-green-500  ` : `bg-red-500`
          } rounded-lg px-3 py-2 text-white`}
        >
          {active ? "Kích hoạt" : "Chưa kích hoạt"}
        </button>
      ),
    },
    // {
    //   title: "",
    //   key: "sendEmail",
    //   render: (record) => (
    //     <Button
    //       disabled={record.active ? true : false}
    //       onClick={() => {
    //         setOpenDialogSendEmail(true);
    //         setSelectedProduct(record);
    //       }}
    //     >
    //       Gửi mail
    //     </Button>
    //   ),
    // },
    {
      title: "",
      key: "update",
      render: (record) => {
        return (
          <Button
            onClick={() => {
              setSelectedProduct(record._id);
              dispatch(fetchProductDetailRequest(record._id));
              setOpenDialogEditProduct(true);
            }}
          >
            Sửa
          </Button>
        );
      },
    },

    {
      title: "Hiển thị đánh giá",
      key: "showReviews",
      render: (record) => (
        <Button onClick={() => handleShowReviews(record._id)}>
          Hiển thị đánh giá
        </Button>
      ),
    },
  
  ];
  
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  return (
    <div>
      <div className="flex justify-end my-3">
        {/* <Select
          showSearch
          style={{
            width: 300,
          }}
          allowClear
          size="middle"
          className=""
          placeholder="Search to select store"
          onChange={(value) => {
            console.log(value);
            setSelectedStore(value);
            dispatch(fetchProductRequest(selectedCategory, value));
          }}
          filterOption={(input, option) =>
            removeAccents(option?.label.toLowerCase() ?? "").includes(
              removeAccents(input.toLowerCase())
            )
          }
          options={
            dataStore
              ? dataStore?.data.map((category) => ({
                  label: category.name,
                  value: category._id,
                }))
              : null
          }
          loading={loadingCategory}
        /> */}
        {/* select category */}
        <Select
          showSearch
          style={{
            width: 300,
            marginLeft: 10,
          }}
          allowClear
          size="middle"
          placeholder="Search to select category"
          onChange={(value) => {
            console.log(value);
            setSelectedCategory(value);
            dispatch(fetchProductRequest(value, selectedStore));
          }}
          filterOption={(input, option) =>
            removeAccents(option?.label.toLowerCase() ?? "").includes(
              removeAccents(input.toLowerCase())
            )
          }
          options={
            dataCategory
              ? dataCategory?.data.map((category) => ({
                  label: category.name,
                  value: category._id,
                }))
              : null
          }
          loading={loadingCategory}
        />
        <Button
          type="primary"
          className=" bg-[#407cff] px-10  ml-3"
          onClick={() => {
            navigate("/products/create");
          }}
        >
          create new a product
        </Button>
      </div>
      <Table
        dataSource={dataProduct ? dataProduct.result : dataProduct}
        columns={columns}
        bordered
        rowKey={(record) => record._id}
      />
      <ShowReviewsModal
      productId={selectedProductId}
      onClose={() => setSelectedProductId(null)}
    />
      <DialogUpateProduct
        open={openDialogEditProduct}
        productId={selectedProduct}
        close={() => {
          setOpenDialogEditProduct(false);
        }}
      />
    </div>
  );
};

export default Products;

const DialogSendEmail = ({ open, onCancel, data }) => {
  const [formRef] = Form.useForm();
  const token = Cookies.get("token");
  const handleFinish = (value) => {
    const { content } = value;
    const dataSend = {
      productId: data._id,
      storeId: data.store_id._id,
      content,
    };
    axios
      .post(`${import.meta.env.VITE_BASE_URL}products/send-email`, dataSend, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        notification.success({
          message: "Thành công",
          description: "Gửi email thành công!",
          duration: 3,
          type: "success",
        });
        formRef.resetFields();
        onCancel();
      })
      .catch((error) => {
        notification.error({
          error: "Thất Bại",
          description: "Gửi email thất bại",
          duration: 3,
          type: "error",
        });
      });
  };
  const handleCancel = () => {
    formRef.resetFields();
    onCancel();
  };
  return (
    <Modal open={open} footer={null} onCancel={onCancel} closeIcon={false}>
      <Flex vertical justify="center">
        <Typography.Title level={3} className="self-center">
          Gửi email cảnh báo
        </Typography.Title>
        <Form
          form={formRef}
          layout="vertical"
          size="middle"
          onFinish={handleFinish}
        >
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Please input your content email!" },
            ]}
          >
            <Input.TextArea placeholder="nội dung email" rows={6} />
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
                htmlType="submit"
                type="primary"
                className="bg-[#407cff] px-10 w-[230px]"
              >
                Gửi
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Flex>
    </Modal>
  );
};

const DialogUpateProduct = ({ productId, open, close }) => {
  const [form] = Form.useForm();
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const dataCategory = useSelector((state) => state.categoryReducer.data);
  const data = useSelector((state) => state.productDetailReducer.data);
  const loading = useSelector((state) => state.productDetailReducer.loading);
  const [selectedCategory, setSelectedCategory] = useState();

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetailRequest(productId));
    }
    console.log(productId);
  }, [productId, dispatch]);

  const handleFinish = (values) => {
    console.log(values);
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}products/update-product/${productId}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        dispatch(fetchProductRequest());
        notification.success({
          message: "success",
          description: "sửa sản phẩm thành công",
          duration: 3,
          type: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        notification.error({
          error: "error",
          description: "sửa sản phẩm thất bại!",
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
        <Input size="middle" placeholder="Thông tin nhà sản xuất sản phẩm" />
      ),
    },
    {
      label: "Loại sản phẩm",
      name: "category_id",
      rules: [{ required: true, message: "Chọn loại sản phẩm" }],
      component: (
        <Select
          size="middle"
          labelInValue={data?.result.category_id.name}
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
        <Select size="middle" placeholder="Chọn trạng thái sản phẩm">
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
        <Input.TextArea rows={5} size="middle" placeholder="Mô tả sản phẩm" />
      ),
    },
    {
      label: "Thông tin màn hình",
      name: "screen",
      component: (
        <Input.TextArea
          rows={5}
          size="middle"
          placeholder="Thông tin màn hình sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin camera",
      name: "camera",
      component: (
        <Input.TextArea
          rows={5}
          size="middle"
          placeholder="Thông tin camera sản phẩm"
        />
      ),
    },
    {
      label: "Thông tin chipset",
      name: "chipset",
      component: (
        <Input size="middle" placeholder="Thông tin chipset sản phẩm" />
      ),
    },
    {
      label: "Thông tin cpu",
      name: "cpu",
      component: <Input size="middle" placeholder="Thông tin cpu sản phẩm" />,
    },
    {
      label: "Thông tin gpu",
      name: "gpu",
      component: <Input size="middle" placeholder="Thông tin gpu sản phẩm" />,
    },
    {
      label: "Thông tin rom",
      name: "rom",
      component: (
        <InputNumber size="middle" placeholder="Thông tin rom sản phẩm" />
      ),
    },
    {
      label: "Thông tin ram",
      name: "ram",
      component: (
        <InputNumber size="middle" placeholder="Thông tin ram sản phẩm" />
      ),
    },
    {
      label: "Hệ điều hành sản phẩm",
      name: "operatingSystem",
      rules: [{ required: true, message: "Chọn hệ điều hành sản phẩm" }],
      component: (
        <Select
          size="middle"
          placeholder="Chọn hệ điều hành sản phẩm"
          labelInValue={data?.result.operatingSystem}
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
      component: <Input size="middle" placeholder="Thông tin pin sản phẩm" />,
    },
    {
      label: "Thông tin cân nặng",
      name: "weight",
      component: (
        <InputNumber size="middle" placeholder="Thông tin cân nặng sản phẩm" />
      ),
    },
    {
      label: "Thông tin kết nối",
      name: "connection",
      component: (
        <Input.TextArea
          rows={2}
          size="middle"
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
          placeholder="Thông tin khác của sản phẩm"
        />
      ),
    },
  ];
  return (
    <Modal
      open={open}
      footer={null}
      closeIcon={null}
      width={"40%"}
      style={{
        minWidth: 600,
        maxHeight: "80vh",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
      onCancel={() => {
        close();
        form.resetFields();
      }}
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
          category_id: data ? data?.result.category_id._id : undefined,
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
            sửa sản phẩm
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};