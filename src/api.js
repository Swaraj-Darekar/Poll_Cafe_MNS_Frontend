const API_BASE_URL = 'https://poll-cafe-mns-backend.onrender.com';

export const testBackendConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        console.log('Backend Connection:', data);
        return data;
    } catch (error) {
        console.error('Backend Connection Error:', error);
        return null;
    }
};

// Settings cache
let cachedSettings = null;
let lastSettingsFetch = 0;

export const getSettings = async () => {
    const now = Date.now();
    if (cachedSettings && (now - lastSettingsFetch < 60000)) {
        return cachedSettings;
    }
    const response = await fetch(`${API_BASE_URL}/settings/`);
    cachedSettings = await response.json();
    lastSettingsFetch = now;
    return cachedSettings;
};

export const updateSettings = async (settings) => {
    const response = await fetch(`${API_BASE_URL}/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    });
    return await response.json();
};

// Tables
export const getTables = async () => {
    const response = await fetch(`${API_BASE_URL}/tables/`);
    return await response.json();
};

export const updateTableStatus = async (tableId, status) => {
    const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return await response.json();
};

// Sessions
export const startSession = async (tableId, name, phone, bookingId = null) => {
    const response = await fetch(`${API_BASE_URL}/start-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            table_id: tableId, 
            customer_name: name, 
            customer_phone: phone,
            booking_id: bookingId
        })
    });
    return await response.json();
};

export const getActiveSessions = async () => {
    const response = await fetch(`${API_BASE_URL}/active-sessions`);
    return await response.json();
};

export const endSession = async (sessionId, isPreview = false) => {
    const response = await fetch(`${API_BASE_URL}/end-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, is_preview: isPreview })
    });
    return await response.json();
};

export const markPaid = async (sessionId, billingData) => {
    const response = await fetch(`${API_BASE_URL}/${sessionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData)
    });
    return await response.json();
};

// Expenses
export const getExpenses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
};

export const addExpense = async (expenseData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
};

export const deleteExpense = async (expenseId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

export const getAnalytics = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/`);
    return await response.json();
};

export const settleMonth = async (month, year, totalExpense) => {
    const response = await fetch(`${API_BASE_URL}/analytics/settle-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, total_expense: totalExpense })
    });
    return await response.json();
};

export const getSettlements = async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/settlements`);
    return await response.json();
};

export const getAvailableTables = async () => {
    const response = await fetch(`${API_BASE_URL}/bookings/available-tables`);
    return await response.json();
};

export const getBookingByPhone = async (phone) => {
    const response = await fetch(`${API_BASE_URL}/bookings/by-phone/${phone}`);
    return await response.json();
};

export const checkAvailability = async (bookingTime, duration) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/check-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_time: bookingTime, duration: duration })
    });
    return await response.json();
  } catch (error) {
    console.error("Error checking availability:", error);
    return {};
  }
};

export const bookTable = async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/book-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    });
    return await response.json();
};

export const getPendingNotifications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/pending-notifications`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching pending notifications:", error);
    return [];
  }
};

export const getUpcomingBookingsPerTable = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/upcoming-per-table`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching upcoming bookings per table:", error);
    return {};
  }
};

export const getSuperAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/stats`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching superadmin stats:", error);
    return null;
  }
};

export const addWalletMoney = async (amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/wallet/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount) })
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding wallet money:", error);
    throw error;
  }
};

export const updateSuperAdminSettings = async (commission) => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission: parseFloat(commission) })
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating superadmin settings:", error);
    throw error;
  }
};

export const settleSuperAdminMonth = async (settleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settleData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error settling superadmin month:", error);
    throw error;
  }
};

export const getSuperAdminSettlements = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/settlements`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching superadmin settlements:", error);
    return [];
  }
};

export const resetSuperAdminSystem = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/superadmin/reset-system`, {
      method: "POST"
    });
    return await response.json();
  } catch (error) {
    console.error("Error resetting superadmin system:", error);
    throw error;
  }
};

export const approveBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error("Error approving booking:", error);
    return null;
  }
};

export const rejectBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error("Error rejecting booking:", error);
    return null;
  }
};

export const clearBookingHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/bookings/history`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error("Failed to clear booking history");
    }
    return await response.json();
};

export const getBookingStatus = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/status/${bookingId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching booking status:", error);
    return null;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/all`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    return [];
  }
};

export default {
    testBackendConnection,
    getSettings,
    updateSettings,
    getTables,
    updateTableStatus,
    startSession,
    getActiveSessions,
    endSession,
    markPaid,
    checkAvailability,
    bookTable,
    getPendingNotifications,
    approveBooking,
    rejectBooking,
    clearBookingHistory,
    getUpcomingBookingsPerTable,
    getSuperAdminStats,
    updateSuperAdminSettings,
    settleSuperAdminMonth,
    getSuperAdminSettlements,
    resetSuperAdminSystem,
    addWalletMoney,
    getBookingStatus,
    getAllBookings,
    getExpenses,
    addExpense,
    deleteExpense
};
