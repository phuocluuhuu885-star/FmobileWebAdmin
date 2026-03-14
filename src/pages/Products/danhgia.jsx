import React, { useEffect, useState } from "react";
import { Modal, Button, Table } from "antd";
import axios from "axios";
import Cookies from "js-cookie";

const ShowReviewsModal = ({ productId, onClose }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/review/${productId}`);
        setReviews(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  return (
    <Modal
      title="Đánh giá sản phẩm"
      open={Boolean(productId)}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Table
        dataSource={reviews}
        columns={[
          { title: "Người đánh giá", dataIndex: "name", key: "name" },
          { title: "Nội dung", dataIndex: "content", key: "content" },
          { title: "Đánh giá", dataIndex: "rate", key: "rate" },
        ]}
        rowKey="_id"
        pagination={false}
      />
    </Modal>
  );
};

export default ShowReviewsModal;
