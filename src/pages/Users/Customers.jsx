import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerRequest } from "../../redux/actions/Customer";
import {
  Avatar,
  Modal,
  Table,
  notification,
  Drawer,
  Space,
  Typography,
  Select,
  Checkbox,
  Button,
} from "antd";
import Cookies from "js-cookie";
import axios from "axios";
import {
  mergeTrustFromDetail,
  needsTrustEnrichment,
  normalizeIsBlacklisted,
  normalizeTrustScore,
  pickUserFromApiResponse,
} from "../../utils/userTrust";
import { getTrustBlacklistThreshold, TRUST_SERVER_DEFAULT_THRESHOLD } from "../../config/trust";
import {
  BlacklistStatusBadge,
  TRUST_RULES_SHORT_VI,
  TrustScoreAndBlacklist,
} from "../../components/TrustCustomerBadges";

const ENRICH_BATCH = 6;

async function enrichRowsWithDetailProfile(rows, token) {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const byId = new Map(rows.map((r) => [r._id, { ...r }]));
  const todo = rows.filter((r) => needsTrustEnrichment(r));
  for (let i = 0; i < todo.length; i += ENRICH_BATCH) {
    const chunk = todo.slice(i, i + ENRICH_BATCH);
    await Promise.all(
      chunk.map(async (r) => {
        try {
          const { data } = await axios.get(`${baseUrl}user/detail-profile/${r._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const merged = mergeTrustFromDetail(byId.get(r._id) || r, data);
          byId.set(r._id, merged);
        } catch {
          // giữ dòng gốc nếu lỗi
        }
      })
    );
  }
  return rows.map((r) => byId.get(r._id) || r);
}

const Customers = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.customerReducer.data);
  const loading = useSelector((state) => state.customerReducer.loading);
  const token = Cookies.get("token");
  const [tableRows, setTableRows] = useState([]);
  const [enriching, setEnriching] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerUser, setDrawerUser] = useState(null);
  const [filterBlacklist, setFilterBlacklist] = useState("all");
  const [filterLowScore, setFilterLowScore] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const threshold = getTrustBlacklistThreshold();
  const envThresholdUnset =
    import.meta.env.VITE_TRUST_BLACKLIST_THRESHOLD === undefined ||
    import.meta.env.VITE_TRUST_BLACKLIST_THRESHOLD === "";

  useEffect(() => {
    let cancelled = false;
    const rawList = Array.isArray(data?.result) ? data.result : [];
    if (!rawList.length) {
      setTableRows([]);
      return;
    }
    const anyMissing = rawList.some((r) => needsTrustEnrichment(r));
    if (!anyMissing) {
      setTableRows(rawList);
      return;
    }
    if (!token) {
      setTableRows(rawList);
      return;
    }
    setEnriching(true);
    enrichRowsWithDetailProfile(rawList, token)
      .then((merged) => {
        if (!cancelled) setTableRows(merged);
      })
      .finally(() => {
        if (!cancelled) setEnriching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data, token]);

  const openDrawer = useCallback(
    async (record) => {
      setDrawerOpen(true);
      setDrawerLoading(true);
      setDrawerUser(null);
      if (!token) {
        setDrawerLoading(false);
        return;
      }
      try {
        const { data: res } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}user/detail-profile/${record._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const u = pickUserFromApiResponse(res);
        setDrawerUser(u);
      } catch {
        notification.error({
          message: "Lỗi",
          description: "Không tải được chi tiết khách hàng.",
          duration: 3,
        });
        setDrawerUser(record);
      } finally {
        setDrawerLoading(false);
      }
    },
    [token]
  );

  const handleToggleActive = (user) => {
    Modal.confirm({
      title: `Bạn muốn ${user.is_active ? "khóa" : "mở khóa"} tài khoản này?`,
      okButtonProps: { style: { backgroundColor: "#407cff" } },
      onOk: () =>
        axios
          .put(
            `${import.meta.env.VITE_BASE_URL}user/change-active-account/${user._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            dispatch(fetchCustomerRequest("customer", token));
            notification.success({
              message: "Thành công",
              description: "Cập nhật trạng thái thành công!",
              duration: 3,
            });
            openDrawer(user);
          })
          .catch(() => {
            notification.error({
              message: "Thất bại",
              description: "Cập nhật trạng thái thất bại!",
              duration: 3,
            });
          }),
    });
  };

  const handleToggleRestrictBuy = (user) => {
    Modal.confirm({
      title: `Bạn muốn ${user.restrict_buy ? "bỏ hạn chế" : "hạn chế"} mua hàng đối với tài khoản này?`,
      okButtonProps: { style: { backgroundColor: "#407cff" } },
      onOk: () =>
        axios
          .put(
            `${import.meta.env.VITE_BASE_URL}user/change-restrict-buy/${user._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            dispatch(fetchCustomerRequest("customer", token));
            notification.success({
              message: "Thành công",
              description: "Cập nhật giới hạn mua hàng thành công!",
              duration: 3,
            });
            openDrawer(user);
          })
          .catch(() => {
            notification.error({
              message: "Thất bại",
              description: "Cập nhật giới hạn thất bại!",
              duration: 3,
            });
          }),
    });
  };

  const handleToggleRestrictCod = (user) => {
    Modal.confirm({
      title: `Bạn muốn ${user.is_blacklisted ? "cho phép COD" : "cấm COD (chỉ cho chuyển khoản)"} đối với tài khoản này?`,
      okButtonProps: { style: { backgroundColor: "#407cff" } },
      onOk: () =>
        axios
          .put(
            `${import.meta.env.VITE_BASE_URL}user/change-restrict-cod/${user._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            dispatch(fetchCustomerRequest("customer", token));
            notification.success({
              message: "Thành công",
              description: "Cập nhật giới hạn COD thành công!",
              duration: 3,
            });
            openDrawer(user);
          })
          .catch(() => {
            notification.error({
              message: "Thất bại",
              description: "Cập nhật giới hạn thất bại!",
              duration: 3,
            });
          }),
    });
  };

  const filteredRows = useMemo(() => {
    return tableRows.filter((r) => {
      const score = normalizeTrustScore(r.trust_score, 150);
      const bl = normalizeIsBlacklisted(r.is_blacklisted);
      if (filterBlacklist === "yes" && !bl) return false;
      if (filterBlacklist === "no" && bl) return false;
      if (filterLowScore && score >= threshold) return false;
      return true;
    });
  }, [tableRows, filterBlacklist, filterLowScore, threshold]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 56,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Điểm tin cậy",
      dataIndex: "trust_score",
      key: "trust_score",
      sorter: (a, b) =>
        normalizeTrustScore(a.trust_score, 0) - normalizeTrustScore(b.trust_score, 0),
      render: (_, record) => (
        <Typography.Text strong>
          {typeof record.trust_score === "number" ? record.trust_score : "—"}
        </Typography.Text>
      ),
    },
    {
      title: "Blacklist / COD",
      dataIndex: "is_blacklisted",
      key: "is_blacklisted",
      render: (_, record) => (
        <BlacklistStatusBadge
          isBlacklisted={normalizeIsBlacklisted(record.is_blacklisted)}
          trustScore={record.trust_score}
        />
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      render: (text) => (
        <Avatar
          src={
            text ||
            "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
          }
        />
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Kích hoạt",
      dataIndex: "is_active",
      key: "active",
      render: (active, record) => (
        <button
          type="button"
          onClick={() => {
            Modal.confirm({
              title: "Bạn muốn thay đổi trạng thái của tài khoản này?",
              okButtonProps: { style: { backgroundColor: "#407cff" } },
              onOk: () =>
                axios
                  .put(
                    `${import.meta.env.VITE_BASE_URL}user/change-active-account/${record._id}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                  .then(() => {
                    dispatch(fetchCustomerRequest("customer", token));
                    notification.success({
                      message: "Thành công",
                      description: "Chuyển trạng thái thành công!",
                      duration: 3,
                    });
                  })
                  .catch(() => {
                    notification.error({
                      message: "Thất bại",
                      description: "Chuyển trạng thái thất bại!",
                      duration: 3,
                    });
                  }),
            });
          }}
          className={`${active ? "bg-green-500" : "bg-red-500"} rounded-lg px-3 py-2 text-white`}
        >
          {active ? "Kích hoạt" : "Chưa kích hoạt"}
        </button>
      ),
    },
    {
      title: "",
      key: "detail",
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => openDrawer(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const drawerTrustScore = normalizeTrustScore(drawerUser?.trust_score, 150);
  const drawerBl = normalizeIsBlacklisted(drawerUser?.is_blacklisted);

  return (
    <div className="p-2">
      {/* {envThresholdUnset && (
        <Typography.Paragraph type="secondary" className="text-sm mb-3">
          Ngưỡng blacklist trên UI đang dùng mặc định {TRUST_SERVER_DEFAULT_THRESHOLD} (trùng mặc định
          server TRUST_BLACKLIST_THRESHOLD). Đặt <Typography.Text code>VITE_TRUST_BLACKLIST_THRESHOLD</Typography.Text>{" "}
          trong file env build admin để khớp chính xác với server nếu bạn đổi ngưỡng.
        </Typography.Paragraph>
      )} */}
      <Space wrap className="mb-3">
        <span>Lọc blacklist:</span>
        <Select
          style={{ width: 160 }}
          value={filterBlacklist}
          onChange={setFilterBlacklist}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "yes", label: "Chỉ blacklist" },
            { value: "no", label: "Không blacklist" },
          ]}
        />
        <Checkbox checked={filterLowScore} onChange={(e) => setFilterLowScore(e.target.checked)}>
          Điểm thấp (&lt; {threshold})
        </Checkbox>
      </Space>

      <Table
        dataSource={filteredRows}
        columns={columns}
        loading={loading || enriching}
        bordered
        rowKey={(record) => record._id}
        pagination={{
          ...pagination,
          total: filteredRows.length,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />

      <Drawer
        title="Chi tiết khách hàng"
        width={420}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerUser(null);
        }}
        destroyOnClose
      >
        {drawerLoading ? (
          <Typography.Text>Đang tải…</Typography.Text>
        ) : drawerUser ? (
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Typography.Text type="secondary">Email</Typography.Text>
              <div>{drawerUser.email || "—"}</div>
            </div>
            <div>
              <Typography.Text type="secondary">Tên hiển thị</Typography.Text>
              <div>{drawerUser.username || drawerUser.full_name || "—"}</div>
            </div>
            <div>
              <Typography.Title level={5} className="!mb-2">
                Tin cậy & COD
              </Typography.Title>
              <TrustScoreAndBlacklist trustScore={drawerTrustScore} isBlacklisted={drawerBl} />
            </div>

            {drawerUser.orderStats && (
              <div>
                <Typography.Title level={5} className="!mb-2">Thống kê đơn hàng</Typography.Title>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f5f5f5", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
                  <div>Tổng số đơn: <span style={{ fontWeight: "bold" }}>{drawerUser.orderStats.total}</span></div>
                  <div>Thành công: <span style={{ fontWeight: "bold", color: "#52c41a" }}>{drawerUser.orderStats.success}</span></div>
                  <div>Đã hủy: <span style={{ fontWeight: "bold", color: "#f5222d" }}>{drawerUser.orderStats.cancelled}</span></div>
                  <div>Đang giao: <span style={{ fontWeight: "bold", color: "#1890ff" }}>{drawerUser.orderStats.shipping}</span></div>
                  <div>Chờ xác nhận: <span style={{ fontWeight: "bold", color: "#fa8c16" }}>{drawerUser.orderStats.pendingConfirmation}</span></div>
                  <div>Chờ thanh toán: <span style={{ fontWeight: "bold", color: "#faad14" }}>{drawerUser.orderStats.pendingPayment}</span></div>
                </div>
              </div>
            )}

            <div>
              <Typography.Title level={5} className="!mb-2">Kiểm soát của Admin</Typography.Title>
              <Space direction="vertical" className="w-full" style={{ width: "100%" }}>
                <Button
                  danger={drawerUser.is_active}
                  type={drawerUser.is_active ? "primary" : "default"}
                  onClick={() => handleToggleActive(drawerUser)}
                  style={{ width: "100%" }}
                >
                  {drawerUser.is_active ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                </Button>
                
                <Button
                  danger={!drawerUser.restrict_buy}
                  type={drawerUser.restrict_buy ? "default" : "primary"}
                  onClick={() => handleToggleRestrictBuy(drawerUser)}
                  style={{ width: "100%" }}
                >
                  {drawerUser.restrict_buy ? "Bỏ cấm mua hàng" : "Hạn chế mua hàng"}
                </Button>

                <Button
                  danger={!drawerUser.is_blacklisted}
                  type={drawerUser.is_blacklisted ? "default" : "primary"}
                  onClick={() => handleToggleRestrictCod(drawerUser)}
                  style={{ width: "100%" }}
                >
                  {drawerUser.is_blacklisted ? "Cho phép thanh toán COD" : "Chỉ cho thanh toán chuyển khoản"}
                </Button>
              </Space>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
              {TRUST_RULES_SHORT_VI}
            </div>
            {drawerBl && (
              <Typography.Paragraph type="warning" className="!mb-0">
                Khách đang bị cấm COD (hoặc blacklist): ứng dụng/mobile sẽ chặn COD — khách cần thanh toán trước (ví dụ ZaloPay).
              </Typography.Paragraph>
            )}
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
};

export default Customers;
