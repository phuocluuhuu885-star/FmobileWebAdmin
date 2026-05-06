import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Typography, notification, Input, InputNumber, Space, Divider, Popconfirm, Modal } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Cookies from 'js-cookie';
import { fetchInvoiceRequest } from '../../redux/actions/Invoice';

const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myProfile = useSelector((state) => state.myProfileReducer.data);
  const data = location.state?.invoice;

  if (!data) {
    return (
      <div className="p-6">
        <Typography.Title level={4}>Không tìm thấy đơn hàng</Typography.Title>
        <Button onClick={() => navigate('/invoice')}>Về danh sách hóa đơn</Button>
      </div>
    );
  }

  const formattedDate = (date) => moment(date).format('HH:mm DD/MM/YYYY');
  const token = Cookies.get('token');
  const adminName = myProfile?.data?.username || myProfile?.data?.full_name || 'Unknown admin';

  const [editingStartAt] = useState(new Date().toISOString());


  const [orderForm, setOrderForm] = useState({
    status: data.status || '',
    reason: getCancelReason(data),
    payment_method: data.payment_method || 'Chuyển khoản',
    ip: data.ip || '',
    payment_status: !!data.payment_status,
    delivery_method: data.delivery_method || 'Tiêu chuẩn',
    info_id: {
      name: data.info_id?.name || '',
      phone_number: data.info_id?.phone_number || '',
      address: data.info_id?.address || '',
      email: data.info_id?.email || '',
    },
    productsOrder: (data.productsOrder || []).map((product, idx) => ({
      _tempId: `${product._id || product.option_id?._id || idx}-${idx}`,
      option_id: product.option_id || null,
      quantity: Number(product.quantity || 1),
      discount_value: Number(product.discount_value || 0),
      custom_name: product.option_id?.product_id?.name || '',
      custom_price: Number(product.option_id?.price || 0),
    })),
  });
  const [auditLogs, setAuditLogs] = useState(data.admin_update_logs || []);
  const [confirmModal, setConfirmModal] = useState({ visible: false, status: '', type: '', message: '', shouldNavigate: true });
  const [note, setNote] = useState('');
  const [editMode, setEditMode] = useState({
    general: false,
    payment: false,
    shipping: false,
    products: false,
  });

  const isPending = orderForm.status === 'Chờ giao hàng';
  const isWaitConfirm = orderForm.status === 'Chờ xác nhận';
  const isWaitDelivery = orderForm.status === 'Đang giao hàng';
  const isOrderLocked = orderForm.status === 'Đang giao hàng';
  const isCancelled = orderForm.status === 'Đã hủy';
  const isCompleted = orderForm.status === 'Đã giao hàng';


    const getCancelReason = (order) => {
    if (!order) return "";
    const possibleKeys = [
      "cancelReason", "cancel_reason", "reasonCancel", "reason_cancel",
      "cancellationReason", "cancellation_reason", "reason", "note_cancel", "cancel_note",
    ];
    for (const key of possibleKeys) {
      const value = order[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }; 

  const cancelReason = orderForm.reason || getCancelReason(data);

  const triggerStatusChange = (status, notificationType, successMessage, shouldNavigate = true) => {
    setConfirmModal({ visible: true, status, type: notificationType, message: successMessage, shouldNavigate });
    setNote('');
  };

  const confirmStatusChange = () => {
    if (confirmModal.status === 'Đã hủy' && !note.trim()) {
      notification.warning({ message: 'Cảnh báo', description: 'Vui lòng nhập lý do hủy đơn hàng', duration: 3 });
      return;
    }

    setOrderForm((prev) => ({ ...prev, status: confirmModal.status, reason: confirmModal.status === 'Đã hủy' ? note.trim() : prev.reason }));
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}order/update-order-status/${data._id}`,
        { status: confirmModal.status, note: note.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data && res.data.result && res.data.result.admin_update_logs) {
            setAuditLogs(res.data.result.admin_update_logs);
        }
        dispatch(fetchInvoiceRequest(token));
        axios
          .post(`${import.meta.env.VITE_BASE_URL}notifi/postnotifi`, {
            receiver_id: data.user_id,
            order_id: data._id,
            content: data.createdAt,
            type: confirmModal.type,
          })
          .then(() => {
            notification.success({
              message: 'Thành công',
              description: confirmModal.message,
              duration: 3,
            });
            setConfirmModal({ visible: false, status: '', type: '', message: '', shouldNavigate: true });
            if (confirmModal.shouldNavigate) {
              navigate('/invoice');
            }
          })
          .catch(() => {
            // Error updating notification
            notification.success({
              message: 'Thành công',
              description: confirmModal.message,
              duration: 3,
            });
            setConfirmModal({ visible: false, status: '', type: '', message: '', shouldNavigate: true });
          });
      })
      .catch(() => {
        notification.error({
          message: 'Thất bại',
          description: 'Cập nhật trạng thái đơn hàng thất bại',
          duration: 3,
        });
      });
  };


  const totalOrder = useMemo(() => {
    return orderForm.productsOrder.reduce((sum, product) => {
      const price = Number(product.custom_price || 0);
      const discount = product.discount_value ? (price * Number(product.discount_value)) / 100 : 0;
      const finalPrice = Math.max(price - discount, 0);
      return sum + finalPrice * Number(product.quantity || 0);
    }, 0);
  }, [orderForm.productsOrder]);

  const updateInfoField = (field, value) => {
    if (isOrderLocked) return;
    setOrderForm((prev) => ({
      ...prev,
      info_id: {
        ...prev.info_id,
        [field]: value,
      },
    }));
  };

  const updateProductRow = (rowId, key, value) => {
    if (isOrderLocked) return;
    setOrderForm((prev) => ({
      ...prev,
      productsOrder: prev.productsOrder.map((row) => {
        if (row._tempId !== rowId) return row;
        return {
          ...row,
          [key]: value,
        };
      }),
    }));
  };

  const addProductRow = () => {
    if (isOrderLocked) return;
    setOrderForm((prev) => ({
      ...prev,
      productsOrder: [
        ...prev.productsOrder,
        {
          _tempId: `new-${Date.now()}`,
          option_id: null,
          quantity: 1,
          discount_value: 0,
          custom_name: '',
          custom_price: 0,
        },
      ],
    }));
  };





  const renderPrice = (price, discountValue) => {
    const discount = discountValue ? (price * discountValue) / 100 : 0;
    const finalPrice = price - discount;
    return Math.max(finalPrice, 0);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Typography.Title level={3} className="mb-1">
            Order {data._id} chi tiết
          </Typography.Title>
          <Typography.Text className="text-gray-500">
            Thanh toán qua {orderForm.payment_method || 'Chuyển khoản'} IP khách: {orderForm.ip || '127.0.0.1'}
          </Typography.Text>
        </div>
        <Button type="default" onClick={() => navigate('/invoice')}>
          Quay lại
        </Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <Typography.Title level={5}>Chi tiết chung</Typography.Title>
            </div>
            <div className="flex flex-col gap-1 mb-3">
              <Typography.Text className="text-base">
                Ngày tạo: {formattedDate(data.createdAt)}
              </Typography.Text>
              {isCancelled ? (
                <>
                  <Typography.Text className="text-red-600 text-base">
                    Ngày hủy: {formattedDate(data.updatedAt)}
                  </Typography.Text>
                  <Typography.Text className="text-red-600 text-base">
                    Lý do hủy: {cancelReason || "Không có lý do"}
                  </Typography.Text>
                </>
              ) : isCompleted ? (
                <Typography.Text className="text-base text-green-600">
                  Ngày hoàn thành: {data.completedAt ? formattedDate(data.completedAt) : formattedDate(data.updatedAt)}
                </Typography.Text>
              ) : (
                <Typography.Text className="text-base">
                  Ngày hoàn thành: chưa hoàn thành
                </Typography.Text>
              )}
            </div>

            <Space direction="vertical" className="w-full">
              <Input disabled={!editMode.general || isOrderLocked} value={orderForm.status} onChange={(e) => setOrderForm((prev) => ({ ...prev, status: e.target.value }))} placeholder="Trạng thái đơn hàng" />
              <Input disabled={!editMode.general || isOrderLocked} value={orderForm.info_id.name} onChange={(e) => updateInfoField('name', e.target.value)} placeholder="Tên khách hàng" />
              <Input disabled={!editMode.general || isOrderLocked} value={orderForm.info_id.phone_number} onChange={(e) => updateInfoField('phone_number', e.target.value)} placeholder="Số điện thoại" />
            </Space>
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <Typography.Title level={5}>Thông tin thanh toán</Typography.Title>
            </div>
            <Space direction="vertical" className="w-full">
              <Input disabled={!editMode.payment || isOrderLocked} value={orderForm.info_id.address} onChange={(e) => updateInfoField('address', e.target.value)} placeholder="Địa chỉ thanh toán" />
              <Input disabled={!editMode.payment || isOrderLocked} value={orderForm.info_id.email} onChange={(e) => updateInfoField('email', e.target.value)} placeholder="Email" />
              <Input disabled={!editMode.payment || isOrderLocked} value={orderForm.payment_method} onChange={(e) => setOrderForm((prev) => ({ ...prev, payment_method: e.target.value }))} placeholder="Phương thức thanh toán" />
              <div className="flex items-center gap-2">
                <span>Trạng thái thanh toán:</span>
                <Typography.Text strong={orderForm.payment_status} type={orderForm.payment_status ? 'success' : 'secondary'}>
                  {orderForm.payment_status ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Typography.Text>
              </div>
              <p>Tổng tiền mới: {totalOrder.toLocaleString('vi-VN')} đ</p>
            </Space>
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <Typography.Title level={5}>Chi tiết giao nhận</Typography.Title>
            </div>
            <Space direction="vertical" className="w-full">
              <Input disabled={!editMode.shipping || isOrderLocked} value={orderForm.info_id.address} onChange={(e) => updateInfoField('address', e.target.value)} placeholder="Địa chỉ giao" />
              <Input disabled={!editMode.shipping || isOrderLocked} value={orderForm.info_id.name} onChange={(e) => updateInfoField('name', e.target.value)} placeholder="Người nhận" />
              <Input disabled={!editMode.shipping || isOrderLocked} value={orderForm.delivery_method} onChange={(e) => setOrderForm((prev) => ({ ...prev, delivery_method: e.target.value }))} placeholder="Phương thức giao nhận" />
              <Input disabled={!editMode.shipping || isOrderLocked} value={orderForm.ip} onChange={(e) => setOrderForm((prev) => ({ ...prev, ip: e.target.value }))} placeholder="IP khách hàng" />
            </Space>
          </div>
        </Col>
      </Row>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded shadow-sm">
          <div className="flex items-center justify-between">
            <Typography.Title level={5}>Order Sản phẩm</Typography.Title>
          </div>
          <div className="mb-3">
            <Button disabled={!editMode.products || isOrderLocked} onClick={addProductRow}>
              Thêm sản phẩm
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Sản phẩm</th>
                  <th className="p-2 border text-center">SL</th>
                  <th className="p-2 border text-center">Giảm %</th>
                  <th className="p-2 border text-right">Giá</th>
                  <th className="p-2 border text-right">Tổng</th>
                  <th className="p-2 border text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderForm.productsOrder?.map((product) => {
                  const price = Number(product.custom_price || 0);
                  const discountValue = Number(product.discount_value || 0);
                  const priceAfter = renderPrice(price, discountValue);
                  const lineTotal = priceAfter * Number(product.quantity || 0);
                  return (
                    <tr key={product._tempId} className="border-t">
                      <td className="p-2 border">
                        <Input
                          disabled={!editMode.products || isOrderLocked}
                          value={product.custom_name}
                          onChange={(e) => updateProductRow(product._tempId, 'custom_name', e.target.value)}
                          placeholder="Tên sản phẩm"
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <InputNumber
                          disabled={!editMode.products || isOrderLocked}
                          min={1}
                          value={product.quantity}
                          onChange={(value) => updateProductRow(product._tempId, 'quantity', Number(value || 1))}
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <InputNumber
                          disabled={!editMode.products || isOrderLocked}
                          min={0}
                          max={100}
                          value={product.discount_value}
                          onChange={(value) => updateProductRow(product._tempId, 'discount_value', Number(value || 0))}
                        />
                      </td>
                      <td className="p-2 border text-right">
                        <InputNumber
                          disabled={!editMode.products || isOrderLocked}
                          min={0}
                          value={product.custom_price}
                          onChange={(value) => updateProductRow(product._tempId, 'custom_price', Number(value || 0))}
                        />
                      </td>
                      <td className="p-2 border text-right">{priceAfter.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2 border text-right">
                        <div className="text-right">{lineTotal.toLocaleString('vi-VN')} đ</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-right mt-4 font-semibold">Tổng: {totalOrder.toLocaleString('vi-VN')} đ</div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <Typography.Title level={5}>Order Thao tác</Typography.Title>
          <div className="space-y-2">
            <Button
              block
              disabled={!isWaitConfirm}
              onClick={() => triggerStatusChange('Chờ giao hàng', 'wfd', 'Xác nhận đơn hàng thành công', false)}
            >
              Xác nhận đơn hàng
            </Button>
            <Button
              block
              disabled={!isPending}
              onClick={() => triggerStatusChange('Đang giao hàng', 'delivere', 'Đang giao hàng')}
            >
              Giao hàng
            </Button>
            <Button
              block
              disabled={!isWaitDelivery}
              onClick={() => triggerStatusChange('Đã giao hàng', 'delivered', 'Giao hàng thành công')}
            >
              Giao hàng thành công
            </Button>
            <Button
              block
              danger
              disabled={!isWaitConfirm}
              onClick={() => triggerStatusChange('Đã hủy', 'canceled', 'Hủy đơn hàng')}
            >
              Hủy đơn hàng
            </Button>
          </div>

          <div className="mt-5">
            <Typography.Title level={5}>Lịch sử chỉnh sửa</Typography.Title>
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <Typography.Text type="secondary">Chưa có lịch sử chỉnh sửa</Typography.Text>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={`${log.to_time || index}-${index}`} className="text-sm bg-gray-50 border rounded p-2">
                    <div>
                      <b>Admin:</b> {log.updated_by || 'N/A'}
                    </div>
                    <div>
                      <b>Thời gian:</b> {formattedDate(log.from_time)} - {formattedDate(log.to_time)}
                    </div>
                    <div>
                      <b>Hành động:</b> {log.action || 'Không rõ'}
                    </div>
                    <div>
                      <b>Chi tiết:</b> {log.details || 'N/A'}
                    </div>
                    {log.note && (
                      <div>
                        <b>Ghi chú:</b> {log.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={`Xác nhận đổi trạng thái: ${confirmModal.status}`}
        open={confirmModal.visible}
        onOk={confirmStatusChange}
        onCancel={() => setConfirmModal({ visible: false, status: '', type: '', message: '', shouldNavigate: true })}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn chuyển trạng thái thành <b>{confirmModal.status}</b>?</p>
        <div className="mt-4">
          <label className="block mb-2 font-medium">
            {confirmModal.status === 'Đã hủy' ? 'Lý do hủy (bắt buộc):' : 'Ghi chú (tùy chọn):'}
          </label>
          <Input.TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={confirmModal.status === 'Đã hủy' ? 'Nhập lý do hủy đơn hàng' : 'Nhập ghi chú...'}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
