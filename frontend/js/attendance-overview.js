// ==========================================
// ADMIN ATTENDANCE OVERVIEW
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API =
            "http://localhost:5000/api";


        // ==========================================
        // ELEMENTS
        // ==========================================

        const classSelect =
            document.getElementById(
                "classSelect"
            );


        const subjectSelect =
            document.getElementById(
                "subjectSelect"
            );


        const viewBtn =
            document.getElementById(
                "viewBtn"
            );


        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        const backBtn =
            document.getElementById(
                "backBtn"
            );


        const summarySection =
            document.getElementById(
                "summarySection"
            );


        const attendanceSection =
            document.getElementById(
                "attendanceSection"
            );


        const attendanceTable =
            document.getElementById(
                "attendanceTable"
            );


        const message =
            document.getElementById(
                "message"
            );


        const totalStudents =
            document.getElementById(
                "totalStudents"
            );


        const totalPresent =
            document.getElementById(
                "totalPresent"
            );


        const totalAbsent =
            document.getElementById(
                "totalAbsent"
            );


        const overallPercentage =
            document.getElementById(
                "overallPercentage"
            );


        // ==========================================
        // SAFE JSON
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
                    "Server returned invalid response."
                );

            }

        }


        // ==========================================
        // MESSAGE
        // ==========================================

        function showMessage(
            text,
            type = ""
        ) {

            if (!message) return;


            message.textContent =
                text;


            message.className =
                `message ${type}`;

        }


        // ==========================================
        // LOAD CLASSES
        // ==========================================

        async function loadClasses() {

            try {

                const response =
                    await fetch(
                        `${API}/admin/classes`
                    );


                const data =
                    await getJSON(response);


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load classes."
                    );

                }


                classSelect.innerHTML =
                    `
                    <option value="">
                        Select Class
                    </option>
                    `;


                data.classes.forEach(
                    classItem => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            classItem.class_id;


                        option.textContent =
                            `${classItem.class_id} — Year ${classItem.year} — ${classItem.section}`;


                        classSelect.appendChild(
                            option
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "Class loading error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );

            }

        }


        // ==========================================
        // LOAD SUBJECTS
        // ==========================================

        async function loadSubjects() {

            try {

                const response =
                    await fetch(
                        `${API}/admin/subjects`
                    );


                const data =
                    await getJSON(response);


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load subjects."
                    );

                }


                subjectSelect.innerHTML =
                    `
                    <option value="">
                        Select Subject
                    </option>
                    `;


                data.subjects.forEach(
                    subject => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            subject.subject_id;


                        option.textContent =
                            `${subject.subject_code} — ${subject.subject_name}`;


                        subjectSelect.appendChild(
                            option
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "Subject loading error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );

            }

        }


        // ==========================================
        // LOAD ATTENDANCE
        // ==========================================

        async function loadAttendance() {

            const classId =
                classSelect.value;


            const subjectId =
                subjectSelect.value;


            if (
                !classId ||
                !subjectId
            ) {

                showMessage(
                    "Please select both class and subject.",
                    "error"
                );

                return;

            }


            try {

                viewBtn.disabled =
                    true;


                viewBtn.textContent =
                    "Loading...";


                attendanceTable.innerHTML =
                    `
                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            Loading attendance...
                        </td>

                    </tr>
                    `;


                const response =
                    await fetch(
                        `${API}/admin/attendance?class_id=${encodeURIComponent(classId)}&subject_id=${encodeURIComponent(subjectId)}`
                    );


                const data =
                    await getJSON(response);


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load attendance."
                    );

                }


                renderAttendance(
                    data
                );


                showMessage(
                    "Attendance loaded successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Attendance loading error:",
                    error
                );


                attendanceTable.innerHTML =
                    `
                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            Unable to load attendance.
                        </td>

                    </tr>
                    `;


                showMessage(
                    error.message,
                    "error"
                );


            } finally {

                viewBtn.disabled =
                    false;


                viewBtn.textContent =
                    "View Attendance";

            }

        }


        // ==========================================
        // RENDER ATTENDANCE
        // ==========================================

        function renderAttendance(data) {

            const students =
                data.students ||
                data.attendance ||
                [];


            const summary =
                data.summary ||
                {};


            // ======================================
            // SUMMARY
            // ======================================

            totalStudents.textContent =
                summary.totalStudents ??
                students.length ??
                0;


            totalPresent.textContent =
                summary.totalPresent ??
                0;


            totalAbsent.textContent =
                summary.totalAbsent ??
                0;


            const percentage =
                Number(
                    summary.overallAttendance ??
                    summary.attendancePercentage ??
                    0
                );


            overallPercentage.textContent =
                `${percentage.toFixed(2)}%`;


            summarySection.classList.remove(
                "hidden"
            );


            attendanceSection.classList.remove(
                "hidden"
            );


            // ======================================
            // TABLE
            // ======================================

            attendanceTable.innerHTML =
                "";


            if (students.length === 0) {

                attendanceTable.innerHTML =
                    `
                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            No attendance records found.
                        </td>

                    </tr>
                    `;

                return;

            }


            students.forEach(
                student => {

                    const total =
                        Number(
                            student.totalLectures ??
                            student.total_lectures ??
                            0
                        );


                    const present =
                        Number(
                            student.presentLectures ??
                            student.present_lectures ??
                            0
                        );


                    const absent =
                        Number(
                            student.absentLectures ??
                            student.absent_lectures ??
                            0
                        );


                    let percentage =
                        Number(
                            student.attendancePercentage ??
                            student.attendance_percentage ??
                            0
                        );


                    if (
                        !student.attendancePercentage &&
                        !student.attendance_percentage &&
                        total > 0
                    ) {

                        percentage =
                            (
                                present /
                                total
                            ) * 100;

                    }


                    let percentageClass =
                        "good";


                    if (percentage < 75) {

                        percentageClass =
                            "danger";

                    } else if (
                        percentage < 85
                    ) {

                        percentageClass =
                            "warning";

                    }


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${
                                student.university_roll_no ||
                                student.roll_no ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                student.student_name ||
                                "-"
                            }
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            ${present}
                        </td>

                        <td>
                            ${absent}
                        </td>

                        <td>

                            <span
                                class="percentage ${percentageClass}"
                            >
                                ${percentage.toFixed(2)}%
                            </span>

                        </td>

                    `;


                    attendanceTable.appendChild(
                        row
                    );

                }
            );

        }


        // ==========================================
        // VIEW BUTTON
        // ==========================================

        viewBtn.addEventListener(
            "click",
            loadAttendance
        );


        // ==========================================
        // REFRESH
        // ==========================================

        refreshBtn.addEventListener(
            "click",
            () => {

                if (
                    classSelect.value &&
                    subjectSelect.value
                ) {

                    loadAttendance();

                }

            }
        );


        // ==========================================
        // BACK
        // ==========================================

        backBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-dashboard.html";

            }
        );


        // ==========================================
        // INITIAL LOAD
        // ==========================================

        async function initialize() {

            await Promise.all([
                loadClasses(),
                loadSubjects()
            ]);


            console.log(
                "✅ Attendance Overview initialized."
            );

        }


        initialize();

    }
);