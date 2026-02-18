# How to Run Your Task Management App

Your project has **TWO parts** that need to run separately:
1. **Backend API** (runs on port 4000)
2. **Frontend** (runs on port 3000)

## 🚀 Quick Start

### Option 1: Run Both in Separate Terminals

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\bhatn\Downloads\mini notion"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\bhatn\Downloads\mini notion\task-management-frontend"
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## 📋 First Time Setup

If you haven't installed dependencies yet:

**Backend:**
```powershell
cd "c:\Users\bhatn\Downloads\mini notion"
npm install
```

**Frontend:**
```powershell
cd "c:\Users\bhatn\Downloads\mini notion\task-management-frontend"
npm install
```

---

## ⚙️ What's Already Configured

✅ Backend `.env` file (PostgreSQL connection)
✅ Frontend `.env.local` file (API URL)
✅ Database migrations applied
✅ Axios interceptor with token refresh

---

## 🔍 Troubleshooting

### "Page not found"
- ✅ **Solution**: You're only running the backend. You need to also run the frontend!

### "Cannot connect to API"
- ✅ **Solution**: Make sure the backend is running on port 4000

### Database connection error
- ✅ **Solution**: Make sure PostgreSQL is running and the password in `.env` is correct

---

## 📱 Available Pages

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Task management (requires login)

---

## 🛑 To Stop Servers

Press `Ctrl+C` in each terminal window.
