import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Typography, notification, Input, InputNumber, Space, Divider, Popconfirm, Select, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';
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

  const [orderForm, setOrderForm] = useState({
    status: data.status || '',
    payment_method: data.payment_method || 'Chuyển khoản',
    ip: data.ip || '',
    payment_status: !!data.payment_status,
    shipper_id: data.shipper_id?._id || data.shipper_id || null,
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
  const [noteInput, setNoteInput] = useState('');
  const [editingStartAt] = useState(new Date().toISOString());
  const [auditLogs, setAuditLogs] = useState(data.admin_update_logs || []);
  const [isSaving, setIsSaving] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [isCreateShipperOpen, setIsCreateShipperOpen] = useState(false);
  const [isCreatingShipper, setIsCreatingShipper] = useState(false);
  const [newShipper, setNewShipper] = useState({
    name: '',
    phone_number: '',
    shipper_code: '',
    shipping_company: '',
  });
  const [editMode, setEditMode] = useState({
    general: false,
    payment: false,
    shipping: false,
    products: false,
  });

  const isPending = orderForm.status === 'Chờ giao hàng';
  const isWaitConfirm = orderForm.status === 'Chờ xác nhận';
  const isWaitDelivery = orderForm.status === 'Đang giao hàng';
  const showShipperSelector = orderForm.status !== 'Chờ xác nhận';
  const isOrderLocked = orderForm.status === 'Đang giao hàng';

  const fetchShippers = () => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}shipper`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setShippers(res?.data?.result || []);
      })
      .catch((err) => {
        console.log('Lỗi lấy danh sách shipper', err);
      });
  };

  useEffect(() => {
    fetchShippers();
  }, [token]);

  const handleCreateShipper = async () => {
    if (!newShipper.name || !newShipper.phone_number || !newShipper.shipper_code || !newShipper.shipping_company) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng nhập đủ Tên, SĐT, Mã shipper và Đơn vị vận chuyển.',
        duration: 3,
      });
      return;
    }
    try {
      setIsCreatingShipper(true);
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}shipper/create`, newShipper, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const created = res?.data?.result;
      fetchShippers();
      setOrderForm((prev) => ({ ...prev, shipper_id: created?._id || prev.shipper_id }));
      setNewShipper({ name: '', phone_number: '', shipper_code: '', shipping_company: '' });
      setIsCreateShipperOpen(false);
      notification.success({
        message: 'Thành công',
        description: 'Đã tạo và lưu shipper vào hệ thống.',
        duration: 3,
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: 'Thất bại',
        description: err?.response?.data?.message || 'Không thể tạo shipper',
        duration: 3,
      });
    } finally {
      setIsCreatingShipper(false);
    }
  };

  const updateStatus = (status, notificationType, successMessage, shouldNavigate = true) => {
    if (status === 'Đang giao hàng' && !orderForm.shipper_id) {
      notification.warning({
        message: 'Thiếu shipper',
        description: 'Vui lòng chọn shipper trước khi chuyển sang trạng thái giao hàng.',
        duration: 3,
      });
      return;
    }
    setOrderForm((prev) => ({ ...prev, status }));
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}order/update-order-status/${data._id}`,
        { status, shipper_id: orderForm.shipper_id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        dispatch(fetchInvoiceRequest(token));
        axios
          .post(`${import.meta.env.VITE_BASE_URL}notifi/postnotifi`, {
            receiver_id: data.user_id,
            order_id: data._id,
            content: data.createdAt,
            type: notificationType,
          })
          .then(() => {
            notification.success({
              message: 'Thành công',
              description: successMessage,
              duration: 3,
            });
            if (shouldNavigate) {
              navigate('/invoice');
            }
          })
          .catch((err) => console.log('Lỗi notifi', err));
      })
      .catch((err) => {
        console.log(err);
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

  const removeProductRow = (rowId) => {
    if (isOrderLocked) return;
    setOrderForm((prev) => ({
      ...prev,
      productsOrder: prev.productsOrder.filter((row) => row._tempId !== rowId),
    }));
  };

  const handleSaveAll = async () => {
    if (isOrderLocked) {
      notification.warning({
        message: 'Đơn hàng đã khóa',
        description: 'Đơn hàng đang giao nên không thể chỉnh sửa thông tin.',
        duration: 3,
      });
      return;
    }
    const saveTime = new Date().toISOString();
    const durationMinutes = Math.max(moment(saveTime).diff(moment(editingStartAt), 'minutes'), 0);
    const auditEntry = {
      updated_by: adminName,
      from_time: editingStartAt,
      to_time: saveTime,
      note: noteInput || 'Cập nhật thông tin đơn hàng',
      duration_minutes: durationMinutes,
    };

    const payload = {
      status: orderForm.status,
      payment_method: orderForm.payment_method,
      ip: orderForm.ip,
      payment_status: orderForm.payment_status,
      shipper_id: orderForm.shipper_id,
      delivery_method: orderForm.delivery_method,
      info_id: {
        ...orderForm.info_id,
      },
      productsOrder: orderForm.productsOrder.map((product) => ({
        option_id: product.option_id?._id || product.option_id || null,
        quantity: Number(product.quantity || 1),
        discount_value: Number(product.discount_value || 0),
        custom_name: product.custom_name || '',
        custom_price: Number(product.custom_price || 0),
      })),
      admin_update_logs: [...auditLogs, auditEntry],
    };

    try {
      setIsSaving(true);
      await axios.put(`${import.meta.env.VITE_BASE_URL}order/update-order/${data._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs((prev) => [...prev, auditEntry]);
      setNoteInput('');
      dispatch(fetchInvoiceRequest(token));
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật đầy đủ thông tin đơn hàng',
        duration: 3,
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: 'Thất bại',
        description: 'Không thể lưu thay đổi. Vui lòng kiểm tra API update-order.',
        duration: 3,
      });
    } finally {
      setIsSaving(false);
    }
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
              <Button
                type={editMode.general ? 'primary' : 'default'}
                icon={<EditOutlined />}
                disabled={isOrderLocked}
                onClick={() => setEditMode((prev) => ({ ...prev, general: !prev.general }))}
              >
                {editMode.general ? 'Đang sửa' : 'Sửa'}
              </Button>
            </div>
            <p>Thời gian đặt hàng: {formattedDate(data.createdAt)}</p>
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
              <Button
                type={editMode.payment ? 'primary' : 'default'}
                icon={<EditOutlined />}
                disabled={isOrderLocked}
                onClick={() => setEditMode((prev) => ({ ...prev, payment: !prev.payment }))}
              >
                {editMode.payment ? 'Đang sửa' : 'Sửa'}
              </Button>
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
              <Button
                type={editMode.shipping ? 'primary' : 'default'}
                icon={<EditOutlined />}
                disabled={isOrderLocked}
                onClick={() => setEditMode((prev) => ({ ...prev, shipping: !prev.shipping }))}
              >
                {editMode.shipping ? 'Đang sửa' : 'Sửa'}
              </Button>
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
            <Button
              type={editMode.products ? 'primary' : 'default'}
              icon={<EditOutlined />}
              disabled={isOrderLocked}
              onClick={() => setEditMode((prev) => ({ ...prev, products: !prev.products }))}
            >
              {editMode.products ? 'Đang sửa' : 'Sửa'}
            </Button>
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
                  <th className="p-2 border text-center">Thao tác</th>
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
                      <td className="p-2 border text-center">
                        {editMode.products && !isOrderLocked ? (
                          <Popconfirm title="Xóa sản phẩm khỏi đơn hàng?" onConfirm={() => removeProductRow(product._tempId)}>
                            <Button danger>Xóa</Button>
                          </Popconfirm>
                        ) : (
                          <Button danger disabled>
                            Xóa
                          </Button>
                        )}
                        <div className="mt-1 text-right">{lineTotal.toLocaleString('vi-VN')} đ</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-right mt-4 font-semibold">Tổng: {totalOrder.toLocaleString('vi-VN')} đ</div>
          {showShipperSelector && (
            <div className="mt-5 border-t pt-4">
              <Typography.Title level={5}>Thông tin shipper</Typography.Title>
              <Select
                className="w-full"
                placeholder="Chọn shipper giao hàng"
                value={orderForm.shipper_id}
                onChange={(value) => setOrderForm((prev) => ({ ...prev, shipper_id: value }))}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
                options={shippers.map((shipper) => ({
                  value: shipper._id,
                  label: `${shipper.name} - ${shipper.phone_number} - ${shipper.shipper_code} - ${shipper.shipping_company}`,
                }))}
                allowClear
                disabled={isOrderLocked}
              />
              <Button className="mt-2" disabled={isOrderLocked} onClick={() => setIsCreateShipperOpen(true)}>
                Tạo shipper mới
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <Typography.Title level={5}>Order Thao tác</Typography.Title>
          <div className="space-y-2">
            <Button
              block
              disabled={!isWaitConfirm}
              onClick={() => updateStatus('Chờ giao hàng', 'wfd', 'Xác nhận đơn hàng thành công', false)}
            >
              Xác nhận đơn hàng
            </Button>
            <Button
              block
              disabled={!isPending}
              onClick={() => updateStatus('Đang giao hàng', 'delivere', 'Đang giao hàng')}
            >
              Giao hàng
            </Button>
            <Button
              block
              disabled={!isWaitDelivery}
              onClick={() => updateStatus('Đã giao hàng', 'delivered', 'Giao hàng thành công')}
            >
              Giao hàng thành công
            </Button>
            <Button
              block
              danger
              disabled={!isWaitConfirm}
              onClick={() => updateStatus('Đã hủy', 'canceled', 'Hủy đơn hàng')}
            >
              Hủy đơn hàng
            </Button>
          </div>

          <Divider />
          <Button type="primary" block loading={isSaving} onClick={handleSaveAll} disabled={isOrderLocked}>
            Lưu toàn bộ thay đổi
          </Button>

          <div className="mt-5">
            <Typography.Title level={5}>Order Ghi chú</Typography.Title>
            <div className="text-sm bg-gray-100 p-3 rounded mb-3">Thêm ghi chú để lưu vết chỉnh sửa đơn hàng.</div>
            <textarea className="w-full border p-2 rounded" placeholder="Ghi chú admin..." rows={4} value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
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
                      <b>Khoảng xử lý:</b> {log.duration_minutes ?? 0} phút
                    </div>
                    <div>
                      <b>Ghi chú:</b> {log.note || 'Không có ghi chú'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Tạo shipper mới"
        open={isCreateShipperOpen}
        onCancel={() => setIsCreateShipperOpen(false)}
        onOk={handleCreateShipper}
        okText="Lưu shipper"
        cancelText="Hủy"
        confirmLoading={isCreatingShipper}
      >
        <Space direction="vertical" className="w-full">
          <Input placeholder="Tên shipper" value={newShipper.name} onChange={(e) => setNewShipper((prev) => ({ ...prev, name: e.target.value }))} />
          <Input placeholder="Số điện thoại" value={newShipper.phone_number} onChange={(e) => setNewShipper((prev) => ({ ...prev, phone_number: e.target.value }))} />
          <Input placeholder="Mã shipper" value={newShipper.shipper_code} onChange={(e) => setNewShipper((prev) => ({ ...prev, shipper_code: e.target.value }))} />
          <Input placeholder="Đơn vị vận chuyển" value={newShipper.shipping_company} onChange={(e) => setNewShipper((prev) => ({ ...prev, shipping_company: e.target.value }))} />
        </Space>
      </Modal>
    </div>
  );
};

export default OrderDetail;
