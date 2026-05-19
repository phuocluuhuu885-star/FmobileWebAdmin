import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Space,
  Button,
  Table,
  Tag,
  Modal,
  notification,
  Row,
  Col,
  Avatar,
  Skeleton,
  Input,
} from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import {
  normalizeTrustScore,
  normalizeIsBlacklisted,
  pickUserFromApiResponse,
} from "../../utils/userTrust";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: "",
    description: "",
    actionType: "",
    targetValue: null,
  });
  const [reason, setReason] = useState("");

  const fetchUserData = async () => {
    if (!token) return;
    setLoadingUser(true);
    try {
      const { data: res } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}user/detail-profile/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const u = pickUserFromApiResponse(res);
      setUser(u);
    } catch (err) {
      notification.error({
        message: "Lỗi tải thông tin",
        description: "Không tải được thông tin chi tiết khách hàng.",
        duration: 3,
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const { data: res } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}order/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allOrders = res?.result || [];
      // Lọc các đơn hàng của user này
      const userOrders = allOrders.filter((order) => {
        const orderUserId =
          typeof order.user_id === "object"
            ? order.user_id?._id
            : order.user_id;
        return orderUserId === id;
      });
      setOrders(userOrders);
    } catch (err) {
      notification.error({
        message: "Lỗi tải đơn hàng",
        description: "Không tải được danh sách đơn hàng của khách hàng.",
        duration: 3,
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, [id, token]);

  const triggerToggleActive = (userItem) => {
    setConfirmModal({
      visible: true,
      title: `Bạn muốn ${userItem.is_active ? "hủy kích hoạt" : "kích hoạt"} tài khoản này?`,
      description: `Hành động này sẽ thay đổi trạng thái kích hoạt của tài khoản ${userItem.username || userItem.email}.`,
      actionType: "active",
      targetValue: !userItem.is_active,
    });
    setReason("");
  };

  const triggerToggleRestrictBuy = (userItem) => {
    setConfirmModal({
      visible: true,
      title: `Bạn muốn ${userItem.restrict_buy ? "bỏ hạn chế" : "hạn chế"} mua hàng đối với tài khoản này?`,
      description: `Hành động này sẽ thay đổi quyền mua hàng của tài khoản ${userItem.username || userItem.email}.`,
      actionType: "restrictBuy",
      targetValue: !userItem.restrict_buy,
    });
    setReason("");
  };

  const triggerToggleRestrictCod = (userItem) => {
    setConfirmModal({
      visible: true,
      title: `Bạn muốn ${userItem.is_blacklisted ? "cho phép COD" : "cấm COD (chỉ cho chuyển khoản)"} đối với tài khoản này?`,
      description: `Hành động này sẽ thay đổi cấu hình thanh toán COD đối với tài khoản ${userItem.username || userItem.email}.`,
      actionType: "restrictCod",
      targetValue: !userItem.is_blacklisted,
    });
    setReason("");
  };

  const handleConfirmAction = async () => {
    const { actionType } = confirmModal;
    let url = "";
    let successMessage = "";
    let errorMessage = "";

    if (actionType === "active") {
      url = `${import.meta.env.VITE_BASE_URL}user/change-active-account/${id}`;
      successMessage = "Cập nhật trạng thái kích hoạt thành công!";
      errorMessage = "Cập nhật trạng thái kích hoạt thất bại!";
    } else if (actionType === "restrictBuy") {
      url = `${import.meta.env.VITE_BASE_URL}user/change-restrict-buy/${id}`;
      successMessage = "Cập nhật giới hạn mua hàng thành công!";
      errorMessage = "Cập nhật giới hạn thất bại!";
    } else if (actionType === "restrictCod") {
      url = `${import.meta.env.VITE_BASE_URL}user/change-restrict-cod/${id}`;
      successMessage = "Cập nhật giới hạn COD thành công!";
      errorMessage = "Cập nhật giới hạn COD thất bại!";
    }

    try {
      const { data: res } = await axios.put(
        url,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({
        message: "Thành công",
        description: successMessage,
        duration: 3,
      });
      fetchUserData();
      setConfirmModal({
        visible: false,
        title: "",
        description: "",
        actionType: "",
        targetValue: null,
      });
    } catch (err) {
      notification.error({
        message: "Thất bại",
        description: errorMessage,
        duration: 3,
      });
    }
  };

  // Tính toán vòng tròn điểm uy tín
  const score = normalizeTrustScore(user?.trust_score, 150);
  const isBl = normalizeIsBlacklisted(user?.is_blacklisted);

  const getTrustColor = (s) => {
    if (s > 100) return "#10b981"; // emerald-500 (xanh)
    if (s >= 50) return "#eab308"; // yellow-500 (vàng)
    return "#ef4444"; // red-500 (đỏ)
  };

  const getTrustStatusLabel = (s) => {
    if (s > 100) return "Tốt";
    if (s >= 50) return "Trung bình";
    return "Yếu";
  };

  const circleColor = getTrustColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max((score / 150) * 100, 0), 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Lọc danh sách đơn hàng
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    if (activeFilter === "pendingConfirmation") {
      return orders.filter((o) => o.status === "Chờ xác nhận");
    }
    if (activeFilter === "pendingPayment") {
      return orders.filter((o) => o.status === "Chờ thanh toán");
    }
    if (activeFilter === "shipping") {
      return orders.filter((o) =>
        ["Chờ giao hàng", "Đang giao hàng"].includes(o.status)
      );
    }
    if (activeFilter === "success") {
      return orders.filter((o) => o.status === "Đã giao hàng");
    }
    if (activeFilter === "cancelled") {
      return orders.filter((o) => o.status === "Đã hủy");
    }
    return orders;
  }, [orders, activeFilter]);

  // Đếm số lượng đơn cho từng trạng thái
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pendingConfirmation: orders.filter((o) => o.status === "Chờ xác nhận").length,
      pendingPayment: orders.filter((o) => o.status === "Chờ thanh toán").length,
      shipping: orders.filter((o) =>
        ["Chờ giao hàng", "Đang giao hàng"].includes(o.status)
      ).length,
      success: orders.filter((o) => o.status === "Đã giao hàng").length,
      cancelled: orders.filter((o) => o.status === "Đã hủy").length,
    };
  }, [orders]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "_id",
      key: "id",
      className: "font-mono text-xs",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "Đã giao hàng") color = "green";
        if (status === "Đã hủy") color = "red";
        if (status === "Chờ xác nhận") color = "orange";
        if (status === "Chờ thanh toán") color = "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "totalPrice",
      render: (price) => (
        <span className="font-semibold text-gray-800">
          {price ? price.toLocaleString("vi-VN") : "0"} đ
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate("/invoice/detail", { state: { invoice: record } })}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loadingUser) {
    return (
      <div className="p-10 bg-slate-50 min-h-screen">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <Layout className="bg-slate-50 min-h-screen">
      <Header className="flex flex-row bg-white shadow-sm justify-between items-center fixed w-full top-0 z-10 px-6 border-b border-gray-100">
        <div className="flex flex-row items-center">
          <ArrowLeftIcon
            className="w-6 h-6 mr-4 text-gray-600 hover:text-blue-500 cursor-pointer transition-colors"
            onClick={() => navigate(-1)}
          />
          <Title level={4} className="!mb-0 text-gray-800">
            Chi tiết khách hàng: {user?.username || user?.full_name || "N/A"}
          </Title>
        </div>
        <div>
          {isBl ? (
            <Tag color="red" className="font-semibold text-sm px-3 py-1">
              Blacklist / COD Restricted
            </Tag>
          ) : (
            <Tag color="green" className="font-semibold text-sm px-3 py-1">
              Hoạt động ổn định
            </Tag>
          )}
        </div>
      </Header>

      <Content className="mt-20 p-6 max-w-7xl mx-auto w-full">
        <Row gutter={[24, 24]}>
          {/* Cột trái: Thông tin khách hàng & Vòng tròn uy tín */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <Row gutter={24} align="middle">
                <Col xs={24} sm={6} className="text-center sm:text-left mb-4 sm:mb-0">
                  <Avatar
                    size={110}
                    src={
                      user?.avatar ||
                      "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
                    }
                    className="border-2 border-blue-100 shadow-sm"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="small" className="w-full">
                    <div>
                      <Text className="text-xs text-gray-400 block">Email đăng ký</Text>
                      <Text className="text-base font-medium text-gray-800">
                        {user?.email || "—"}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-400 block">Tên hiển thị</Text>
                      <Text className="text-base font-medium text-gray-800">
                        {user?.username || user?.full_name || "—"}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-400 block">Vai trò hệ thống</Text>
                      <Tag color="blue" className="font-semibold">
                        {user?.role || "Khách hàng"}
                      </Tag>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-400 block">Trạng thái kích hoạt</Text>
                      <Tag color={user?.is_active ? "success" : "error"} className="font-medium">
                        {user?.is_active ? "Kích hoạt" : "Hủy kích hoạt"}
                      </Tag>
                    </div>
                  </Space>
                </Col>
                
                {/* Vòng tròn điểm uy tín */}
                <Col xs={24} sm={6} className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0">
                  <div className="relative flex items-center justify-center w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke="#f3f4f6"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke={circleColor}
                        strokeWidth="7"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-in-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-gray-800">{score}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {getTrustStatusLabel(score)}
                      </span>
                    </div>
                  </div>
                  <Text className="text-xs text-gray-500 mt-2 font-medium">
                    Điểm uy tín hiện tại
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Cột phải: Kiểm soát của Admin */}
          <Col xs={24} lg={8}>
            <Card title="Công cụ kiểm soát Admin" className="shadow-sm border-gray-100 rounded-2xl h-full">
              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  danger={user?.is_active}
                  type={user?.is_active ? "primary" : "default"}
                  onClick={() => triggerToggleActive(user)}
                  style={{ width: "100%" }}
                  className="rounded-xl h-10 font-semibold"
                >
                  {user?.is_active ? "Hủy kích hoạt tài khoản" : "Kích hoạt tài khoản"}
                </Button>

                <Button
                  danger={!user?.restrict_buy}
                  type={user?.restrict_buy ? "default" : "primary"}
                  onClick={() => triggerToggleRestrictBuy(user)}
                  style={{ width: "100%" }}
                  className="rounded-xl h-10 font-semibold"
                >
                  {user?.restrict_buy ? "Bỏ hạn chế mua hàng" : "Hạn chế mua hàng"}
                </Button>

                <Button
                  danger={!user?.is_blacklisted}
                  type={user?.is_blacklisted ? "default" : "primary"}
                  onClick={() => triggerToggleRestrictCod(user)}
                  style={{ width: "100%" }}
                  className="rounded-xl h-10 font-semibold"
                >
                  {user?.is_blacklisted ? "Cho phép thanh toán COD" : "Chỉ cho thanh toán chuyển khoản"}
                </Button>
              </Space>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <Title level={5} className="!text-gray-700 mb-3">Lịch sử hoạt động Admin</Title>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {!user?.admin_logs || user.admin_logs.length === 0 ? (
                    <Text type="secondary" className="text-sm italic">Chưa có lịch sử hoạt động</Text>
                  ) : (
                    [...user.admin_logs].reverse().map((log, index) => (
                      <div key={log._id || index} className="text-xs bg-gray-50 border border-gray-200/60 rounded-xl p-3 shadow-2xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-700">{log.updated_by || "Admin"}</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {moment(log.to_time).format("HH:mm DD/MM/YYYY")}
                          </span>
                        </div>
                        <div className="mb-1 font-semibold text-blue-600">
                          Hành động: <Tag color="blue" className="m-0 py-0 px-1.5 text-[10px] font-bold">{log.action}</Tag>
                        </div>
                        <div className="text-gray-600 font-normal leading-relaxed break-words">
                          <span className="font-medium text-gray-500">Lý do:</span> {log.reason || "Không ghi chú"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Khối thống kê đơn hàng (Clickable) */}
        <div className="mt-8">
          <Title level={5} className="text-gray-700 mb-4">
            Thống kê & Bộ lọc đơn hàng
          </Title>
          <Row gutter={[16, 16]}>
            {[
              { key: "all", label: "Tất cả đơn", color: "border-blue-500 text-blue-600 bg-blue-50/50" },
              { key: "pendingConfirmation", label: "Chờ xác nhận", color: "border-orange-500 text-orange-600 bg-orange-50/50" },
              { key: "pendingPayment", label: "Chờ thanh toán", color: "border-yellow-500 text-yellow-600 bg-yellow-50/50" },
              { key: "shipping", label: "Đang giao/chờ giao", color: "border-cyan-500 text-cyan-600 bg-cyan-50/50" },
              { key: "success", label: "Thành công", color: "border-emerald-500 text-emerald-600 bg-emerald-50/50" },
              { key: "cancelled", label: "Đã hủy", color: "border-rose-500 text-rose-600 bg-rose-50/50" },
            ].map((item) => {
              const isActive = activeFilter === item.key;
              return (
                <Col xs={12} sm={8} md={4} key={item.key}>
                  <div
                    onClick={() => setActiveFilter(item.key)}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 text-center ${
                      isActive
                        ? `${item.color} shadow-sm font-semibold scale-105`
                        : "border-gray-200 hover:border-gray-400 bg-white text-gray-500"
                    }`}
                  >
                    <div className="text-xl font-bold mb-1">
                      {counts[item.key]}
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Bảng danh sách đơn hàng đã lọc */}
        <Card className="mt-8 shadow-sm border-gray-100 rounded-2xl overflow-hidden">
          <div className="mb-4 flex justify-between items-center">
            <Title level={5} className="!mb-0 text-gray-700">
              Danh sách đơn hàng (
              {activeFilter === "all"
                ? "Tất cả"
                : activeFilter === "pendingConfirmation"
                ? "Chờ xác nhận"
                : activeFilter === "pendingPayment"
                ? "Chờ thanh toán"
                : activeFilter === "shipping"
                ? "Đang giao/chờ giao"
                : activeFilter === "success"
                ? "Thành công"
                : "Đã hủy"}
              )
            </Title>
          </div>
          <Table
            dataSource={filteredOrders}
            columns={columns}
            loading={loadingOrders}
            rowKey={(record) => record._id}
            bordered
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
          />
        </Card>
      </Content>

      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={handleConfirmAction}
        onCancel={() =>
          setConfirmModal({
            visible: false,
            title: "",
            description: "",
            actionType: "",
            targetValue: null,
          })
        }
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: "#407cff" } }}
      >
        <p className="text-gray-600 mb-4">{confirmModal.description}</p>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Lý do thực hiện (tùy chọn):</label>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hoặc ghi chú..."
            className="rounded-xl border-gray-200 focus:border-blue-500"
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default CustomerDetail;
