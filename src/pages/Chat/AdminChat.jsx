import React, { useState, useEffect, useRef } from "react";
import { Flex, Input, Button, List, Avatar, Typography } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, serverTimestamp } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerRequest } from "../../redux/actions/Customer";
import Cookies from "js-cookie";

const { Text } = Typography;

// Cấu hình Firebase của bạn (đặt vào biến môi trường nếu có thể).
// Lưu ý: tránh commit các key nhạy cảm vào repo.
const firebaseConfig = {
  apiKey: "AIzaSyBQtIuwBlR05HANsAbw3yMymcIAldYrkn0",
  authDomain: "fmobile-b9bb5.firebaseapp.com",
  databaseURL: "https://fmobile-b9bb5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fmobile-b9bb5",
  storageBucket: "fmobile-b9bb5.firebasestorage.app",
  messagingSenderId: "511125845737",
  appId: "1:511125845737:web:d14a298138185809c0e278",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const AdminChat = () => {
  const [users, setUsers] = useState([]); // Danh sách khách hàng
  const [selectedUser, setSelectedUser] = useState(null); // Khách đang chọn
  const [messages, setMessages] = useState([]); // Tin nhắn trong hội thoại
  const [inputValue, setInputValue] = useState("");
  const messageListRef = useRef(null);

  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customerReducer.data);
  const customers = customerData?.result || customerData || [];

  useEffect(() => {
    dispatch(fetchCustomerRequest("customer", Cookies.get("token")));
  }, [dispatch]);

  const getCustomerName = (userId) => {
    if (!customers || customers.length === 0) return userId;
    const customer = customers.find(c => c._id === userId);
    return customer ? (customer.username || customer.email || userId) : userId;
  };

  // 1. Lấy danh sách tất cả người dùng có nhắn tin (nhánh 'chats')
  useEffect(() => {
    const chatsRef = ref(db, "chats");
    const unsub = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map((userId) => ({
          id: userId,
          lastMessage: data[userId].messages
            ? Object.values(data[userId].messages).pop().content
            : "...",
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    });

    return () => unsub();
  }, []);

  // 2. Lấy tin nhắn khi chọn một khách hàng cụ thể
  useEffect(() => {
    if (!selectedUser) return;
    const msgRef = ref(db, `chats/${selectedUser}/messages`);
    const unsub = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      } else {
        setMessages([]);
      }
    });

    return () => unsub();
  }, [selectedUser]);

  // Tự động cuộn xuống cuối khi có tin mới
  useEffect(() => {
    // Tránh scroll "kép" (window + container) bằng cách scroll trực tiếp
    // vào div đang overflow.
    const el = messageListRef.current;
    if (!el) return;
    // Dùng timeout để đảm bảo DOM đã render xong message mới.
    const t = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
    return () => clearTimeout(t);
  }, [messages]);

  // 3. Hàm gửi tin nhắn (Admin gửi)
  const handleSend = () => {
    if (!inputValue.trim() || !selectedUser) return;

    const msgRef = ref(db, `chats/${selectedUser}/messages`);
    const newMsg = {
      content: inputValue,
      senderId: "ADMIN",
      timestamp: serverTimestamp(),
    };

    push(msgRef, newMsg);
    setInputValue("");
  };

  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <Flex style={{ height: "100%", width: "100%", overflow: "hidden" }}>
        {/* CỘT TRÁI: DANH SÁCH USER */}
        <div
          style={{
            width: "30%",
            borderRight: "1px solid #f0f0f0",
            background: "#fafafa",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="p-4 bg-white border-b">
            <Typography.Title level={4} style={{ margin: 0 }}>
              Tin nhắn
            </Typography.Title>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <List
              dataSource={users}
              renderItem={(user) => (
                <List.Item
                  onClick={() => setSelectedUser(user.id)}
                  style={{
                    cursor: "pointer",
                    padding: "15px",
                    background:
                      selectedUser === user.id ? "#e6f7ff" : "transparent",
                    transition: "0.3s",
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={getCustomerName(user.id)}
                    description={
                      <Text ellipsis style={{ width: 150 }}>
                        {user.lastMessage}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT */}
        <Flex vertical style={{ width: "70%", height: "100%" }}>
          {selectedUser ? (
            <>
              {/* Header khung chat */}
              <div className="p-4 border-b bg-white">
                <Text strong>Đang chat với: {getCustomerName(selectedUser)}</Text>
              </div>

              {/* Danh sách tin nhắn */}
              <div
                ref={messageListRef}
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "20px",
                  background: "#f5f5f5",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    paddingBottom: 8,
                  }}
                >
                  {messages.map((msg, index) => (
                    <Flex
                      key={index}
                      justify={msg.senderId === "ADMIN" ? "end" : "start"}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "10px 15px",
                          borderRadius: "15px",
                          background:
                            msg.senderId === "ADMIN" ? "#407cff" : "#fff",
                          color: msg.senderId === "ADMIN" ? "#fff" : "#000",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                    </Flex>
                  ))}
                </div>
              </div>

              {/* Thanh nhập liệu */}
              <div className="p-4 bg-white border-t">
                <Flex gap={10}>
                  <Input
                    placeholder="Nhập nội dung phản hồi..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                    Gửi
                  </Button>
                </Flex>
              </div>
            </>
          ) : (
            <Flex align="center" justify="center" style={{ flex: 1 }}>
              <Text type="secondary">Chọn một khách hàng để bắt đầu hỗ trợ</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

export default AdminChat;

