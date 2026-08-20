# 🚗 SparkleWash — Smart Car Wash Management System

SparkleWash is a full-stack car wash management application designed to manage customers, vehicles, subscriptions, washing records, payments, and day-to-day operations.

This repository is my **personal development copy** of a collaborative SparkleWash project. I am a co-founder and handle technical operations and product-related work.

## ✨ Features

* 👤 Customer registration and authentication
* 🚗 Vehicle management
* 🧼 Car wash record management
* 📅 Subscription management
* 💳 Razorpay payment integration
* 📊 Customer and admin dashboards
* 👨‍🔧 Washer management
* 🛠️ Add-on services
* 📋 Customer complaints and history
* 🔐 JWT-based authentication
* ⚙️ Admin settings and management
* 📱 Responsive interface

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt

### Database

* MySQL

### Other

* Razorpay
* AWS
* Git & GitHub
* GitHub Actions / CI/CD

## 🏗️ Project Structure

```text
sparklewash-web-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
│
├── database/
│   ├── schema.sql
│   └── seeds.sql
│
└── README.md
```

## 🔄 Application Flow

```text
User
 ↓
React Frontend
 ↓
Express REST API
 ↓
MySQL Database
```

Authentication is handled using JWT, while payment functionality is integrated with Razorpay.

## 💻 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/RohitM2005/sparklewash-web-app.git
cd sparklewash-web-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a local `.env` file using:

```text
backend/.env.example
```

Add your local MySQL configuration and other required development variables.

Then start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite in your browser.

## 🗄️ Database

The application uses MySQL.

The backend includes database setup and migration logic. SQL files are also available in:

```text
database/
├── schema.sql
└── seeds.sql
```

For local development, use a **local MySQL database** and never use production database credentials.

## 🔐 Environment Variables

Environment variable examples are provided in:

```text
backend/.env.example
frontend/.env.example
```

Never commit actual `.env` files or secret credentials.

## 👨‍💻 My Role

I am a **co-founder of SparkleWash** and handle technical operations and product-related work.

This application was developed collaboratively with the team. This repository represents my personal development copy and should not be considered the official production repository.

## 📚 What I'm Learning From This Project

Working on SparkleWash has helped me understand practical full-stack development, including:

* React application structure
* REST API development
* Authentication and authorization
* MySQL database design
* Frontend-backend integration
* Payment integration
* Git/GitHub workflows
* AWS deployment
* CI/CD
* Debugging a real application

## 🚀 Future Improvements

Some areas I plan to explore and improve as I continue working with the project:

* Better testing coverage
* Performance improvements
* UI/UX improvements
* More detailed analytics
* Better error handling
* Additional automation

## 📌 Note

SparkleWash is a collaborative project. The production application and production codebase are maintained separately from this personal development repository.
