# Pool Cafe Management System

This is a comprehensive Pool Cafe Management system with an Admin Panel for table management and a Super Admin Panel for financial controls.

## 🛠️ Prerequisites
- **Python 3.9+** (for the backend)
- **Node.js 18+** (for the frontend)
- **Supabase Account** (for the database)

---

## 🚀 How to Run Locally

### 1. Backend (FastAPI)
The backend handles the database (Supabase) and the API logic.
1. Open a terminal (Command Prompt or PowerShell).
2. Navigate to the backend folder:
   ```bash
   cd "D:\Projects\New Pool Cafe MNS\backend"
   ```
3. Install the required Python packages (only needed the first time):
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Create a file named `.env` in the `backend/` folder.
   - Add your Supabase credentials:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_KEY=your_supabase_anon_key
     ```
5. Start the server:
   ```bash
   python main.py
   ```
   *Note: When running, you should see `Uvicorn running on http://0.0.0.0:8000`.*

### 2. Frontend (React + Vite)
The frontend is the visual website you interact with.
1. Open a **new, second terminal** window.
2. Navigate to your main project folder:
   ```bash
   cd "D:\Projects\New Pool Cafe MNS"
   ```
3. Install the Node packages (only needed the first time):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Access the Application
Once both terminals are running without errors, open your web browser:
- **Public / Admin Website:** Go to [http://localhost:5173](http://localhost:5173)
- **Super Admin Panel:** Go to [http://localhost:5173/superadmin](http://localhost:5173/superadmin)

---

## 🔑 Dashboard Access

- **Admin Dashboard**: `http://localhost:5173/`
  - Used by staff to manage table sessions, expenses, and billing.
- **Super Admin Panel**: `http://localhost:5173/superadmin`
  - Used by the owner to manage the wallet, set commission rates, and perform system resets.

---

## ⚡ Key Features
- **Real-time Table Tracking**: precise timers and status updates.
- **Wallet-Based Billing**: Automated commission deduction on session payments.
- **Low-Balance Alerts**: Critical banners and system blocks when wallet balance is low (≤ ₹10).
- **Advance Bookings**: Visual indicators (slight yellow) 30 mins before advanced reservations.
- **Global Reset**: Secure system-wide data clearing for a fresh start.

---

## 🗄️ Database Setup
Ensure your Supabase database has the following tables:
- `tables`
- `sessions`
- `bookings`
- `settings`
- `expenses`
- `wallet_transactions`
- `superadmin_settlements`

*Note: Use the provided `backend/migrate_superadmin.py` or the SQL snippets provided earlier to update your schema.*
