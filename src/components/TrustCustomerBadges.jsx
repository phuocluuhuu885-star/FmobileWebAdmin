import React from "react";
import { Space, Tag, Tooltip, Typography } from "antd";
import { getTrustBlacklistThreshold, TRUST_SERVER_DEFAULT_THRESHOLD } from "../config/trust";

const COD_BLOCK_MSG =
  "Khách đang bị hạn chế: app/mobile sẽ không cho đặt COD; bắt buộc thanh toán trước (ví dụ ZaloPay).";

export const TRUST_RULES_SHORT_VI = (
  <>
    <Typography.Paragraph className="!mb-1" strong>
      Quy tắc điểm tin cậy (server)
    </Typography.Paragraph>
    <ul className="list-disc pl-4 m-0 text-sm">
      <li>+5 khi đơn chuyển sang &quot;Đã giao hàng&quot;.</li>
      <li>
        −50 khi đơn &quot;Đã hủy&quot; từ trạng thái &quot;Chờ giao hàng&quot; hoặc &quot;Đang giao
        hàng&quot; (bom hàng).
      </li>
      <li>
        Blacklist khi điểm dưới ngưỡng (server: TRUST_BLACKLIST_THRESHOLD; mặc định{" "}
        {TRUST_SERVER_DEFAULT_THRESHOLD}).
      </li>
    </ul>
  </>
);

export function BlacklistStatusBadge({ isBlacklisted, trustScore }) {
  const threshold = getTrustBlacklistThreshold();
  const envUnset =
    import.meta.env.VITE_TRUST_BLACKLIST_THRESHOLD === undefined ||
    import.meta.env.VITE_TRUST_BLACKLIST_THRESHOLD === "";

  if (isBlacklisted) {
    return (
      <Tooltip title={COD_BLOCK_MSG}>
        <Tag color="error">Blacklist</Tag>
      </Tooltip>
    );
  }

  const low = typeof trustScore === "number" && trustScore < threshold;
  if (low) {
    const tip = envUnset
      ? `Điểm thấp hơn ngưỡng mặc định ${TRUST_SERVER_DEFAULT_THRESHOLD} (server). ${COD_BLOCK_MSG}`
      : `Điểm thấp hơn ngưỡng cấu hình admin (${threshold}). ${COD_BLOCK_MSG}`;
    return (
      <Tooltip title={tip}>
        <Tag color="warning">Điểm thấp</Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Khách không nằm trong blacklist theo dữ liệu hiện tại.">
      <Tag color="success">Ổn định</Tag>
    </Tooltip>
  );
}

/** Hiển thị điểm + badge; dùng chung bảng khách / chi tiết đơn */
export function TrustScoreAndBlacklist({ trustScore, isBlacklisted, showScore = true }) {
  const score =
    typeof trustScore === "number" && Number.isFinite(trustScore) ? trustScore : "—";
  return (
    <Space size="small" wrap>
      {showScore && <Typography.Text type="secondary">Điểm: {score}</Typography.Text>}
      <BlacklistStatusBadge isBlacklisted={isBlacklisted} trustScore={trustScore} />
    </Space>
  );
}
