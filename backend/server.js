const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = 5000;


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =========================================
// API ROUTES
// =========================================

app.use("/api/auth", authRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/test-attendance-route", (req, res) => {
    res.json({
        success: true,
        message: "Attendance route is working"
    });
});


// =========================================
// TEST ROUTE
// =========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "Attendance Management System Backend is running!"
    });

});


// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {

    console.log(
        `🚀 Server running at http://localhost:${PORT}`
    );

});