const express = require("express");

const db = require("../config/db");

const {
    updateAttendanceExcel
} = require("../services/excelService");

const router = express.Router();


// =====================================================
// GET STUDENT ATTENDANCE
// =====================================================

router.get(
    "/student/:studentId",
    async (req, res) => {

        try {

            const { studentId } = req.params;


            const [attendance] =
                await db.query(
                    `
                    SELECT

                        sub.subject_id,

                        sub.subject_code,

                        sub.subject_name,

                        COUNT(
                            DISTINCT l.lecture_id
                        ) AS total_lectures,

                        COUNT(
                            CASE
                                WHEN a.attendance_status = 'P'
                                THEN 1
                            END
                        ) AS present_lectures,

                        COUNT(
                            CASE
                                WHEN a.attendance_status = 'A'
                                THEN 1
                            END
                        ) AS absent_lectures

                    FROM attendance a

                    INNER JOIN lectures l
                        ON a.lecture_id = l.lecture_id

                    INNER JOIN subjects sub
                        ON l.subject_id = sub.subject_id

                    WHERE a.student_id = ?

                    GROUP BY

                        sub.subject_id,
                        sub.subject_code,
                        sub.subject_name

                    ORDER BY
                        sub.subject_name
                    `,
                    [studentId]
                );


            let totalLectures = 0;
            let presentLectures = 0;
            let absentLectures = 0;


            attendance.forEach(subject => {

                totalLectures +=
                    Number(subject.total_lectures);

                presentLectures +=
                    Number(subject.present_lectures);

                absentLectures +=
                    Number(subject.absent_lectures);


                if (
                    Number(subject.total_lectures) > 0
                ) {

                    subject.attendance_percentage =
                        (
                            Number(subject.present_lectures) /
                            Number(subject.total_lectures)
                        ) * 100;

                } else {

                    subject.attendance_percentage = 0;

                }

            });


            let overallAttendance = 0;


            if (totalLectures > 0) {

                overallAttendance =
                    (
                        presentLectures /
                        totalLectures
                    ) * 100;

            }


            return res.status(200).json({

                success: true,

                summary: {

                    totalLectures,

                    presentLectures,

                    absentLectures,

                    overallAttendance:
                        Number(
                            overallAttendance.toFixed(2)
                        )

                },

                subjects:
                    attendance

            });


        } catch (error) {

            console.error(
                "Attendance fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching attendance."

            });

        }

    }
);


// =====================================================
// GET TEACHER ASSIGNMENTS
// =====================================================

router.get(
    "/teacher/:teacherId/assignments",
    async (req, res) => {

        try {

            const { teacherId } = req.params;


            const [assignments] =
                await db.query(
                    `
                    SELECT

                        cs.id,

                        cs.class_id,

                        c.year,

                        c.branch,

                        c.section,

                        c.semester,

                        sub.subject_id,

                        sub.subject_code,

                        sub.subject_name,

                        cs.teacher_id

                    FROM class_subjects cs

                    INNER JOIN classes c
                        ON cs.class_id = c.class_id

                    INNER JOIN subjects sub
                        ON cs.subject_id = sub.subject_id

                    WHERE cs.teacher_id = ?

                    ORDER BY
                        sub.subject_name
                    `,
                    [teacherId]
                );


            return res.status(200).json({

                success: true,

                assignments

            });


        } catch (error) {

            console.error(
                "Teacher assignment fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching teacher assignments."

            });

        }

    }
);


// =====================================================
// CREATE LECTURE
// =====================================================

router.post(
    "/lectures",
    async (req, res) => {

        try {

            const {

                class_id,
                subject_id,
                teacher_id

            } = req.body;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (
                !class_id ||
                !subject_id ||
                !teacher_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Class, subject and teacher are required."

                });

            }


            // ==========================================
            // CHECK TEACHER ASSIGNMENT
            // ==========================================

            const [assignment] =
                await db.query(
                    `
                    SELECT id

                    FROM class_subjects

                    WHERE class_id = ?
                      AND subject_id = ?
                      AND teacher_id = ?

                    LIMIT 1
                    `,
                    [
                        class_id,
                        subject_id,
                        teacher_id
                    ]
                );


            if (assignment.length === 0) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Teacher is not assigned to this class and subject."

                });

            }


            // ==========================================
            // GET NEXT LECTURE NUMBER
            // ==========================================

            const [lastLecture] =
                await db.query(
                    `
                    SELECT
                        MAX(lecture_number) AS last_lecture

                    FROM lectures

                    WHERE class_id = ?
                      AND subject_id = ?
                    `,
                    [
                        class_id,
                        subject_id
                    ]
                );


            const lectureNumber =
                Number(
                    lastLecture[0].last_lecture || 0
                ) + 1;


            // ==========================================
            // CURRENT DATE
            // ==========================================

            const lectureDate =
                new Date()
                    .toISOString()
                    .split("T")[0];


            // ==========================================
            // INSERT LECTURE
            // ==========================================

            const [result] =
                await db.query(
                    `
                    INSERT INTO lectures
                    (
                        class_id,
                        subject_id,
                        teacher_id,
                        lecture_date,
                        lecture_number,
                        status
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'conducted'
                    )
                    `,
                    [
                        class_id,
                        subject_id,
                        teacher_id,
                        lectureDate,
                        lectureNumber
                    ]
                );


            return res.status(201).json({

                success: true,

                message:
                    "Lecture created successfully.",

                lecture: {

                    lecture_id:
                        result.insertId,

                    class_id,

                    subject_id,

                    teacher_id,

                    lecture_date:
                        lectureDate,

                    lecture_number:
                        lectureNumber,

                    status:
                        "conducted"

                }

            });


        } catch (error) {

            console.error(
                "Lecture creation error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while creating lecture."

            });

        }

    }
);


// =====================================================
// GET STUDENTS OF LECTURE
// IMPORTANT FIX
// =====================================================
// GET /api/attendance/lecture/:lectureId/students
//
// Lecture ID se actual class_id nikala jayega.
// Phir us class ke saare students fetch honge.
// =====================================================

router.get(
    "/lecture/:lectureId/students",
    async (req, res) => {

        try {

            const { lectureId } = req.params;


            // ==========================================
            // GET LECTURE DETAILS
            // ==========================================

            const [lectureRows] =
                await db.query(
                    `
                    SELECT

                        lecture_id,

                        class_id,

                        subject_id,

                        teacher_id,

                        lecture_date,

                        lecture_number

                    FROM lectures

                    WHERE lecture_id = ?

                    LIMIT 1
                    `,
                    [lectureId]
                );


            if (lectureRows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Lecture not found."

                });

            }


            const lecture =
                lectureRows[0];


            // ==========================================
            // GET STUDENTS USING LECTURE CLASS ID
            // ==========================================

            const [students] =
                await db.query(
                    `
                    SELECT

                        student_id,

                        university_roll_no,

                        student_name,

                        email,

                        phone,

                        year,

                        branch,

                        section,

                        semester,

                        class_id

                    FROM students

                    WHERE class_id = ?

                    ORDER BY
                        university_roll_no
                    `,
                    [lecture.class_id]
                );


            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({

                success: true,

                lecture: {

                    lecture_id:
                        lecture.lecture_id,

                    class_id:
                        lecture.class_id,

                    subject_id:
                        lecture.subject_id,

                    teacher_id:
                        lecture.teacher_id,

                    lecture_date:
                        lecture.lecture_date,

                    lecture_number:
                        lecture.lecture_number

                },

                students

            });


        } catch (error) {

            console.error(
                "Lecture students fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching lecture students."

            });

        }

    }
);


// =====================================================
// GET STUDENTS OF CLASS
// =====================================================

router.get(
    "/class/:classId/students",
    async (req, res) => {

        try {

            const { classId } = req.params;


            const [students] =
                await db.query(
                    `
                    SELECT

                        student_id,

                        university_roll_no,

                        student_name,

                        email,

                        phone,

                        year,

                        branch,

                        section,

                        semester,

                        class_id

                    FROM students

                    WHERE class_id = ?

                    ORDER BY
                        university_roll_no
                    `,
                    [classId]
                );


            return res.status(200).json({

                success: true,

                students

            });


        } catch (error) {

            console.error(
                "Class students fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching class students."

            });

        }

    }
);


// =====================================================
// SAVE ATTENDANCE
// =====================================================

router.post(
    "/mark",
    async (req, res) => {

        try {

            const {

                lectureId,
                attendance

            } = req.body;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (
                !lectureId ||
                !Array.isArray(attendance) ||
                attendance.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Lecture ID and attendance data are required."

                });

            }


            // ==========================================
            // GET LECTURE DETAILS
            // ==========================================

            const [lectureRows] =
                await db.query(
                    `
                    SELECT

                        l.lecture_id,

                        l.class_id,

                        l.subject_id,

                        l.teacher_id,

                        l.lecture_date,

                        l.lecture_number,

                        c.year,

                        c.branch,

                        c.section,

                        c.semester,

                        sub.subject_code,

                        sub.subject_name

                    FROM lectures l

                    INNER JOIN classes c
                        ON l.class_id = c.class_id

                    INNER JOIN subjects sub
                        ON l.subject_id = sub.subject_id

                    WHERE l.lecture_id = ?

                    LIMIT 1
                    `,
                    [lectureId]
                );


            if (lectureRows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Lecture not found."

                });

            }


            const lecture =
                lectureRows[0];


            // ==========================================
            // SAVE ATTENDANCE IN MYSQL
            // ==========================================

            for (
                const record of attendance
            ) {

                const {

                    studentId,
                    status

                } = record;


                if (
                    !studentId ||
                    !status
                ) {

                    continue;

                }


                if (
                    status !== "P" &&
                    status !== "A"
                ) {

                    continue;

                }


                await db.query(
                    `
                    INSERT INTO attendance
                    (
                        lecture_id,
                        student_id,
                        attendance_status
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )

                    ON DUPLICATE KEY UPDATE

                        attendance_status =
                            VALUES(attendance_status),

                        marked_at =
                            CURRENT_TIMESTAMP
                    `,
                    [
                        lectureId,
                        studentId,
                        status
                    ]
                );

            }


            // ==========================================
            // GET VALID STUDENT IDS
            // ==========================================

            const studentIds =
                attendance

                    .filter(
                        record =>
                            record.studentId &&
                            (
                                record.status === "P" ||
                                record.status === "A"
                            )
                    )

                    .map(
                        record =>
                            Number(record.studentId)
                    );


            let students = [];


            // ==========================================
            // GET STUDENT DETAILS
            // ==========================================

            if (
                studentIds.length > 0
            ) {

                const placeholders =
                    studentIds
                        .map(() => "?")
                        .join(",");


                const [studentRows] =
                    await db.query(
                        `
                        SELECT

                            student_id,

                            university_roll_no,

                            student_name

                        FROM students

                        WHERE student_id IN
                        (${placeholders})

                        ORDER BY
                            university_roll_no
                        `,
                        studentIds
                    );


                // ======================================
                // ATTACH ATTENDANCE STATUS
                // ======================================

                students =
                    studentRows.map(
                        student => {

                            const record =
                                attendance.find(
                                    item =>
                                        Number(
                                            item.studentId
                                        ) ===
                                        Number(
                                            student.student_id
                                        )
                                );


                            return {

                                student_id:
                                    student.student_id,

                                university_roll_no:
                                    student.university_roll_no,

                                student_name:
                                    student.student_name,

                                status:
                                    record
                                        ? record.status
                                        : ""

                            };

                        }
                    );

            }


            // ==========================================
            // UPDATE EXCEL
            // ==========================================

            if (
                students.length > 0
            ) {

                await updateAttendanceExcel({

                    classId:
                        lecture.class_id,

                    subjectCode:
                        lecture.subject_code,

                    subjectName:
                        lecture.subject_name,

                    date:
                        lecture.lecture_date,

                    students:
                        students

                });

            }


            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({

                success: true,

                message:
                    "Attendance saved successfully and Excel updated.",

                lecture: {

                    lecture_id:
                        lecture.lecture_id,

                    class_id:
                        lecture.class_id,

                    subject_id:
                        lecture.subject_id,

                    subject_code:
                        lecture.subject_code,

                    subject_name:
                        lecture.subject_name,

                    lecture_date:
                        lecture.lecture_date,

                    lecture_number:
                        lecture.lecture_number

                },

                excel: {

                    updated:
                        students.length > 0,

                    file:
                        "backend/excel/Attendance.xlsx"

                }

            });


        } catch (error) {

            console.error(
                "Attendance save error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while saving attendance."

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;