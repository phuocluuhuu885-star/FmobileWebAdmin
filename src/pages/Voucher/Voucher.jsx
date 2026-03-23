import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Typography,
  notification,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

/**
 * Backend (Express + Mongoose):
 * GET    {VITE_BASE_URL}voucher/get-list
 * POST   {VITE_BASE_URL}voucher/add
 * PUT    {VITE_BASE_URL}voucher/edit/:id
 * DELETE {VITE_BASE_URL}voucher/delete/:id
 *
 * Schema: code, title, discountType (1=% , 2=tiền), discountValue,
 * applicableProducts [ObjectId], minOrderValue, maxDiscountValue?, quantity,
 * expiryDate, status (1=active, 0=inactive)
 */
const voucherApi = (() => {
  const base = import.meta.env.VITE_BASE_URL || "";
  const root = (import.meta.env.VITE_VOUCHER_ROOT || "voucher").replace(
    /\/$/,
    ""
  );
  return {
    list: () => `${base}${root}/get-list`,
    create: () => `${base}${root}/add`,
    update: (id) => `${base}${root}/edit/${id}`,
    remove: (id) => `${base}${root}/delete/${id}`,
  };
})();

const authHeaders = () => ({
  Authorization: `Bearer ${Cookies.get("token") || ""}`,
});

/** Response: { code: 200, data: [...] } */
const normalizeList = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
};

/** Schema: 1 = %, 2 = tiền mặt */
const formatDiscountDisplay = (r) => {
  const type = r?.discountType;
  const val = r?.discountValue;
  if (type === 1 || type === "1")
    return `${val ?? 0}%`;
  if (type === 2 || type === "2")
    return `${Number(val ?? 0).toLocaleString("vi-VN")} đ`;
  if (val != null && val !== "") return String(val);
  return "—";
};

const applicableProductsLabel = (r) => {
  const raw = r?.applicableProducts;
  if (!raw || !Array.isArray(raw) || raw.length === 0)
    return "Tất cả SP";
  return `${raw.length} sản phẩm`;
};

const Voucher = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(voucherApi.list(), { headers: authHeaders() });
      setList(normalizeList(res));
    } catch (e) {
      console.error(e);
      notification.error({
        message: "Lỗi",
        description:
          e?.response?.data?.message?.toString() ||
          e?.message ||
          "Không tải được danh sách voucher",
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 56,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã",
      key: "code",
      ellipsis: true,
      render: (_, r) => r?.code ?? "—",
    },
    {
      title: "Tiêu đề",
      key: "title",
      ellipsis: true,
      render: (_, r) => r?.title ?? "—",
    },
    {
      title: "Giảm giá",
      key: "discount",
      width: 120,
      render: (_, r) => formatDiscountDisplay(r),
    },
    {
      title: "Đơn tối thiểu",
      key: "minOrderValue",
      width: 130,
      render: (_, r) => {
        const m = r?.minOrderValue;
        return m != null && m !== ""
          ? `${Number(m).toLocaleString("vi-VN")} đ`
          : "—";
      },
    },
    {
      title: "Giảm tối đa",
      key: "maxDiscountValue",
      width: 120,
      render: (_, r) => {
        const m = r?.maxDiscountValue;
        return m != null && m !== ""
          ? `${Number(m).toLocaleString("vi-VN")} đ`
          : "—";
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 90,
      render: (_, r) =>
        r?.quantity != null ? String(r.quantity) : "—",
    },
    {
      title: "Áp dụng SP",
      key: "applicableProducts",
      ellipsis: true,
      render: (_, r) => applicableProductsLabel(r),
    },
    {
      title: "Hết hạn",
      key: "expiryDate",
      width: 150,
      render: (_, r) => {
        const e = r?.expiryDate;
        if (!e) return "—";
        const d = dayjs(e);
        return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "—";
      },
    },
    {
      title: "Kích hoạt",
      key: "status",
      width: 96,
      render: (_, r) => (r?.status === 1 ? "Có" : "Không"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Flex gap={8} wrap="wrap">
          <Button
            type="link"
            onClick={() => {
              setEditData(record);
              setOpenDialog(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            type="link"
            onClick={() => {
              Modal.confirm({
                title: "Xóa voucher?",
                content: `Mã: ${record.code ?? record._id ?? record.id}`,
                okButtonProps: { style: { backgroundColor: "#407cff" } },
                onOk: async () => {
                  try {
                    const vid = record._id ?? record.id;
                    await axios.delete(voucherApi.remove(vid), {
                      headers: authHeaders(),
                    });
                    notification.success({ message: "Đã xóa", duration: 2 });
                    fetchList();
                  } catch (e) {
                    notification.error({
                      message: "Xóa thất bại",
                      description:
                        e?.response?.data?.message?.toString() ||
                        e?.message ||
                        "",
                    });
                  }
                },
              });
            }}
          >
            Xóa
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Quản lý Voucher
        </Typography.Title>
        <Button
          type="primary"
          className="bg-[#407cff]"
          onClick={() => {
            setEditData(null);
            setOpenDialog(true);
          }}
        >
          Thêm voucher
        </Button>
      </div>
      <Table
        dataSource={list}
        columns={columns}
        loading={loading}
        bordered
        rowKey={(r) => r._id ?? r.id ?? r.code}
        scroll={{ x: 1280 }}
      />
      <VoucherFormModal
        open={openDialog}
        data={editData}
        onCancel={() => {
          setOpenDialog(false);
          setEditData(null);
        }}
        onSuccess={() => {
          setOpenDialog(false);
          setEditData(null);
          fetchList();
        }}
      />
    </div>
  );
};

export default Voucher;

const VoucherFormModal = ({ open, data, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const recordId = data?._id ?? data?.id;
  const isEdit = Boolean(recordId);

  const dataProduct = useSelector((state) => state.productReducer.data);
  const productOptions = useMemo(() => {
    const raw = dataProduct?.result ?? dataProduct?.data ?? dataProduct;
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((p) => ({
      label: p?.name ?? p?._id,
      value: p?._id,
    }));
  }, [dataProduct]);

  useEffect(() => {
    if (!open) return;
    if (data) {
      const discountTypeUi =
        data.discountType === 1 || data.discountType === "1"
          ? "percent"
          : "fixed";

      const applicableIds = (data.applicableProducts || []).map((p) =>
        typeof p === "object" && p != null && p._id != null ? p._id : p
      );

      form.setFieldsValue({
        code: data.code,
        title: data.title,
        discountType: discountTypeUi,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue ?? 0,
        maxDiscountValue: data.maxDiscountValue,
        quantity: data.quantity ?? 0,
        expiryDate: data.expiryDate ? dayjs(data.expiryDate) : null,
        status: data.status === 1,
        applicableProducts: applicableIds.filter(Boolean),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        discountType: "percent",
        minOrderValue: 0,
        quantity: 0,
        status: true,
        applicableProducts: [],
      });
    }
  }, [open, data, form]);

  const handleFinish = async (values) => {
    const discountTypeNum = values.discountType === "percent" ? 1 : 2;

    const payload = {
      code: values.code?.trim(),
      title: values.title?.trim(),
      discountType: discountTypeNum,
      discountValue: values.discountValue,
      minOrderValue: values.minOrderValue ?? 0,
      quantity: values.quantity ?? 0,
      expiryDate: values.expiryDate
        ? values.expiryDate.toISOString()
        : undefined,
      status: values.status ? 1 : 0,
      applicableProducts: Array.isArray(values.applicableProducts)
        ? values.applicableProducts
        : [],
    };

    if (
      values.maxDiscountValue != null &&
      values.maxDiscountValue !== "" &&
      !Number.isNaN(Number(values.maxDiscountValue))
    ) {
      payload.maxDiscountValue = values.maxDiscountValue;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(voucherApi.update(recordId), payload, {
          headers: authHeaders(),
        });
        notification.success({ message: "Cập nhật thành công", duration: 2 });
      } else {
        await axios.post(voucherApi.create(), payload, {
          headers: authHeaders(),
        });
        notification.success({ message: "Tạo voucher thành công", duration: 2 });
      }
      form.resetFields();
      onSuccess();
    } catch (e) {
      notification.error({
        message: isEdit ? "Cập nhật thất bại" : "Tạo thất bại",
        description:
          e?.response?.data?.message?.toString() ||
          e?.message ||
          "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Sửa voucher" : "Thêm voucher"}
      footer={null}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnClose
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          discountType: "percent",
          minOrderValue: 0,
          quantity: 0,
          status: true,
          applicableProducts: [],
        }}
      >
        <Form.Item
          name="code"
          label="Mã voucher"
          rules={[{ required: true, message: "Nhập mã voucher" }]}
        >
          <Input placeholder="VD: SALE10" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Nhập tiêu đề voucher" }]}
        >
          <Input placeholder="Tên chương trình" />
        </Form.Item>
        <Form.Item
          name="discountType"
          label="Loại giảm"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "Giảm theo %", value: "percent" },
              { label: "Giảm số tiền cố định", value: "fixed" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="discountValue"
          label="Giá trị giảm (% hoặc VNĐ)"
          rules={[{ required: true, message: "Nhập giá trị" }]}
        >
          <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="minOrderValue" label="Giá trị đơn tối thiểu (VNĐ)">
          <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="maxDiscountValue"
          label="Giảm tối đa (VNĐ) — khi giảm %"
          tooltip="Tùy chọn: trần số tiền được giảm khi loại là %"
        >
          <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Số lượng"
          tooltip="Theo schema backend (mặc định 0)"
        >
          <InputNumber min={0} className="w-full" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="applicableProducts"
          label="Sản phẩm áp dụng"
          tooltip="Để trống = áp dụng tất cả sản phẩm"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn sản phẩm (không chọn = tất cả)"
            options={productOptions}
            optionFilterProp="label"
            showSearch
            className="w-full"
          />
        </Form.Item>
        <Form.Item
          name="expiryDate"
          label="Ngày hết hạn"
          rules={[{ required: true, message: "Chọn ngày hết hạn" }]}
        >
          <DatePicker
            showTime
            className="w-full"
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>
        <Form.Item name="status" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Flex justify="end" gap={8}>
          <Button
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="bg-[#407cff]"
            htmlType="submit"
            loading={loading}
          >
            {isEdit ? "Cập nhật" : "Tạo"}
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
};
