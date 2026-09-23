// ==========================================
// TEACHER DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "http://localhost:5000/api";


    // ==========================================
    // GET LOGGED-IN TEACHER
    // ==========================================

    let teacher = null;

    try {

        teacher =
            JSON.parse(
                localStorage.getItem("teacher")
            );

    } catch (error) {

        console.error(
            "Teacher localStorage error:",
            error
        );

    }


    console.log(
        "LOGGED-IN TEACHER:",
        teacher
    );


    if (!teacher) {

        window.location.href =
            "login.html";

        return;
    }


    // ==========================================
    // ELEMENTS
    // ==========================================

    const teacherName =
        document.getElementById("teacherName");

    const welcomeTeacherName =
        document.getElementById("welcomeTeacherName");

    const teacherCode =
        document.getElementById("teacherCode");

    const department =
        document.getElementById("department");

    const classIdElement =
        document.getElementById("classId");

    const subjectName =
        document.getElementById("subjectName");

    const createLectureBtn =
        document.getElementById("createLectureBtn");

    const markAttendanceBtn =
        document.getElementById("markAttendanceBtn");

    const saveAttendanceBtn =
        document.getElementById("saveAttendanceBtn");

    const studentTable =
        document.getElementById("studentTable");

    const lectureSubject =
        document.getElementById("lectureSubject");

    const lectureDate =
        document.getElementById("lectureDate");

    const lectureNumber =
        document.getElementById("lectureNumber");

    const lectureMessage =
        document.getElementById("lectureMessage");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const lectureSection =
        document.getElementById("lectureSection");

    const studentsSection =
        document.getElementById("studentsSection");


    // ==========================================
    // SHOW TEACHER INFORMATION
    // ==========================================

    if (teacherName) {

        teacherName.textContent =
            teacher.teacher_name || "Teacher";

    }


    if (welcomeTeacherName) {

        welcomeTeacherName.textContent =
            teacher.teacher_name || "Teacher";

    }


    if (teacherCode) {

        teacherCode.textContent =
            teacher.teacher_code || "-";

    }


    if (department) {

        department.textContent =
            teacher.department || "-";

    }


    // ==========================================
    // VARIABLES
    // ==========================================

    let assignment = null;

    let currentLecture = null;


    // ==========================================
    // SAFE JSON RESPONSE
    // ==========================================

    async function getJSON(response) {

        const text =
            await response.text();

        console.log(
            "SERVER RESPONSE:",
            text
        );


        try {

            return JSON.parse(text);

        } catch (error) {

            throw new Error(
                `Server returned invalid response (${response.status}).`
            );

        }

    }


    // ==========================================
    // LOAD TEACHER ASSIGNMENT
    // ==========================================

    async function loadAssignment() {

        try {

            let teacherId =
                teacher.teacher_id ||
                teacher.id ||
                null;


            console.log(
                "TEACHER ID:",
                teacherId
            );


            // ======================================
            // FALLBACK FOR TCH001
            // ======================================

            if (
                !teacherId &&
                teacher.teacher_code === "TCH001"
            ) {

                teacherId = 1;

                teacher.teacher_id = 1;

                localStorage.setItem(
                    "teacher",
                    JSON.stringify(teacher)
                );

            }


            // ======================================
            // CHECK TEACHER ID
            // ======================================

            if (!teacherId) {

                alert(
                    "Teacher ID missing. Please logout and login again."
                );

                return false;

            }


            // ======================================
            // GET ASSIGNMENT
            //
            // BACKEND:
            // GET /attendance/teacher/:teacherId
            // ======================================

            const response =
    await fetch(
        `${API}/attendance/teacher/${teacherId}/assignments`
    );


            const data =
                await getJSON(response);


            console.log(
                "TEACHER ASSIGNMENT RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load teacher assignment."
                );

            }


            // ======================================
            // CHECK ASSIGNMENTS
            // ======================================

            if (
                !Array.isArray(data.assignments) ||
                data.assignments.length === 0
            ) {

                alert(
                    "No class or subject assigned to this teacher."
                );

                return false;

            }


            // ======================================
            // USE FIRST ASSIGNMENT
            // ======================================

            assignment =
                data.assignments[0];


            console.log(
                "CURRENT ASSIGNMENT:",
                assignment
            );


            // ======================================
            // DISPLAY CLASS
            // ======================================

            if (classIdElement) {

                classIdElement.textContent =
                    assignment.class_id || "-";

            }


            // ======================================
            // DISPLAY SUBJECT
            // ======================================

            if (subjectName) {

                subjectName.textContent =
                    assignment.subject_name || "-";

            }


            // ======================================
            // SAVE ASSIGNMENT
            // ======================================

            teacher.teacher_id =
                teacherId;

            teacher.class_id =
                assignment.class_id;

            teacher.subject_id =
                assignment.subject_id;

            teacher.subject_name =
                assignment.subject_name;


            localStorage.setItem(
                "teacher",
                JSON.stringify(teacher)
            );


            console.log(
                "ASSIGNMENT LOADED SUCCESSFULLY"
            );


            return true;


        } catch (error) {

            console.error(
                "LOAD ASSIGNMENT ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to load teacher assignment."
            );


            return false;

        }

    }


    // ==========================================
    // LOAD ASSIGNMENT FIRST
    // ==========================================

    const assignmentLoaded =
        await loadAssignment();


    if (!assignmentLoaded) {

        return;

    }


    // ==========================================
    // CREATE LECTURE
    // ==========================================

    if (createLectureBtn) {

        createLectureBtn.addEventListener(
            "click",
            async () => {

                // ==================================
                // CHECK ASSIGNMENT
                // ==================================

                if (!assignment) {

                    alert(
                        "Teacher assignment not loaded."
                    );

                    return;

                }


                // ==================================
                // VALIDATE DATA
                // ==================================

                if (
                    !assignment.class_id ||
                    !assignment.subject_id ||
                    !teacher.teacher_id
                ) {

                    console.error(
                        "INVALID LECTURE DATA:",
                        {
                            assignment,
                            teacher
                        }
                    );


                    alert(
                        "Class, subject or teacher information is missing."
                    );

                    return;

                }


                // ==================================
                // DISABLE BUTTON
                // ==================================

                createLectureBtn.disabled =
                    true;

                createLectureBtn.textContent =
                    "Creating...";


                try {

                    // ==================================
                    // TODAY'S DATE
                    // ==================================

                    const today =
                        new Date()
                            .toISOString()
                            .split("T")[0];


                    // ==================================
                    // LECTURE NUMBER
                    //
                    // Temporary:
                    // Start from 1.
                    // ==================================

                    const lectureNo = 1;


                    // ==================================
                    // CREATE LECTURE
                    //
                    // BACKEND:
                    // POST /attendance/lecture
                    //
                    // BODY:
                    // classId
                    // subjectId
                    // teacherId
                    // lectureDate
                    // lectureNumber
                    // ==================================

                    const response =
    await fetch(
        `${API}/attendance/lectures`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                class_id:
                    assignment.class_id,

                subject_id:
                    assignment.subject_id,

                teacher_id:
                    teacher.teacher_id

            })
        }
    );


                    const data =
                        await getJSON(response);


                    console.log(
                        "CREATE LECTURE RESPONSE:",
                        data
                    );


                    // ==================================
                    // CHECK RESPONSE
                    // ==================================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to create lecture."
                        );

                    }


                    // ==================================
                    // SAVE CURRENT LECTURE
                    // ==================================

                    currentLecture =
                        data.lecture;


                    console.log(
                        "CURRENT LECTURE:",
                        currentLecture
                    );


                    // ==================================
                    // DISPLAY LECTURE
                    // ==================================

                    if (lectureSubject) {

                        lectureSubject.textContent =
                            assignment.subject_name || "-";

                    }


                    if (lectureDate) {

                        lectureDate.textContent =
                            currentLecture.lecture_date ||
                            today;

                    }


                    if (lectureNumber) {

                        lectureNumber.textContent =
                            currentLecture.lecture_number ||
                            lectureNo;

                    }


                    // ==================================
                    // SUCCESS MESSAGE
                    // ==================================

                    if (lectureMessage) {

                        lectureMessage.textContent =
                            "Lecture created successfully.";

                        lectureMessage.className =
                            "lecture-message success";

                    }


                    // ==================================
                    // SHOW SECTIONS
                    // ==================================

                    if (lectureSection) {

                        lectureSection.style.display =
                            "block";

                    }


                    if (studentsSection) {

                        studentsSection.style.display =
                            "block";

                    }


                    // ==================================
                    // LOAD STUDENTS
                    // ==================================

                    await loadStudents(
                        assignment.class_id
                    );

                } catch (error) {

                    console.error(
                        "CREATE LECTURE ERROR:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to create lecture."
                    );

                } finally {

                    createLectureBtn.disabled =
                        false;

                    createLectureBtn.textContent =
                        "Create Lecture →";

                }

            }
        );

    }


    // ==========================================
    // LOAD STUDENTS
    // ==========================================

    async function loadStudents(classId) {

        if (!studentTable) {

            return;

        }


        studentTable.innerHTML = `
            <tr>
                <td colspan="3">
                    Loading students...
                </td>
            </tr>
        `;


        try {

            // ==================================
            // GET STUDENTS
            // ==================================

            const response =
                await fetch(
                    `${API}/attendance/class/${encodeURIComponent(
                        classId
                    )}/students`
                );


            const data =
                await getJSON(response);


            console.log(
                "STUDENTS RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load students."
                );

            }


            // ==================================
            // NO STUDENTS
            // ==================================

            if (
                !Array.isArray(data.students) ||
                data.students.length === 0
            ) {

                studentTable.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No students found in this class.
                        </td>
                    </tr>
                `;

                return;

            }


            // ==================================
            // CLEAR TABLE
            // ==================================

            studentTable.innerHTML = "";


            // ==================================
            // CREATE STUDENT ROWS
            // ==================================

            data.students.forEach(student => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${student.university_roll_no || "-"}
                    </td>

                    <td>
                        ${student.student_name || "-"}
                    </td>

                    <td>

                        <div class="attendance-buttons">

                            <button
                                type="button"
                                class="status-btn present-btn active"
                                data-student-id="${student.student_id}"
                                data-status="P"
                            >
                                Present
                            </button>

                            <button
                                type="button"
                                class="status-btn absent-btn"
                                data-student-id="${student.student_id}"
                                data-status="A"
                            >
                                Absent
                            </button>

                        </div>

                    </td>

                `;


                studentTable.appendChild(row);


                // ==================================
                // STATUS BUTTONS
                // ==================================

                const statusButtons =
                    row.querySelectorAll(
                        ".status-btn"
                    );


                statusButtons.forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            statusButtons.forEach(btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            });


                            button.classList.add(
                                "active"
                            );


                            console.log(
                                "ATTENDANCE SELECTED:",
                                {
                                    student_id:
                                        button.dataset.studentId,

                                    status:
                                        button.dataset.status
                                }
                            );

                        }
                    );

                });

            });


            console.log(
                "STUDENTS LOADED:",
                data.students.length
            );


        } catch (error) {

            console.error(
                "LOAD STUDENTS ERROR:",
                error
            );


            studentTable.innerHTML = `
                <tr>
                    <td colspan="3">
                        ${error.message ||
                        "Unable to load students."}
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // MARK ATTENDANCE BUTTON
    // ==========================================

    if (markAttendanceBtn) {

        markAttendanceBtn.addEventListener(
            "click",
            () => {

                if (!currentLecture) {

                    alert(
                        "Please create a lecture first."
                    );

                    return;

                }


                if (studentsSection) {

                    studentsSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }


    // ==========================================
    // SAVE ATTENDANCE
    // ==========================================

    if (saveAttendanceBtn) {

        saveAttendanceBtn.addEventListener(
            "click",
            async () => {

                // ==================================
                // CHECK CURRENT LECTURE
                // ==================================

                if (!currentLecture) {

                    alert(
                        "Please create a lecture first."
                    );

                    return;

                }


                // ==================================
                // GET STUDENT ROWS
                // ==================================

                const rows =
                    document.querySelectorAll(
                        "#studentTable tr"
                    );


                if (rows.length === 0) {

                    alert(
                        "No students available."
                    );

                    return;

                }


                // ==================================
                // COLLECT ATTENDANCE
                // ==================================

                const attendance = [];


                rows.forEach(row => {

                    const activeButton =
                        row.querySelector(
                            ".status-btn.active"
                        );


                    if (!activeButton) {

                        return;

                    }


                    const studentId =
                        activeButton.dataset.studentId;


                    const status =
                        activeButton.dataset.status;


                    if (
                        !studentId ||
                        !status
                    ) {

                        return;

                    }


                    attendance.push({

                        studentId:
                            Number(studentId),

                        status:
                            status

                    });

                });


                // ==================================
                // CHECK ATTENDANCE
                // ==================================

                if (attendance.length === 0) {

                    alert(
                        "Please mark attendance for students."
                    );

                    return;

                }


                console.log(
                    "ATTENDANCE TO SAVE:",
                    attendance
                );


                // ==================================
                // DISABLE SAVE BUTTON
                // ==================================

                saveAttendanceBtn.disabled =
                    true;

                saveAttendanceBtn.textContent =
                    "Saving...";


                try {

                    // ==================================
                    // SAVE ATTENDANCE
                    //
                    // BACKEND EXPECTS:
                    //
                    // {
                    //   lectureId,
                    //   attendance: [
                    //      {
                    //          studentId,
                    //          status
                    //      }
                    //   ]
                    // }
                    // ==================================

                    const response =
                        await fetch(
                            `${API}/attendance/mark`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    lectureId:
                                        currentLecture.lecture_id,

                                    attendance:
                                        attendance

                                })

                            }
                        );


                    const data =
                        await getJSON(response);


                    console.log(
                        "SAVE ATTENDANCE RESPONSE:",
                        data
                    );


                    // ==================================
                    // CHECK RESPONSE
                    // ==================================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Attendance saving failed."
                        );

                    }


                    // ==================================
                    // SUCCESS
                    // ==================================

                    alert(
                        `Attendance saved successfully! ${attendance.length} student(s) updated.`
                    );


                    console.log(
                        "ATTENDANCE SAVED SUCCESSFULLY"
                    );


                    // ==================================
                    // DISABLE STATUS BUTTONS
                    // AFTER SAVE
                    // ==================================

                    document
                        .querySelectorAll(
                            "#studentTable .status-btn"
                        )
                        .forEach(button => {

                            button.disabled =
                                true;

                        });


                } catch (error) {

                    console.error(
                        "SAVE ATTENDANCE ERROR:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save attendance."
                    );


                } finally {

                    saveAttendanceBtn.disabled =
                        false;

                    saveAttendanceBtn.textContent =
                        "Save Attendance";

                }

            }
        );

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "teacher"
                );


                window.location.href =
                    "login.html";

            }
        );

    }


    // ==========================================
    // DASHBOARD READY
    // ==========================================

    console.log(
        "=========================================="
    );

    console.log(
        "✅ TEACHER DASHBOARD READY"
    );

    console.log(
        "=========================================="

    );

});