// ==========================================
// STUDENT DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const student = JSON.parse(
        localStorage.getItem("student")
    );


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!student) {

        window.location.href = "login.html";

        return;
    }


    // ==========================================
    // STUDENT INFORMATION
    // ==========================================

    const studentName =
        document.getElementById("studentName");

    const userName =
        document.getElementById("userName");

    const rollNo =
        document.getElementById("rollNo");

    const branch =
        document.getElementById("branch");

    const section =
        document.getElementById("section");

    const semester =
        document.getElementById("semester");


    if (studentName) {
        studentName.textContent =
            student.student_name || "Student";
    }


    if (userName) {
        userName.textContent =
            student.student_name || "Student";
    }


    if (rollNo) {
        rollNo.textContent =
            student.university_roll_no || "-";
    }


    if (branch) {
        branch.textContent =
            student.branch || "-";
    }


    if (section) {
        section.textContent =
            student.section || "-";
    }


    if (semester) {
        semester.textContent =
            student.semester || "-";
    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem("student");

                window.location.href =
                    "login.html";

            }
        );

    }


    // ==========================================
    // STUDENT ID CHECK
    // ==========================================

    if (!student.student_id) {

        console.error(
            "Student ID not found."
        );

        return;
    }


    // ==========================================
    // FETCH ATTENDANCE
    // ==========================================

    try {

        const response = await fetch(
            "https://attendance-management-system-production-72c4.up.railway.app/api/attendance/student/" +
            student.student_id
        );


        const data =
            await response.json();


        console.log(
            "Attendance response:",
            data
        );


        if (!response.ok || !data.success) {

            console.error(
                "Attendance fetch failed:",
                data.message
            );

            return;
        }


        // ==========================================
        // SUMMARY
        // ==========================================

        const overall =
            Number(
                data.summary.overallAttendance || 0
            );

        const present =
            Number(
                data.summary.presentLectures || 0
            );

        const absent =
            Number(
                data.summary.absentLectures || 0
            );

        const total =
            Number(
                data.summary.totalLectures || 0
            );


        const overallAttendance =
            document.getElementById(
                "overallAttendance"
            );

        const presentLectures =
            document.getElementById(
                "presentLectures"
            );

        const absentLectures =
            document.getElementById(
                "absentLectures"
            );

        const totalLectures =
            document.getElementById(
                "totalLectures"
            );


        if (overallAttendance) {

            overallAttendance.textContent =
                overall.toFixed(2) + "%";

        }


        if (presentLectures) {

            presentLectures.textContent =
                present;

        }


        if (absentLectures) {

            absentLectures.textContent =
                absent;

        }


        if (totalLectures) {

            totalLectures.textContent =
                total;

        }


        // ==========================================
        // PROGRESS BAR
        // ==========================================

        const progressFill =
            document.getElementById(
                "progressFill"
            );

        const progressPercentage =
            document.getElementById(
                "progressPercentage"
            );


        if (progressFill) {

            progressFill.style.width =
                Math.min(overall, 100) + "%";

        }


        if (progressPercentage) {

            progressPercentage.textContent =
                overall.toFixed(2) + "%";

        }


        // ==========================================
        // ATTENDANCE STATUS
        // ==========================================

        const statusText =
            document.getElementById(
                "attendanceStatusText"
            );


        if (statusText) {

            if (total === 0) {

                statusText.textContent =
                    "No attendance records available yet.";

            } else if (overall >= 75) {

                statusText.textContent =
                    "Good attendance. Keep maintaining your consistency.";

            } else if (overall >= 60) {

                statusText.textContent =
                    "Attendance is below the ideal level. Try to attend more lectures.";

            } else {

                statusText.textContent =
                    "Critical attendance level. You need to improve your attendance.";

            }

        }


        // ==========================================
        // SUBJECT TABLE
        // ==========================================

        const attendanceTable =
            document.getElementById(
                "attendanceTable"
            );


        if (!attendanceTable) {
            return;
        }


        attendanceTable.innerHTML = "";


        if (
            !data.subjects ||
            data.subjects.length === 0
        ) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attendance data available.
                    </td>
                </tr>
            `;

            return;
        }


        // ==========================================
        // SUBJECT ROWS
        // ==========================================

        data.subjects.forEach(
            (subject) => {

                const row =
                    document.createElement("tr");


                const percentage =
                    Number(
                        subject.attendance_percentage || 0
                    );


                let statusClass =
                    "attendance-critical";


                if (percentage >= 75) {

                    statusClass =
                        "attendance-good";

                } else if (percentage >= 60) {

                    statusClass =
                        "attendance-warning";

                }


                row.innerHTML = `

                    <td>
                        ${subject.subject_name || "-"}
                    </td>

                    <td>
                        ${subject.total_lectures || 0}
                    </td>

                    <td>
                        ${subject.present_lectures || 0}
                    </td>

                    <td>
                        ${subject.absent_lectures || 0}
                    </td>

                    <td class="${statusClass}">
                        ${percentage.toFixed(2)}%
                    </td>

                `;


                attendanceTable.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Attendance API error:",
            error
        );

    }

});