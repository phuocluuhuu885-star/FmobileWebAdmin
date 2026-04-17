import React, { useEffect, useMemo, useState } from "react";
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

    return { labels, values };
  }, [dataInvoice, startDate, endDate]);

  const revenueTrendChartData = useMemo(
    () => ({
      labels: revenueTrend.labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueTrend.values,
          backgroundColor: "#407cff",
          borderColor: "#407cff",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 45,
        },
      ],
    }),
    [revenueTrend]
  );

  const revenueTrendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
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
    []
  );
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
          </div>
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
