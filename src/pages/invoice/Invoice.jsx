import {
  Avatar,
  Button,
  Flex,
  Modal,
  Row,
  Table,
  Typography,
  Col,
  Dropdown,
  Menu,
  notification,
} from "antd";
import moment from "moment";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { DownOutlined, FilterFilled } from "@ant-design/icons";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchInvoiceRequest } from "../../redux/actions/Invoice";
import { useNavigate } from "react-router-dom";

const Invoice = () => {
  const invoiceData = useSelector((state) => state.invoiceReducer.data);
  const [openDialogDetail, setOpenDialogDetail] = useState(false);
  const [selectInvoiceItem, setSelectInvoiceItem] = useState(null);
  const navigate = useNavigate();

  const showModelDetail = (item) => {
    console.log(item);
    navigate('/invoice/detail', { state: { invoice: item } });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "_id",
      key: "id",
    },
    // {
    //   title: "Sản phẩm",
    //   dataIndex: "productsOrder",
    //   key: "nameProduct",
    //   width: "30%",
    //   render: (record) => {
    //     return (
    //       <div>
    //         {record?.map((product, index) => (
    //           <div
    //             key={index}
    //             className={`flex flex-row p-1  items-center ${index !== 0 ? "border-t" : ""
    //               } ${index !== record.length - 1 ? "border-b" : ""}`}
    //           >
    //             <Avatar src={product.option_id.image} className="mr-1" />
    //             <Typography className="w-[80%]">
    //               {product.option_id.product_id?.name}
    //             </Typography>
    //             <Typography>Số lượng: {product.quantity}</Typography>
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Tên người đặt",
      dataIndex: "info_id",
      key: "nameUser",
      sorter: (a, b) => {
        console.log(a, b);
        return;
      },
      render: (record) => {
        console.log(record);
        return <div>{record?.name}</div>;
      },
    },
    {
      title: "Tổng tiền hóa đơn",
      dataIndex: "total_price",
      key: "totalPrice",

      render: (text) => (
        <Typography>{text ? text.toLocaleString("vi-VN") : ""} đ</Typography>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => {
        // Sắp xếp theo thời gian tạo đơn
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB;},
      filters: [
        { text: "Đã hủy", value: "Đã hủy" },
        { text: "Đã giao hàng", value: "Đã giao hàng" },
        { text: "Chờ giao hàng", value: "Chờ giao hàng" },
        { text: "Chờ xác nhận", value: "Chờ xác nhận" },
        { text: "Đang giao hàng", value: "Đang giao hàng" },
      ],
      onFilter: (value, record) => {
        if (value === "Đã hủy") {
          return record.status === "Đã hủy";
        } else if (value === "Đã giao hàng") {
          return record.status === "Đã giao hàng";
        } else if (value === "Chờ giao hàng") {
          return record.status === "Chờ giao hàng";
        } else if (value === "Chờ xác nhận") {
          return record.status === "Chờ xác nhận";
        } else if (value === "Đang giao hàng") {
          return record.status === "Đang giao hàng";
        }
        return false;
      },
    },
    {
      title: "",
      key: "action",
      render: (record) => {
        return (
          <Button type="link" onClick={() => showModelDetail(record)}>
            chi tiết
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={invoiceData?.result}
        bordered
        rowKey={(record) => record._id}
      />
    </div>
  );
};

export default Invoice;
