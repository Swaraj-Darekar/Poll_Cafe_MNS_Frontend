// Centralized menu and order management (Frontend-Only)

export const getMenu = async () => {
  // Now handled by API
  return [];
};

const ORDERS_KEY = 'table_active_orders';

export const getTableOrders = () => {
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : {};
};

export const saveTableOrders = (orders) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrderItem = (tableId, item) => {
  const allOrders = getTableOrders();
  if (!allOrders[tableId]) allOrders[tableId] = [];
  
  const newItem = {
    ...item,
    orderSnapshotId: Date.now() // Unique ID for each order item
  };
  
  allOrders[tableId].push(newItem);
  saveTableOrders(allOrders);
  return allOrders[tableId];
};

export const removeOrderItem = (tableId, orderSnapshotId) => {
  const allOrders = getTableOrders();
  if (!allOrders[tableId]) return [];
  
  allOrders[tableId] = allOrders[tableId].filter(item => item.orderSnapshotId !== orderSnapshotId);
  saveTableOrders(allOrders);
  return allOrders[tableId];
};

export const clearTableOrders = (tableId) => {
  const allOrders = getTableOrders();
  delete allOrders[tableId];
  saveTableOrders(allOrders);
};
