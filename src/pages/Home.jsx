import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./home.css";
import Cookies from "js-cookie";
import { Card, Col, Flex, Row, Statistic, Table, Typography } from "antd";
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
  const [topLeastSellingProducts,setTopLeastSellingProducts] = useState(null);
  const [loadingtopleastSellingProducts,setLoadingTopleteastSellingProducts] = useState(false);
  const [topStore, setTopStore] = useState(null);
  const [loadingTopStore, setLoadingTopStore] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [ordersSuccessfully, setOrdersSuccessfully] = useState(null);
  // useEffect(() => {
  //   setLoadingTop5Product(true);
  //   axios
  //     .get(
  //       `${import.meta.env.VITE_BASE_URL}statistical/get-top-product-by-revenue`
  //     )
  //     .then((response) => {
  //       setLoadingTop5Product(false);
  //       setTop5Product(response.data);
  //     })
  //     .catch((e) => {
  //       setLoadingTop5Product(false);
  //       console.log(e);
  //     });
  // }, []);
  
  //---------Top sản phẩm bán ít-------------
  useEffect(() => {
    setLoadingTopleteastSellingProducts(true);

    const url = `http://localhost:3000/api/statistical/get-top-least-selling-products`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTopleteastSellingProducts(false);
        setTopLeastSellingProducts(response.data);
      })
      .catch((error) => {
        setLoadingTopleteastSellingProducts(false);
        console.log(error);
      });
  }, [startDate, endDate]);
  //------------Tổng doanh thu-----------
  useEffect(() => {
    const url = `${import.meta.env.VITE_BASE_URL}statistical/get-total-revenue`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setTotalRevenue(response.data.data.totalRevenue);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, endDate]);

  //----------Tổng đơn thành công--------------
  useEffect(() => {
    const url = `${import.meta.env.VITE_BASE_URL}statistical/get-successful-orders`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setOrdersSuccessfully(response.data.data.successfulOrders);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, endDate]);

  //-----------------------Top 5 sản phẩm doanh thu cao nhất-----------
  useEffect(() => {
    setLoadingTop5Product(true);

    const url = `${import.meta.env.VITE_BASE_URL}statistical/get-top-product-by-revenue`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTop5Product(false);
        setTop5Product(response.data);
      })
      .catch((error) => {
        setLoadingTop5Product(false);
        console.log(error);
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
      .catch((error) => {
        setLoadingTop10Product(false);
        console.log(error);
      });
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingTopUserByProduct(true);

    const url = `http://localhost:3000/api/statistical/get-top-users-by-sold-quantity`;
    const params = {
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
    };

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingTopUserByProduct(false);
        setTop5UserByProduct(response.data);
      })
      .catch((error) => {
        setLoadingTopUserByProduct(false);
        console.log(error);
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
      .catch((e) => {
        setLoadingTopStore(false);
        console.log(e);
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
      title: "Số đơn thành công",
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
            title="Người dùng kích hoạt"
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
          title="Tổng đơn hàng thành công"
          value={ordersSuccessfully}
          formatter={formatter}
          loading={loadingInvoice}
        />
      </Card>
        {/* <Card bordered size="default" className="shadow-md m-3">
          <Statistic
            title="Cửa hàng kích hoạt"
            value={dataStore ? dataStore?.data.length : 0}
            formatter={formatter}
            loading={loadingStore}
          />
        </Card> */}
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Sản phẩm hiện có"
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
                Top sản phẩm bán ít nhất
              </Typography.Title>
            </div>
            <Table
              // Cấu hình bảng thứ hai
              pagination={false}
              dataSource={topLeastSellingProducts?.data}
              columns={columns2}
              rowKey={(record) => record.id}
              loading={loadingtopleastSellingProducts}
            />
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
