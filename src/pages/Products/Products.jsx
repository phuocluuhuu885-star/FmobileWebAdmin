import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Typography,
  notification,
} from "antd";
import ShowReviewsModal from "./danhgia";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductRequest } from "../../redux/actions/Product";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const { confirm } = Modal;

const normalizeImage = (v) => {
  if (!v) return "";
  if (Array.isArray(v)) {
    return v.length > 0 ? normalizeImage(v[0]) : "";
  }
  if (typeof v === "string" && v.startsWith("http")) {
    return v;
  }
  if (typeof v === "object" && v.url) {
    return v.url;
  }
  return "";
};

const findFirstImageUrl = (node, depth = 0) => {
  if (!node || depth > 4) return "";
  const direct = normalizeImage(node);
  if (direct) return direct;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findFirstImageUrl(item, depth + 1);
      if (found) return found;
    }
  } else if (typeof node === "object") {
    const priorityKeys = ["images", "image", "option", "options"];
    for (const key of priorityKeys) {
      if (node[key]) {
        const found = findFirstImageUrl(node[key], depth + 1);
        if (found) return found;
      }
    }
  }
  return "";
};

const Products = () => {
  const token = Cookies.get("token");
  const dataProduct = useSelector((state) => state.productReducer.data);
  const dataCategory = useSelector((state) => state.categoryReducer.data);
  const loadingCategory = useSelector((state) => state.categoryReducer.loading);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState();
  const [openDialogEditProduct, setOpenDialogEditProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleShowReviews = (productId) => {
    setSelectedProductId(productId);
  };

  useEffect(() => {
    dispatch(fetchProductRequest());
  }, [dispatch]);

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
        <button onClick={() => navigate(`/products/${record._id}`)}>
          <Typography.Text strong>{text}</Typography.Text>
        </button>
      ),
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "category_id",
      key: "category_id",
      render: (category) => <Typography>{category?.name || "N/A"}</Typography>,
    },
    {
      title: "Ảnh",
      dataIndex: "images", 
      key: "image",
      render: (text, record) => (
        <ProductImageCell
          productId={record?._id}
          token={token}
          inlineImage={
            normalizeImage(record?.images) || 
            normalizeImage(record?.image) ||  
            normalizeImage(record?.options?.[0]?.image) ||
            findFirstImageUrl(record)
          }
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "minPrice",
      key: "price",
      render: (text) => (
        <Typography>{text ? text.toLocaleString("vi-VN") + " đ" : "Liên hệ"}</Typography>
      ),
    },
    {
      title: "Kích hoạt",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <button
          onClick={() => {
            confirm({
              title: "Thay đổi trạng thái sản phẩm?",
              onOk: () => {
                axios
                  .put(
                    `${import.meta.env.VITE_BASE_URL}products/change-active-product/${record._id}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                  .then(() => {
                    dispatch(fetchProductRequest());
                    notification.success({ message: "Thành công" });
                  })
                  .catch(() => notification.error({ message: "Thất bại" }));
              },
            });
          }}
          className={`${active ? `bg-green-500` : `bg-red-500`} rounded-lg px-3 py-2 text-white`}
        >
          {active ? "Kích hoạt" : "Chưa kích hoạt"}
        </button>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <Flex gap={8}>
          <Button onClick={() => navigate(`/products/${record._id}`)}>Xem</Button>
          <Button
            onClick={() => {
              setSelectedProduct(record._id);
              setOpenDialogEditProduct(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={() => {
              confirm({
                title: "Xóa sản phẩm?",
                onOk: () => {
                  axios
                    .delete(`${import.meta.env.VITE_BASE_URL}products/delete-product/${record._id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    .then(() => {
                      dispatch(fetchProductRequest());
                      notification.success({ message: "Đã xóa" });
                    });
                },
              });
            }}
          >
            Xóa
          </Button>
        </Flex>
      ),
    },
    {
      title: "Đánh giá",
      key: "showReviews",
      render: (record) => (
        <Button onClick={() => handleShowReviews(record._id)}>Xem đánh giá</Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end my-3 gap-3">
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="Lọc theo loại"
          allowClear
          onChange={(v) => {
            setSelectedCategory(v);
            dispatch(fetchProductRequest(v, selectedStore));
          }}
          options={dataCategory?.data?.map((c) => ({ label: c.name, value: c._id }))}
        />
        <Button
          type="primary"
          className="bg-[#407cff]"
          onClick={() => navigate("/products/create")}
        >
          Tạo sản phẩm mới
        </Button>
      </div>

      <Table
        dataSource={dataProduct?.result || []}
        columns={columns}
        bordered
        rowKey="_id"
      />

      <ShowReviewsModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />

      <DialogUpateProduct
        open={openDialogEditProduct}
        productId={selectedProduct}
        close={() => setOpenDialogEditProduct(false)}
      />
    </div>
  );
};

const ProductImageCell = ({ productId, token, inlineImage }) => {
  const [src, setSrc] = useState(inlineImage || "");

  useEffect(() => {
    if (inlineImage) {
      setSrc(inlineImage);
    } else if (productId) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}products/detail-product/${productId}`)
        .then((res) => {
          const detail = res?.data?.result;
          const img = normalizeImage(detail?.images) || normalizeImage(detail?.image) || findFirstImageUrl(detail);
          if (img) setSrc(img);
        })
        .catch(() => {});
    }
  }, [inlineImage, productId]);

  return (
    <img
      src={src || "https://placehold.co/80x80?text=No+Image"}
      className="w-20 h-20 object-contain rounded border"
      alt="product"
      onError={(e) => {
        e.currentTarget.src = "https://placehold.co/80x80?text=No+Image";
      }}
    />
  );
};

const DialogUpateProduct = ({ productId, open, close }) => {
  const [form] = Form.useForm();
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const dataCategory = useSelector((state) => state.categoryReducer.data);

  useEffect(() => {
    if (open && productId) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}products/detail-product/${productId}`)
        .then((res) => {
          const d = res.data.result;
          form.setFieldsValue({
            name: d.name,
            manufacturer: d.manufacturer,
            category_id: d.category_id?._id || d.category_id,
            status: d.status,
            screen: d.screen,
            camera: d.camera,
            chipset: d.chipset,
            battery: d.battery,
            connection: d.connection,
            operatingSystem: d.operatingSystem,
          });
        });
    }
  }, [open, productId, form]);

  const onFinish = (values) => {
    axios
      .put(`${import.meta.env.VITE_BASE_URL}products/update-product/${productId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        dispatch(fetchProductRequest());
        notification.success({ message: "Cập nhật thành công" });
        close();
      });
  };

  return (
    <Modal title="Sửa sản phẩm" open={open} onCancel={close} onOk={() => form.submit()} width={600}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category_id" label="Loại sản phẩm">
          <Select options={dataCategory?.data?.map((c) => ({ label: c.name, value: c._id }))} />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái"><Input /></Form.Item>
        <Form.Item name="screen" label="Công nghệ màn hình"><Input /></Form.Item>
        <Form.Item name="camera" label="Camera"><Input /></Form.Item>
        <Form.Item name="chipset" label="Chip (Vi xử lý)"><Input /></Form.Item>
        <Form.Item name="battery" label="Dung lượng Pin"><Input /></Form.Item>
        <Form.Item name="connection" label="SIM &amp; Kết nối"><Input /></Form.Item>

      </Form>
    </Modal>
  );
};

export default Products;