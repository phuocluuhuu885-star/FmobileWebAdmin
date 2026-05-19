import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerRequest } from "../../redux/actions/Customer";
import {
  Avatar,
  Modal,
  Table,
  notification,
  Space,
  Typography,
  Select,
  Checkbox,
  Button,
  Input,
} from "antd";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const data = useSelector((state) => state.customerReducer.data);
  const loading = useSelector((state) => state.customerReducer.loading);
  const token = Cookies.get("token");
  const [tableRows, setTableRows] = useState([]);
  const [enriching, setEnriching] = useState(false);
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
      render: (active, record) => {
        let reasonInput = "";
        return (
          <button
            type="button"
            onClick={() => {
              Modal.confirm({
                title: `Bạn muốn ${active ? "hủy kích hoạt" : "kích hoạt"} tài khoản này?`,
                content: (
                  <div className="mt-3">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Lý do thực hiện (tùy chọn):</label>
                    <Input.TextArea
                      rows={2}
                      onChange={(e) => {
                        reasonInput = e.target.value;
                      }}
                      placeholder="Nhập lý do thực hiện..."
                    />
                  </div>
                ),
                okButtonProps: { style: { backgroundColor: "#407cff" } },
                onOk: () =>
                  axios
                    .put(
                      `${import.meta.env.VITE_BASE_URL}user/change-active-account/${record._id}`,
                      { reason: reasonInput.trim() },
                      { headers: { Authorization: `Bearer ${token}` } }
                    )
                    .then(() => {
                      dispatch(fetchCustomerRequest("customer", token));
                      notification.success({
                        message: "Thành công",
                        description: "Cập nhật trạng thái kích hoạt thành công!",
                        duration: 3,
                      });
                    })
                    .catch(() => {
                      notification.error({
                        message: "Thất bại",
                        description: "Cập nhật trạng thái kích hoạt thất bại!",
                        duration: 3,
                      });
                    }),
              });
            }}
            className={`${active ? "bg-green-500" : "bg-red-500"} rounded-lg px-3 py-2 text-white`}
          >
            {active ? "Kích hoạt" : "Hủy kích hoạt"}
          </button>
        );
      },
    },
    {
      title: "",
      key: "detail",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/customers/${record._id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

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
    </div>
  );
};

export default Customers;
