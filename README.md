# 📚 LibraFlow: Modern Library Management System

> **A Full-Stack MERN Application for Efficient Library Operations**

## 🚀 Overview
**LibraFlow** is a robust, production-ready Library Management System designed to streamline the day-to-day operations of modern libraries. Built with the **MERN Stack** (MongoDB, Express.js, React, Node.js), it offers a seamless experience for librarians to manage books, members, and transactions with ease.

## ✨ Key Features

### 👥 Membership Management
*   **Comprehensive Profiles**: Manage detailed member information including Aadhar/ID proofs and contact details.
*   **Lifecycle Management**: Add, update, extend, or deactivate memberships.
*   **Status Tracking**: Real-time Active/Inactive status toggles.

### 📚 Inventory Control
*   **Books & Movies**: Support for multiple media types.
*   **Smart Search**: Filter by category, author, or name instantly.
*   **Availability Tracking**: Auto-updates status (Available/Issued) based on transactions.

### 🔄 Transaction System
*   **Issue & Return**: Streamlined flows for issuing and returning items.
*   **Fine Calculation**: Automated fine generation for overdue items.
*   **History**: Complete logs of all past transactions.

### 📊 Reports & Analytics
*   **Dashboard**: Real-time stats on active members, books issued, and overdue returns.
*   **Detailed Reports**: Exportable view of Master Lists, Active Issues, and more.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, React Hook Form, Framer Motion.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: JWT (JSON Web Tokens).

## ⚡ Getting Started

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/libraflow.git
    cd libraflow
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_connection_string
    # JWT_SECRET=your_jwt_secret
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### 🔑 Default Login Credentials
You can use the following accounts to test the application:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | Full Access (Maintenance, Users, Reports) |
| **User** | `user` | `password123` | Restricted Access (Search Books, View History) |

## LOCK
*   Environment variables protected via `.gitignore`.
*   Password hashing using `bcryptjs`.
*   Protected routes enforcing Admin/User roles.

## 👨‍💻 Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

## 📄 License
This project is open-source and available under the MIT License.
