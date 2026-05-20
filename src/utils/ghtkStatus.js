/** Nhãn hiển thị trạng thái đơn nội bộ (kể cả mã shipping từ GHTK). */
export const ORDER_STATUS_LABELS = {
  "Chờ thanh toán": "Chờ thanh toán",
  "Chờ xác nhận": "Chờ xác nhận",
  "Đã thanh toán": "Đã thanh toán",
  "Chờ giao hàng": "Chờ giao hàng",
  shipping: "Đang giao hàng (GHTK)",
  "Đang giao hàng": "Đang giao hàng",
  "Đã giao hàng": "Đã giao hàng",
  "Đã hủy": "Đã hủy",
};

export const GHTK_STATUS_LABELS = {
  "-1": "Đã hủy",
  1: "Chưa tiếp nhận",
  2: "Đã tiếp nhận",
  3: "Đã lấy hàng",
  4: "Đang giao hàng",
  5: "Đã giao hàng",
  6: "Đã đối soát",
  7: "Không lấy được hàng",
  8: "Hoãn lấy hàng",
  9: "Không giao được",
  10: "Delay giao hàng",
  12: "Đã điều phối lấy hàng",
  45: "Shipper báo đã giao",
};

export function formatOrderStatus(status) {
  if (!status) return "—";
  return ORDER_STATUS_LABELS[status] || status;
}

export function formatGhtkStatus(status) {
  if (!status) return "Chưa tạo vận đơn";
  const key = String(status).trim();
  if (GHTK_STATUS_LABELS[key]) return GHTK_STATUS_LABELS[key];
  return key;
}

export const CONFIRMABLE_ORDER_STATUSES = ["Chờ xác nhận", "Chờ giao hàng", "Đã thanh toán"];

export const IN_SHIPPING_STATUSES = ["shipping", "Đang giao hàng"];
