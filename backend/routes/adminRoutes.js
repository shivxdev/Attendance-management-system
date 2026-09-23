const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");

const router = express.Router();


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/dashboard/:adminId", async (req, res) => {

    try {

        const { adminId } = req.params;

        const [admin] = await db.query(
            `
            SELECT
                user_id,
                username,
                role
            FROM users
            WHERE user_id = ?
              AND role = 'admin'
            LIMIT 1
            `,
            [adminId]
        );

        if (admin.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });

        }

        const [teacherCount] = await db.query(
            `SELECT COUNT(*) AS total FROM teachers`
        );

        const [studentCount] = await db.query(
            `SELECT COUNT(*) AS total FROM students`
        );

        const [classCount] = await db.query(
            `SELECT COUNT(*) AS total FROM classes`
        );

        const [subjectCount] = await db.query(
            `SELECT COUNT(*) AS total FROM subjects`
        );

        return res.status(200).json({

            success: true,

            admin: admin[0],

            statistics: {

                teachers:
                    Number(teacherCount[0].total),

                students:
                    Number(studentCount[0].total),

                classes:
                    Number(classCount[0].total),

                subjects:
                    Number(subjectCount[0].total)

            }

        });

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while loading admin dashboard."

        });

    }

});


// =====================================================
// TEACHER MANAGEMENT
// =====================================================


// -----------------------------------------------------
// GET ALL TEACHERS
// GET /api/admin/teachers
// -----------------------------------------------------

router.get("/teachers", async (req, res) => {

    try {

        const [teachers] = await db.query(
            `
            SELECT
                teacher_id,
                user_id,
                teacher_code,
                teacher_name,
                email,
                phone,
                department,
                created_at
            FROM teachers
            ORDER BY teacher_name
            `
        );

        return res.status(200).json({

            success: true,

            teachers: teachers

        });

    } catch (error) {

        console.error(
            "Get teachers error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching teachers."

        });

    }

});


// -----------------------------------------------------
// ADD TEACHER
// POST /api/admin/teachers
// -----------------------------------------------------

router.post("/teachers", async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        const {

            teacherCode,
            teacherName,
            email,
            phone,
            department,
            username,
            password

        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !teacherCode ||
            !teacherName ||
            !email ||
            !username ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Teacher code, name, email, username and password are required."

            });

        }


        // ==========================================
        // CHECK USERNAME
        // ==========================================

        const [existingUser] =
            await db.query(
                `
                SELECT user_id
                FROM users
                WHERE username = ?
                LIMIT 1
                `,
                [username]
            );


        if (existingUser.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Username already exists."

            });

        }


        // ==========================================
        // CHECK TEACHER CODE
        // ==========================================

        const [existingCode] =
            await db.query(
                `
                SELECT teacher_id
                FROM teachers
                WHERE teacher_code = ?
                LIMIT 1
                `,
                [teacherCode]
            );


        if (existingCode.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Teacher code already exists."

            });

        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const [existingEmail] =
            await db.query(
                `
                SELECT teacher_id
                FROM teachers
                WHERE email = ?
                LIMIT 1
                `,
                [email]
            );


        if (existingEmail.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Teacher email already exists."

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ==========================================
        // START TRANSACTION
        // ==========================================

        await connection.beginTransaction();


        // ==========================================
        // CREATE USER
        // ==========================================

        const [userResult] =
            await connection.query(
                `
                INSERT INTO users
                (
                    username,
                    password,
                    role
                )
                VALUES (?, ?, 'teacher')
                `,
                [
                    username,
                    hashedPassword
                ]
            );


        const userId =
            userResult.insertId;


        // ==========================================
        // CREATE TEACHER
        // ==========================================

        const [teacherResult] =
            await connection.query(
                `
                INSERT INTO teachers
                (
                    user_id,
                    teacher_code,
                    teacher_name,
                    email,
                    phone,
                    department
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    teacherCode,
                    teacherName,
                    email,
                    phone || null,
                    department || null
                ]
            );


        // ==========================================
        // COMMIT
        // ==========================================

        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Teacher created successfully.",

            teacher: {

                teacher_id:
                    teacherResult.insertId,

                user_id:
                    userId,

                teacher_code:
                    teacherCode,

                teacher_name:
                    teacherName,

                email:
                    email,

                phone:
                    phone || null,

                department:
                    department || null

            }

        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Teacher creation error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating teacher."

        });

    } finally {

        connection.release();

    }

});


// -----------------------------------------------------
// DELETE TEACHER
// DELETE /api/admin/teachers/:teacherId
// -----------------------------------------------------

router.delete(
    "/teachers/:teacherId",
    async (req, res) => {

        try {

            const { teacherId } =
                req.params;


            const [teacher] =
                await db.query(
                    `
                    SELECT user_id
                    FROM teachers
                    WHERE teacher_id = ?
                    LIMIT 1
                    `,
                    [teacherId]
                );


            if (teacher.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Teacher not found."

                });

            }


            const userId =
                teacher[0].user_id;


            await db.query(
                `
                DELETE FROM teachers
                WHERE teacher_id = ?
                `,
                [teacherId]
            );


            if (userId) {

                await db.query(
                    `
                    DELETE FROM users
                    WHERE user_id = ?
                      AND role = 'teacher'
                    `,
                    [userId]
                );

            }


            return res.status(200).json({

                success: true,

                message:
                    "Teacher deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete teacher error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting teacher."

            });

        }

    }
);


// =====================================================
// STUDENT MANAGEMENT
// =====================================================


// -----------------------------------------------------
// GET ALL STUDENTS
// GET /api/admin/students
// -----------------------------------------------------

router.get("/students", async (req, res) => {

    try {

        const [students] =
            await db.query(
                `
                SELECT
                    student_id,
                    user_id,
                    university_roll_no,
                    student_name,
                    email,
                    phone,
                    year,
                    branch,
                    section,
                    semester,
                    class_id,
                    created_at
                FROM students
                ORDER BY student_id DESC
                `
            );


        return res.status(200).json({

            success: true,

            students:
                students

        });

    } catch (error) {

        console.error(
            "Get students error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching students."

        });

    }

});


// -----------------------------------------------------
// ADD STUDENT
// POST /api/admin/students
// -----------------------------------------------------

router.post("/students", async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        // =================================================
        // IMPORTANT
        // FRONTEND IS SENDING snake_case
        // BACKEND ALSO ACCEPTS camelCase
        // =================================================

        const universityRollNo =
            req.body.universityRollNo ??
            req.body.university_roll_no;

        const studentName =
            req.body.studentName ??
            req.body.student_name;

        const email =
            req.body.email;

        const phone =
            req.body.phone;

        const year =
            req.body.year;

        const branch =
            req.body.branch;

        const section =
            req.body.section;

        const semester =
            req.body.semester;

        const classId =
            req.body.classId ??
            req.body.class_id;

        const username =
            req.body.username;

        const password =
            req.body.password;


        console.log(
            "ADD STUDENT REQUEST:",
            {
                universityRollNo,
                studentName,
                email,
                phone,
                year,
                branch,
                section,
                semester,
                classId,
                username,
                passwordProvided:
                    Boolean(password)
            }
        );


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !universityRollNo ||
            !studentName ||
            !email ||
            year === undefined ||
            year === null ||
            year === "" ||
            !branch ||
            !section ||
            semester === undefined ||
            semester === null ||
            semester === "" ||
            !classId ||
            !username ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Roll number, name, email, year, branch, section, semester, class, username and password are required."

            });

        }


        // =================================================
        // CLEAN VALUES
        // =================================================

        const cleanRollNo =
            String(universityRollNo).trim();

        const cleanStudentName =
            String(studentName).trim();

        const cleanEmail =
            String(email).trim();

        const cleanBranch =
            String(branch).trim();

        const cleanSection =
            String(section).trim();

        const cleanClassId =
            String(classId).trim();

        const cleanUsername =
            String(username).trim();

        const numericYear =
            Number(year);

        const numericSemester =
            Number(semester);


        // =================================================
        // NUMERIC VALIDATION
        // =================================================

        if (
            !Number.isFinite(numericYear) ||
            !Number.isFinite(numericSemester)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Year and semester must be valid numbers."

            });

        }


        // =================================================
        // CHECK USERNAME
        // =================================================

        const [existingUser] =
            await connection.query(
                `
                SELECT user_id
                FROM users
                WHERE username = ?
                LIMIT 1
                `,
                [cleanUsername]
            );


        if (existingUser.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Username already exists."

            });

        }


        // =================================================
        // CHECK ROLL NUMBER
        // =================================================

        const [existingRoll] =
            await connection.query(
                `
                SELECT student_id
                FROM students
                WHERE university_roll_no = ?
                LIMIT 1
                `,
                [cleanRollNo]
            );


        if (existingRoll.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "University roll number already exists."

            });

        }


        // =================================================
        // CHECK EMAIL
        // =================================================

        const [existingEmail] =
            await connection.query(
                `
                SELECT student_id
                FROM students
                WHERE email = ?
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (existingEmail.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Student email already exists."

            });

        }


        // =================================================
        // CHECK CLASS
        // =================================================

        const [classData] =
            await connection.query(
                `
                SELECT
                    class_id,
                    year,
                    branch,
                    section,
                    semester
                FROM classes
                WHERE class_id = ?
                LIMIT 1
                `,
                [cleanClassId]
            );


        if (classData.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Class not found. Please create the class first."

            });

        }


        const selectedClass =
            classData[0];


        // =================================================
        // VERIFY CLASS DETAILS
        // =================================================

        const classYear =
            Number(selectedClass.year);

        const classSemester =
            Number(selectedClass.semester);

        const classBranch =
            String(selectedClass.branch).trim();

        const classSection =
            String(selectedClass.section).trim();


        if (
            classYear !== numericYear ||
            classBranch !== cleanBranch ||
            classSection !== cleanSection ||
            classSemester !== numericSemester
        ) {

            console.log(
                "CLASS MISMATCH:",
                {
                    student: {
                        year: numericYear,
                        branch: cleanBranch,
                        section: cleanSection,
                        semester: numericSemester
                    },

                    class: {
                        year: classYear,
                        branch: classBranch,
                        section: classSection,
                        semester: classSemester
                    }
                }
            );


            return res.status(400).json({

                success: false,

                message:
                    "Student details do not match the selected class.",

                details: {

                    student: {

                        year:
                            numericYear,

                        branch:
                            cleanBranch,

                        section:
                            cleanSection,

                        semester:
                            numericSemester

                    },

                    class: {

                        year:
                            classYear,

                        branch:
                            classBranch,

                        section:
                            classSection,

                        semester:
                            classSemester

                    }

                }

            });

        }


        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                String(password),
                10
            );


        // =================================================
        // START TRANSACTION
        // =================================================

        await connection.beginTransaction();


        // =================================================
        // CREATE USER
        // =================================================

        const [userResult] =
            await connection.query(
                `
                INSERT INTO users
                (
                    username,
                    password,
                    role
                )
                VALUES (?, ?, 'student')
                `,
                [
                    cleanUsername,
                    hashedPassword
                ]
            );


        const userId =
            userResult.insertId;


        // =================================================
        // CREATE STUDENT
        // =================================================

        const [studentResult] =
            await connection.query(
                `
                INSERT INTO students
                (
                    user_id,
                    university_roll_no,
                    student_name,
                    email,
                    phone,
                    year,
                    branch,
                    section,
                    semester,
                    class_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [

                    userId,

                    cleanRollNo,

                    cleanStudentName,

                    cleanEmail,

                    phone
                        ? String(phone).trim()
                        : null,

                    numericYear,

                    cleanBranch,

                    cleanSection,

                    numericSemester,

                    cleanClassId

                ]
            );


        // =================================================
        // COMMIT
        // =================================================

        await connection.commit();


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Student created successfully.",

            student: {

                student_id:
                    studentResult.insertId,

                user_id:
                    userId,

                university_roll_no:
                    cleanRollNo,

                student_name:
                    cleanStudentName,

                email:
                    cleanEmail,

                phone:
                    phone
                        ? String(phone).trim()
                        : null,

                year:
                    numericYear,

                branch:
                    cleanBranch,

                section:
                    cleanSection,

                semester:
                    numericSemester,

                class_id:
                    cleanClassId,

                username:
                    cleanUsername

            }

        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Student creation error:",
            error
        );


        // =================================================
        // MYSQL DUPLICATE ERROR
        // =================================================

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                success: false,

                message:
                    "Duplicate data found. Username, roll number or email may already exist."

            });

        }


        // =================================================
        // FOREIGN KEY ERROR
        // =================================================

        if (error.code === "ER_NO_REFERENCED_ROW_2") {

            return res.status(400).json({

                success: false,

                message:
                    "Selected class does not exist."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error while creating student."

        });

    } finally {

        connection.release();

    }

});


// -----------------------------------------------------
// DELETE STUDENT
// DELETE /api/admin/students/:studentId
// -----------------------------------------------------

router.delete(
    "/students/:studentId",
    async (req, res) => {

        const connection =
            await db.getConnection();

        try {

            const { studentId } =
                req.params;


            // ==========================================
            // FIND STUDENT
            // ==========================================

            const [student] =
                await connection.query(
                    `
                    SELECT
                        user_id
                    FROM students
                    WHERE student_id = ?
                    LIMIT 1
                    `,
                    [studentId]
                );


            if (student.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            const userId =
                student[0].user_id;


            // ==========================================
            // START TRANSACTION
            // ==========================================

            await connection.beginTransaction();


            // ==========================================
            // DELETE ATTENDANCE
            // ==========================================

            await connection.query(
                `
                DELETE FROM attendance
                WHERE student_id = ?
                `,
                [studentId]
            );


            // ==========================================
            // DELETE STUDENT
            // ==========================================

            await connection.query(
                `
                DELETE FROM students
                WHERE student_id = ?
                `,
                [studentId]
            );


            // ==========================================
            // DELETE USER
            // ==========================================

            if (userId) {

                await connection.query(
                    `
                    DELETE FROM users
                    WHERE user_id = ?
                      AND role = 'student'
                    `,
                    [userId]
                );

            }


            await connection.commit();


            return res.status(200).json({

                success: true,

                message:
                    "Student deleted successfully."

            });

        } catch (error) {

            await connection.rollback();

            console.error(
                "Delete student error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting student."

            });

        } finally {

            connection.release();

        }

    }
);


// =====================================================
// CLASS MANAGEMENT
// =====================================================


// -----------------------------------------------------
// GET ALL CLASSES
// GET /api/admin/classes
// -----------------------------------------------------

router.get("/classes", async (req, res) => {

    try {

        const [classes] =
            await db.query(
                `
                SELECT
                    class_id,
                    year,
                    branch,
                    section,
                    semester,
                    created_at
                FROM classes
                ORDER BY year, branch, section
                `
            );


        return res.status(200).json({

            success: true,

            classes:
                classes

        });

    } catch (error) {

        console.error(
            "Get classes error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching classes."

        });

    }

});


// -----------------------------------------------------
// ADD CLASS
// POST /api/admin/classes
// -----------------------------------------------------

router.post("/classes", async (req, res) => {

    try {

        const {

            classId,
            year,
            branch,
            section,
            semester

        } = req.body;


        if (
            !classId ||
            !year ||
            !branch ||
            !section ||
            !semester
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Class ID, year, branch, section and semester are required."

            });

        }


        const [existingClass] =
            await db.query(
                `
                SELECT class_id
                FROM classes
                WHERE class_id = ?
                LIMIT 1
                `,
                [classId]
            );


        if (existingClass.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Class ID already exists."

            });

        }


        await db.query(
            `
            INSERT INTO classes
            (
                class_id,
                year,
                branch,
                section,
                semester
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                classId,
                Number(year),
                branch,
                section,
                Number(semester)
            ]
        );


        return res.status(201).json({

            success: true,

            message:
                "Class created successfully.",

            class: {

                class_id:
                    classId,

                year:
                    Number(year),

                branch:
                    branch,

                section:
                    section,

                semester:
                    Number(semester)

            }

        });

    } catch (error) {

        console.error(
            "Class creation error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating class."

        });

    }

});


// -----------------------------------------------------
// DELETE CLASS
// DELETE /api/admin/classes/:classId
// -----------------------------------------------------

router.delete(
    "/classes/:classId",
    async (req, res) => {

        try {

            const { classId } =
                req.params;


            const [existingClass] =
                await db.query(
                    `
                    SELECT class_id
                    FROM classes
                    WHERE class_id = ?
                    LIMIT 1
                    `,
                    [classId]
                );


            if (existingClass.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Class not found."

                });

            }


            await db.query(
                `
                DELETE FROM classes
                WHERE class_id = ?
                `,
                [classId]
            );


            return res.status(200).json({

                success: true,

                message:
                    "Class deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete class error:",
                error
            );


            if (
                error.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This class cannot be deleted because students or other records are linked to it."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting class."

            });

        }

    }
);


// =====================================================
// SUBJECT MANAGEMENT
// =====================================================


// -----------------------------------------------------
// GET ALL SUBJECTS
// GET /api/admin/subjects
// -----------------------------------------------------

router.get("/subjects", async (req, res) => {

    try {

        const [subjects] = await db.query(`
            SELECT
                subject_id,
                subject_code,
                subject_name,
                created_at
            FROM subjects
            ORDER BY subject_name ASC
        `);

        return res.status(200).json({
            success: true,
            subjects: subjects
        });

    } catch (error) {

        console.error("GET SUBJECTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching subjects."
        });

    }

});


// -----------------------------------------------------
// ADD SUBJECT
// POST /api/admin/subjects
// -----------------------------------------------------

router.post("/subjects", async (req, res) => {

    try {

        // Frontend sends:
        // {
        //     subjectCode: "...",
        //     subjectName: "..."
        // }

        const subjectCode =
            req.body.subjectCode ??
            req.body.subject_code;

        const subjectName =
            req.body.subjectName ??
            req.body.subject_name;


        console.log("ADD SUBJECT REQUEST:", {
            subjectCode,
            subjectName
        });


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            subjectCode === undefined ||
            subjectCode === null ||
            subjectName === undefined ||
            subjectName === null
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Subject code and subject name are required."
            });

        }


        // ==========================================
        // CLEAN VALUES
        // ==========================================

        const cleanCode =
            String(subjectCode).trim();

        const cleanName =
            String(subjectName).trim();


        if (!cleanCode || !cleanName) {

            return res.status(400).json({
                success: false,
                message:
                    "Subject code and subject name cannot be empty."
            });

        }


        // ==========================================
        // CHECK SUBJECT CODE
        // ==========================================

        const [codeExists] =
            await db.query(
                `
                SELECT subject_id
                FROM subjects
                WHERE subject_code = ?
                LIMIT 1
                `,
                [cleanCode]
            );


        if (codeExists.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Subject code already exists."
            });

        }


        // ==========================================
        // CHECK SUBJECT NAME
        // ==========================================

        const [nameExists] =
            await db.query(
                `
                SELECT subject_id
                FROM subjects
                WHERE subject_name = ?
                LIMIT 1
                `,
                [cleanName]
            );


        if (nameExists.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Subject name already exists."
            });

        }


        // ==========================================
        // INSERT SUBJECT
        // ==========================================

        const [result] =
            await db.query(
                `
                INSERT INTO subjects
                (
                    subject_code,
                    subject_name
                )
                VALUES (?, ?)
                `,
                [
                    cleanCode,
                    cleanName
                ]
            );


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Subject created successfully.",

            subject: {

                subject_id:
                    result.insertId,

                subject_code:
                    cleanCode,

                subject_name:
                    cleanName

            }

        });

    } catch (error) {

        // ==========================================
        // IMPORTANT:
        // SHOW REAL MYSQL ERROR IN TERMINAL
        // ==========================================

        console.error(
            "ADD SUBJECT MYSQL ERROR:"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "SQL Message:",
            error.sqlMessage
        );


        // ==========================================
        // DUPLICATE
        // ==========================================

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                success: false,

                message:
                    "Subject code or subject name already exists."

            });

        }


        // ==========================================
        // DATA TOO LONG
        // ==========================================

        if (error.code === "ER_DATA_TOO_LONG") {

            return res.status(400).json({

                success: false,

                message:
                    "Subject code or subject name is too long."

            });

        }


        // ==========================================
        // NULL / INVALID COLUMN
        // ==========================================

        if (error.code === "ER_BAD_NULL_ERROR") {

            return res.status(400).json({

                success: false,

                message:
                    "A required subject database field is missing."

            });

        }


        // ==========================================
        // GENERAL SERVER ERROR
        // ==========================================

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating subject."

        });

    }

});


// -----------------------------------------------------
// DELETE SUBJECT
// DELETE /api/admin/subjects/:subjectId
// -----------------------------------------------------

router.delete(
    "/subjects/:subjectId",
    async (req, res) => {

        try {

            const { subjectId } =
                req.params;


            // ==========================================
            // CHECK SUBJECT
            // ==========================================

            const [subject] =
                await db.query(
                    `
                    SELECT subject_id
                    FROM subjects
                    WHERE subject_id = ?
                    LIMIT 1
                    `,
                    [subjectId]
                );


            if (subject.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Subject not found."

                });

            }


            // ==========================================
            // DELETE SUBJECT
            // ==========================================

            await db.query(
                `
                DELETE FROM subjects
                WHERE subject_id = ?
                `,
                [subjectId]
            );


            return res.status(200).json({

                success: true,

                message:
                    "Subject deleted successfully."

            });

        } catch (error) {

            console.error(
                "DELETE SUBJECT ERROR:",
                error
            );


            // ==========================================
            // FOREIGN KEY
            // ==========================================

            if (
                error.code === "ER_ROW_IS_REFERENCED_2" ||
                error.code === "ER_ROW_IS_REFERENCED"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This subject cannot be deleted because it is already assigned to a class or used in attendance."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting subject."

            });

        }

    }
);

// =====================================================
// TEACHER ASSIGNMENT MANAGEMENT
// =====================================================


// -----------------------------------------------------
// GET ALL ASSIGNMENTS
// GET /api/admin/assignments
// -----------------------------------------------------

router.get("/assignments", async (req, res) => {

    try {

        const [assignments] =
            await db.query(
                `
                SELECT

                    cs.id,

                    cs.class_id,

                    cs.subject_id,

                    cs.teacher_id,

                    t.teacher_code,

                    t.teacher_name,

                    sub.subject_code,

                    sub.subject_name

                FROM class_subjects cs

                INNER JOIN teachers t
                    ON cs.teacher_id = t.teacher_id

                INNER JOIN subjects sub
                    ON cs.subject_id = sub.subject_id

                INNER JOIN classes c
                    ON cs.class_id = c.class_id

                ORDER BY
                    t.teacher_name,
                    c.class_id,
                    sub.subject_name
                `
            );


        return res.status(200).json({

            success: true,

            assignments:
                assignments

        });

    } catch (error) {

        console.error(
            "Get assignments error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching assignments."

        });

    }

});


// -----------------------------------------------------
// CREATE ASSIGNMENT
// POST /api/admin/assignments
// -----------------------------------------------------

router.post("/assignments", async (req, res) => {

    try {

        const {

            teacherId,
            classId,
            subjectId

        } = req.body;


        if (
            !teacherId ||
            !classId ||
            !subjectId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Teacher, class and subject are required."

            });

        }


        const [teacher] =
            await db.query(
                `
                SELECT teacher_id
                FROM teachers
                WHERE teacher_id = ?
                LIMIT 1
                `,
                [teacherId]
            );


        if (teacher.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Teacher not found."

            });

        }


        const [classData] =
            await db.query(
                `
                SELECT class_id
                FROM classes
                WHERE class_id = ?
                LIMIT 1
                `,
                [classId]
            );


        if (classData.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Class not found."

            });

        }


        const [subject] =
            await db.query(
                `
                SELECT subject_id
                FROM subjects
                WHERE subject_id = ?
                LIMIT 1
                `,
                [subjectId]
            );


        if (subject.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Subject not found."

            });

        }


        const [existingAssignment] =
            await db.query(
                `
                SELECT id
                FROM class_subjects
                WHERE class_id = ?
                  AND subject_id = ?
                LIMIT 1
                `,
                [
                    classId,
                    subjectId
                ]
            );


        if (existingAssignment.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "This subject is already assigned to this class."

            });

        }


        const [result] =
            await db.query(
                `
                INSERT INTO class_subjects
                (
                    class_id,
                    subject_id,
                    teacher_id
                )
                VALUES (?, ?, ?)
                `,
                [
                    classId,
                    subjectId,
                    teacherId
                ]
            );


        return res.status(201).json({

            success: true,

            message:
                "Teacher assigned successfully.",

            assignment: {

                id:
                    result.insertId,

                class_id:
                    classId,

                subject_id:
                    Number(subjectId),

                teacher_id:
                    Number(teacherId)

            }

        });

    } catch (error) {

        console.error(
            "Create assignment error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating teacher assignment."

        });

    }

});


// -----------------------------------------------------
// DELETE ASSIGNMENT
// DELETE /api/admin/assignments/:id
// -----------------------------------------------------

router.delete(
    "/assignments/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const [assignment] =
                await db.query(
                    `
                    SELECT id
                    FROM class_subjects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );


            if (assignment.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Assignment not found."

                });

            }


            await db.query(
                `
                DELETE FROM class_subjects
                WHERE id = ?
                `,
                [id]
            );


            return res.status(200).json({

                success: true,

                message:
                    "Teacher assignment removed successfully."

            });

        } catch (error) {

            console.error(
                "Delete assignment error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting teacher assignment."

            });

        }

    }
);


// =====================================================
// ADMIN ATTENDANCE OVERVIEW
// =====================================================


// -----------------------------------------------------
// GET ATTENDANCE OVERVIEW
// GET /api/admin/attendance-overview
// -----------------------------------------------------

router.get(
    "/attendance-overview",
    async (req, res) => {

        try {

            // ==========================================
            // OVERALL ATTENDANCE SUMMARY
            // ==========================================

            const [summary] =
                await db.query(`

                    SELECT

                        COUNT(
                            DISTINCT l.lecture_id
                        ) AS totalLectures,

                        COUNT(
                            DISTINCT a.student_id
                        ) AS totalStudents,

                        SUM(
                            CASE
                                WHEN a.attendance_status = 'P'
                                THEN 1
                                ELSE 0
                            END
                        ) AS totalPresent,

                        SUM(
                            CASE
                                WHEN a.attendance_status = 'A'
                                THEN 1
                                ELSE 0
                            END
                        ) AS totalAbsent

                    FROM lectures l

                    LEFT JOIN attendance a
                        ON l.lecture_id =
                           a.lecture_id

                `);


            // ==========================================
            // SUBJECT / CLASS WISE
            // ==========================================

            const [records] =
                await db.query(`

                    SELECT

                        c.class_id,

                        c.year,

                        c.branch,

                        c.section,

                        c.semester,

                        sub.subject_id,

                        sub.subject_code,

                        sub.subject_name,

                        COUNT(
                            DISTINCT l.lecture_id
                        ) AS totalLectures,

                        COUNT(
                            CASE
                                WHEN a.attendance_status = 'P'
                                THEN 1
                            END
                        ) AS presentLectures,

                        COUNT(
                            CASE
                                WHEN a.attendance_status = 'A'
                                THEN 1
                            END
                        ) AS absentLectures

                    FROM classes c

                    INNER JOIN lectures l
                        ON c.class_id =
                           l.class_id

                    INNER JOIN subjects sub
                        ON l.subject_id =
                           sub.subject_id

                    LEFT JOIN attendance a
                        ON l.lecture_id =
                           a.lecture_id

                    GROUP BY

                        c.class_id,
                        c.year,
                        c.branch,
                        c.section,
                        c.semester,

                        sub.subject_id,
                        sub.subject_code,
                        sub.subject_name

                    ORDER BY

                        c.year,
                        c.branch,
                        c.section,
                        sub.subject_name

                `);


            // ==========================================
            // CALCULATE PERCENTAGE
            // ==========================================

            records.forEach(record => {

                const present =
                    Number(
                        record.presentLectures
                    );

                const absent =
                    Number(
                        record.absentLectures
                    );

                const total =
                    present + absent;


                if (total > 0) {

                    record.attendancePercentage =
                        Number(
                            (
                                present /
                                total *
                                100
                            ).toFixed(2)
                        );

                } else {

                    record.attendancePercentage =
                        0;

                }

            });


            // ==========================================
            // OVERALL VALUES
            // ==========================================

            const totalLectures =
                Number(
                    summary[0].totalLectures || 0
                );

            const totalStudents =
                Number(
                    summary[0].totalStudents || 0
                );

            const totalPresent =
                Number(
                    summary[0].totalPresent || 0
                );

            const totalAbsent =
                Number(
                    summary[0].totalAbsent || 0
                );


            const totalAttendanceEntries =
                totalPresent +
                totalAbsent;


            let overallAttendance =
                0;


            if (
                totalAttendanceEntries > 0
            ) {

                overallAttendance =
                    Number(
                        (
                            totalPresent /
                            totalAttendanceEntries *
                            100
                        ).toFixed(2)
                    );

            }


            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({

                success: true,

                summary: {

                    totalLectures:
                        totalLectures,

                    totalStudents:
                        totalStudents,

                    totalPresent:
                        totalPresent,

                    totalAbsent:
                        totalAbsent,

                    overallAttendance:
                        overallAttendance

                },

                records:
                    records

            });

        } catch (error) {

            console.error(
                "Admin attendance overview error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching attendance overview."

            });

        }

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;