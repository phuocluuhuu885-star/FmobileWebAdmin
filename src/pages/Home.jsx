import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "./home.css";
import Cookies from "js-cookie";
import { Card, Col, Flex, Row, Statistic, Table, Typography, Empty } from "antd";
import CountUp from "react-countup";
import { Button, DatePicker, Input, Space } from 'antd';
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatter = (value) => <CountUp end={value} separator="," />;

const getProductLineName = (item) =>
  item?.option_id?.product_id?.name ||
  item?.option_id?.name ||
  "Sản phẩm không xác định";

const getProductLineImage = (item) =>
  item?.option_id?.image ||
  (Array.isArray(item?.option_id?.product_id?.image)
    ? item.option_id.product_id.image[0]
    : item?.option_id?.product_id?.image) ||
  "";

const getProductLineRevenue = (item) => {
  const price = Number(item?.option_id?.price || 0);
  const discountPct = Number(item?.discount_value || 0);
  const discount = discountPct ? (price * discountPct) / 100 : 0;
  const finalPrice = Math.max(price - discount, 0);
  return finalPrice * Number(item?.quantity || 0);
};

const getOrderCustomerKey = (order) => {
  const userId = order?.user_id;
  if (userId) {
    if (typeof userId === "object") return userId._id || userId.id;
    return String(userId);
  }
  const phone = order?.info_id?.phone_number;
  if (phone) return `phone:${phone}`;
  const email = order?.info_id?.email;
  if (email) return `email:${email}`;
  const name = order?.info_id?.name;
  if (name) return `name:${name}`;
  return null;
};

const getOrderCustomerDisplayName = (order, userMap) => {
  const userId = order?.user_id;
  if (typeof userId === "object") {
    return (
      userId.username ||
      userId.full_name ||
      userId.email ||
      order?.info_id?.name ||
      "—"
    );
  }
  if (userId && userMap?.has(userId)) {
    const user = userMap.get(userId);
    return user.username || user.full_name || user.email || "—";
  }
  return (
    order?.info_id?.name ||
    order?.info_id?.phone_number ||
    order?.info_id?.email ||
    "Khách không xác định"
  );
};

const Home = () => {
  const token = Cookies.get("token");

  const dataUser = useSelector((state) => state.customerReducer.data);
  const dataStore = useSelector((state) => state.storeReducer.data);
  const dataInvoice = useSelector((state) => state.invoiceReducer.data);
  const dataProduct = useSelector((state) => state.productReducer.data);
  const loadingProduct = useSelector((state) => state.productReducer.loading);
  const loadingStore = useSelector((state) => state.storeReducer.loading);
  const loadingUser = useSelector((state) => state.customerReducer.loading);
  const loadingInvoice = useSelector((state) => state.invoiceReducer.loading);
  const [top5Product, setTop5Product] = useState(null);
  const [loadingTop5Product, setLoadingTop5Product] = useState(false);
  const [top10ProductSelling, setTop10ProductSelling] = useState(null);
  const [loadingTop10Product, setLoadingTop10Product] = useState(false);
  const [top5UserByProduct, setTop5UserByProduct] = useState(null);
  const [loadingTopUserByProduct,setLoadingTopUserByProduct] = useState(false);
  const [topStore, setTopStore] = useState(null);
  const [loadingTopStore, setLoadingTopStore] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [ordersSuccessfully, setOrdersSuccessfully] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);

 const toDateObj = (d) => {
    if (!d) return null;
    if (typeof d.toDate === "function") return d.toDate();
    return new Date(d);
  };

  const revenueTrend = useMemo(() => {
    const orders = Array.isArray(dataInvoice?.result) ? dataInvoice.result : [];
    const start = toDateObj(startDate);
    const end = toDateObj(endDate);
    const hasSelectedRange = Boolean(start && end);

    const monthlyMap = new Map();

    orders.forEach((order) => {
      const createdAt = new Date(order?.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      if (start && createdAt < start) return;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdAt > endOfDay) return;
      }

      // Doanh thu thực: chỉ cộng đơn đã giao hàng
      if (order?.status !== "Đã giao hàng") return;
      const amount = Number(order?.total_price || 0);
      const key = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + amount);
    });

    const monthKeys = [];
    if (hasSelectedRange) {
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cursor <= stop) {
        const key = `${cursor.getFullYear()}-${String(
          cursor.getMonth() + 1
        ).padStart(2, "0")}`;
        monthKeys.push(key);
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    const labels = monthKeys.map((k) => {
      const [y, m] = k.split("-");
      return `${m}/${y}`;
    });
    const values = monthKeys.map((k) => monthlyMap.get(k) || 0);

    return { labels, values, monthKeys };
  }, [dataInvoice, startDate, endDate]);

  useEffect(() => {
    setSelectedMonthKey(null);
  }, [startDate, endDate]);

  const monthDetail = useMemo(() => {
    if (!selectedMonthKey) return null;

    const orders = Array.isArray(dataInvoice?.result) ? dataInvoice.result : [];
    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    let totalRevenue = 0;
    let orderCount = 0;
    const productMap = new Map();

    orders.forEach((order) => {
      const createdAt = new Date(order?.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      if (order?.status !== "Đã giao hàng") return;
      if (
        createdAt.getFullYear() !== year ||
        createdAt.getMonth() + 1 !== month
      ) {
        return;
      }

      totalRevenue += Number(order?.total_price || 0);
      orderCount += 1;

      (order?.productsOrder || []).forEach((item) => {
        const productId =
          item?.option_id?.product_id?._id ||
          item?.option_id?._id ||
          getProductLineName(item);
        const lineRevenue = getProductLineRevenue(item);
        const quantity = Number(item?.quantity || 0);

        if (productMap.has(productId)) {
          const existing = productMap.get(productId);
          existing.totalQuantitySold += quantity;
          existing.totalRevenue += lineRevenue;
        } else {
          productMap.set(productId, {
            id: productId,
            productName: getProductLineName(item),
            productImage: getProductLineImage(item),
            totalQuantitySold: quantity,
            totalRevenue: lineRevenue,
          });
        }
      });
    });

    const [y, m] = selectedMonthKey.split("-");
    return {
      label: `${m}/${y}`,
      totalRevenue,
      orderCount,
      products: Array.from(productMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      ),
    };
  }, [selectedMonthKey, dataInvoice]);

  const topCancelledCustomers = useMemo(() => {
    const orders = Array.isArray(dataInvoice?.result) ? dataInvoice.result : [];
    const start = toDateObj(startDate);
    const end = toDateObj(endDate);
    const userMap = new Map();
    (dataUser?.result || []).forEach((user) => {
      if (user?._id) userMap.set(user._id, user);
    });

    const cancelMap = new Map();

    orders.forEach((order) => {
      if (order?.status !== "Đã hủy") return;

      const createdAt = new Date(order?.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      if (start && createdAt < start) return;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdAt > endOfDay) return;
      }

      const key = getOrderCustomerKey(order);
      if (!key) return;

      const userId =
        typeof order.user_id === "object"
          ? order.user_id?._id
          : order.user_id || null;

      if (cancelMap.has(key)) {
        cancelMap.get(key).totalCancelledOrders += 1;
      } else {
        cancelMap.set(key, {
          id: key,
          userId: userId || "—",
          username: getOrderCustomerDisplayName(order, userMap),
          phone: order?.info_id?.phone_number || "—",
          totalCancelledOrders: 1,
        });
      }
    });

    return Array.from(cancelMap.values())
      .sort((a, b) => b.totalCancelledOrders - a.totalCancelledOrders)
      .slice(0, 10);
  }, [dataInvoice, dataUser, startDate, endDate]);

  const handleRevenueBarClick = useCallback(
    (_event, elements) => {
      if (!elements?.length) return;
      const index = elements[0].index;
      const key = revenueTrend.monthKeys?.[index];
      if (key) setSelectedMonthKey(key);
    },
    [revenueTrend.monthKeys]
  );

  const revenueTrendChartData = useMemo(
    () => ({
      labels: revenueTrend.labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueTrend.values,
          backgroundColor: revenueTrend.monthKeys.map((key) =>
            key === selectedMonthKey ? "#1d4ed8" : "#407cff"
          ),
          borderColor: revenueTrend.monthKeys.map((key) =>
            key === selectedMonthKey ? "#1d4ed8" : "#407cff"
          ),
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 45,
        },
      ],
    }),
    [revenueTrend, selectedMonthKey]
  );

  const revenueTrendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleRevenueBarClick,
      onHover: (event, elements) => {
        const target = event?.native?.target;
        if (target) {
          target.style.cursor = elements?.length ? "pointer" : "default";
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${Number(context.raw || 0).toLocaleString("vi-VN")} đ`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => `${Number(value).toLocaleString("vi-VN")} đ`,
          },
        },
      },
    }),
    [handleRevenueBarClick]
  );

  const monthDetailColumns = [
    {
      title: "STT",
      key: "index",
      width: 50,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      key: "productImage",
      render: (text) =>
        text ? <img src={text} alt="" className="w-16" /> : "—",
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
      render: (text) => Number(text || 0).toLocaleString("vi-VN"),
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (text) =>
        `${Number(text || 0).toLocaleString("vi-VN")} đ`,
    },
  ];
  //------------Tổng doanh thu-----------
  useEffect(() => {
    const url = `${import.meta.env.VITE_BASE_URL}statistical/get-total-revenue`;
     const params = {};
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    axios
      .get(url, { params })
      .then((response) => {
        setTotalRevenue(response.data.data.totalRevenue);
      })
      .catch(() => {
        // Error fetching total revenue
      });
  }, [startDate, endDate]);

  // Đoạn này có ở code 1 nhưng mất ở code 2
useEffect(() => {
  const url = `${import.meta.env.VITE_BASE_URL}statistical/get-successful-orders`;
  const params = {};
  if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
  if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

  axios.get(url, { params })
    .then((response) => {
      setOrdersSuccessfully(response.data.data.successfulOrders); // Cập nhật state ở đây
    })
    .catch((error) => { console.log(error); });
}, [startDate, endDate]);

  //-----------------------Top 5 sản phẩm doanh thu cao nhất-----------
  useEffect(() => {
    setLoadingTop5Product(true);

    const url = `${import.meta.env.VITE_BASE_URL}statistical/get-top-product-by-revenue`;
     const params = {};
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTop5Product(false);
        setTop5Product(response.data);
      })
      .catch(() => {
        setLoadingTop5Product(false);
      });
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingTop10Product(true);

    const url = `http://localhost:3000/api/statistical/get-top-products-by-sold-quantity`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTop10Product(false);
        setTop10ProductSelling(response.data);
      })
      .catch(() => {
        setLoadingTop10Product(false);
      });
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingTopUserByProduct(true);

    const url = `http://localhost:3000/api/statistical/get-top-users-by-sold-quantity`;
    const params = {};
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTopUserByProduct(false);
        setTop5UserByProduct(response.data);
      })
      .catch(() => {
        setLoadingTopUserByProduct(false);
      });
  }, [startDate, endDate]);



  useEffect(() => {
    setLoadingTopStore(true);
    axios
      .get(
        `${import.meta.env.VITE_BASE_URL}statistical/get-top-store-by-revenue`
      )
      .then((response) => {
        setLoadingTopStore(false);
        setTopStore(response.data);
      })
      .catch(() => {
        setLoadingTopStore(false);
      });
  }, []);

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
      dataIndex: "productName",
      key: "name",
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      key: "productImage",
      render: (text) => <img src={text} className="w-16" />,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (text) => (
        <Typography>
          {text ? text.toLocaleString("vi-VN") + " đ" : ""}
        </Typography>
      ),
    },
  ];
  const columns2 = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "name",
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      key: "productImage",
      render: (text) => <img src={text} className="w-16" />,
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
      render: (text) => (
        <Typography>
          {text ? text.toLocaleString("vi-VN") + "" : ""}
        </Typography>
      ),
    },
  ];
  const columns3= [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "name",
    },
    {
      title: "ID user",
      dataIndex: "userId",
      key: "userId",
      //render: (text) => <img src={text} className="w-16" />,
    },
    {
      title: "Số lượng đơn hàng đã mua",
      dataIndex: "totalSuccessfulOrders",
      key: "totalSuccessfulOrders",
      render: (text) => (
        <Typography>
          {text ? text.toLocaleString("vi-VN") + "" : ""}
        </Typography>
      ),
    },
  ];
  const columnsCancelledCustomers = [
    {
      title: "STT",
      key: "index",
      width: 50,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "ID user",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Số đơn đã hủy",
      dataIndex: "totalCancelledOrders",
      key: "totalCancelledOrders",
      sorter: (a, b) => a.totalCancelledOrders - b.totalCancelledOrders,
      defaultSortOrder: "descend",
      render: (text) => (
        <Typography>{Number(text || 0).toLocaleString("vi-VN")}</Typography>
      ),
    },
  ];
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };
  const formatterVND = (value) => (
    <>
      <CountUp end={value} separator="," />
      {' VNĐ'}
    </>
  );
  return (
    <div>
      <Flex vertical={false}>
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Tổng người dùng đã đăng ký"
            value={dataUser ? dataUser?.result.length : 0}
            formatter={formatter}
            loading={loadingUser}
          />
        </Card>

        <Card bordered size="default" className="shadow-md m-3">
        <Statistic
          title="Tổng doanh thu"
          value={totalRevenue}
          formatter={formatterVND}
          loading={loadingInvoice}
        />
      </Card>
      <Card bordered size="default" className="shadow-md m-3">
        <Statistic
          title="Tổng số đơn hàng đã bán"
          value={ordersSuccessfully}
          formatter={formatter}
          loading={loadingInvoice}
        />
      </Card>
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Sản phẩm cửa hàng hiện có"
            value={dataProduct ? dataProduct?.result.length : 0}
            formatter={formatter}
            loading={loadingProduct}
          />
        </Card>
      </Flex>

      <div>
      <div className="my-4">
        Chọn thời gian thống kê: 
      </div>
      <Space direction="vertical" size={15}>
        <DatePicker.RangePicker onChange={handleDateRangeChange} />
      </Space>
      </div>
     

      <div className="flex">
        <div className="w-1/2 p-3">
          <div className="flex flex-col border rounded-md shadow-lg">
            <div className="p-2 px-5">
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Top sản phẩm có doanh thu cao nhất
              </Typography.Title>
            </div>
            <Table
              pagination={false}
              dataSource={top5Product?.data}
              columns={columns}
              rowKey={(record) => record._id}
              loading={loadingTop5Product}
            />
          </div>
        </div>

        {/* // --------------Bảng 2------------ */}
        <div className="w-1/2 p-3">
          <div className="flex flex-col border rounded-md shadow-lg">
            <div className="p-2 px-5">
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Top sản phẩm bán chạy nhất
              </Typography.Title>
            </div>
            <Table
              // Cấu hình bảng thứ hai
              pagination={false}
              dataSource={top10ProductSelling?.data}
              columns={columns2}
              rowKey={(record) => record.id}
              loading={loadingTop10Product}
            />
          </div>
        </div>
      </div>

      <div className="flex">
      <div className="w-1/2 p-3">
          <div className="flex flex-col border rounded-md shadow-lg">
            <div className="p-2 px-5">
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Top khách hàng mua nhiều nhất
              </Typography.Title>
            </div>
            <Table
              // Cấu hình bảng thứ hai
              pagination={false}
              dataSource={top5UserByProduct?.data}
              columns={columns3}
              rowKey={(record) => record.id}
              loading={loadingTopUserByProduct}
            />
          </div>
          
        </div>

        {/* // --------------Bảng 2------------ */}
        <div className="w-1/2 p-3">
          <div className="flex flex-col border rounded-md shadow-lg">
            <div className="p-2 px-5">
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
               Biểu đồ doanh thu theo tháng
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Nhấn vào cột tháng để xem chi tiết doanh thu và sản phẩm đã bán
              </Typography.Text>
            </div>
           <div style={{ height: 320, padding: 16 }}>
              {revenueTrend.labels.length > 0 ? (
                <Bar
                  data={revenueTrendChartData}
                  options={revenueTrendChartOptions}
                />
              ) : (
               <Empty
                  description={
                    startDate && endDate
                      ? "Không có dữ liệu doanh thu trong khoảng thời gian đã chọn"
                      : "Vui lòng chọn thời gian thống kê để xem biểu đồ"
                  }
                />
              )}
            </div>
            {monthDetail && (
              <div className="px-4 pb-4 border-t pt-3">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  Chi tiết tháng {monthDetail.label}
                </Typography.Title>
                <Flex gap={24} wrap="wrap" className="mb-3">
                  <Statistic
                    title="Doanh thu tháng"
                    value={monthDetail.totalRevenue}
                    formatter={formatterVND}
                  />
                  <Statistic
                    title="Số đơn đã giao"
                    value={monthDetail.orderCount}
                    formatter={formatter}
                  />
                </Flex>
                <Typography.Text strong className="block mb-2">
                  Sản phẩm đã bán trong tháng
                </Typography.Text>
                {monthDetail.products.length > 0 ? (
                  <Table
                    pagination={false}
                    size="small"
                    dataSource={monthDetail.products}
                    columns={monthDetailColumns}
                    rowKey={(record) => record.id}
                  />
                ) : (
                  <Empty description="Không có sản phẩm trong các đơn đã giao tháng này" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex flex-col border rounded-md shadow-lg">
          <div className="p-2 px-5">
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              Khách hàng hủy đơn nhiều nhất
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {startDate && endDate
                ? "Thống kê theo khoảng thời gian đã chọn, xếp từ nhiều đến ít"
                : "Thống kê toàn bộ đơn đã hủy, xếp từ nhiều đến ít"}
            </Typography.Text>
          </div>
          <Table
            pagination={false}
            dataSource={topCancelledCustomers}
            columns={columnsCancelledCustomers}
            rowKey={(record) => record.id}
            loading={loadingInvoice}
            locale={{
              emptyText: (
                <Empty
                  description={
                    startDate && endDate
                      ? "Không có đơn hủy trong khoảng thời gian đã chọn"
                      : "Chưa có đơn hàng bị hủy"
                  }
                />
              ),
            }}
          />
        </div>
      </div>
        
    </div>
  );
};

export default Home;

const BarChart = ({ data }) => {
  const chartData = {
    labels: data?.map((entry) => entry.storeName),
    datasets: [
      {
        label: "Doanh thu",
        backgroundColor: "#407cff",
        borderColor: "#407cff",
        borderWidth: 1,
        data: data?.map((entry) => entry.totalRevenue),
        barThickness: 35,
      },
    ],
  };

  return <Bar data={chartData} />;
};
