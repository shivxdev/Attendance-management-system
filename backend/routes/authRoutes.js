const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");

const router = express.Router();


// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const {
            role,
            loginId,
            password
        } = req.body;


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (!role || !loginId || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }


        // ==========================================
        // STUDENT LOGIN
        // ==========================================

        if (role === "student") {

            const [rows] = await db.query(
                `
                SELECT
                    u.user_id,
                    u.username,
                    u.password,
                    u.role,

                    s.student_id,
                    s.university_roll_no,
                    s.student_name,
                    s.email,
                    s.phone,
                    s.year,
                    s.branch,
                    s.section,
                    s.semester,
                    s.class_id

                FROM users u

                INNER JOIN students s
                    ON u.user_id = s.user_id

                WHERE s.university_roll_no = ?
                  AND u.role = 'student'

                LIMIT 1
                `,
                [loginId]
            );


            if (rows.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid roll number or password."
                });

            }


            const user = rows[0];


            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid roll number or password."
                });

            }


            delete user.password;


            return res.status(200).json({

                success: true,

                message: "Student login successful!",

                user: user

            });

        }


        // ==========================================
        // TEACHER LOGIN
        // ==========================================

        if (role === "teacher") {

            const [rows] = await db.query(
                `
                SELECT
                    u.user_id,
                    u.username,
                    u.password,
                    u.role,

                    t.teacher_id,
                    t.teacher_code,
                    t.teacher_name,
                    t.email,
                    t.phone,
                    t.department

                FROM users u

                INNER JOIN teachers t
                    ON u.user_id = t.user_id

                WHERE t.teacher_code = ?
                  AND u.role = 'teacher'

                LIMIT 1
                `,
                [loginId]
            );


            if (rows.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid teacher code or password."
                });

            }


            const user = rows[0];


            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid teacher code or password."
                });

            }


            delete user.password;


            return res.status(200).json({

                success: true,

                message: "Teacher login successful!",

                user: user

            });

        }


        // ==========================================
        // ADMIN LOGIN
        // ==========================================

        if (role === "admin") {

            const [rows] = await db.query(
                `
                SELECT
                    user_id,
                    username,
                    password,
                    role

                FROM users

                WHERE username = ?
                  AND role = 'admin'

                LIMIT 1
                `,
                [loginId]
            );


            // --------------------------------------
            // ADMIN NOT FOUND
            // --------------------------------------

            if (rows.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid admin code or password."
                });

            }


            const user = rows[0];


            // --------------------------------------
            // PASSWORD CHECK
            // --------------------------------------

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid admin code or password."
                });

            }


            // --------------------------------------
            // DON'T SEND PASSWORD
            // --------------------------------------

            delete user.password;


            // --------------------------------------
            // ADMIN LOGIN SUCCESS
            // --------------------------------------

            return res.status(200).json({

                success: true,

                message: "Admin login successful!",

                user: user

            });

        }


        // ==========================================
        // INVALID ROLE
        // ==========================================

        return res.status(400).json({

            success: false,

            message: "Invalid user role."

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Server error during login."

        });

    }

});


module.exports = router;