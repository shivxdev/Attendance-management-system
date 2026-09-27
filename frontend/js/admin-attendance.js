// ==========================================
// ADMIN ATTENDANCE OVERVIEW
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://attendance-management-system-production-72c4.up.railway.app/api";


    // ==========================================
    // GET LOGGED-IN ADMIN
    // ==========================================

    let admin = null;

    try {

        admin =
            JSON.parse(
                localStorage.getItem("admin")
            );

    } catch (error) {

        console.error(
            "Admin localStorage error:",
            error
        );

    }


    console.log(
        "LOGGED-IN ADMIN:",
        admin
    );


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!admin) {

        window.location.href =
            "login.html";

        return;

    }


    // ==========================================
    // ELEMENTS
    // ==========================================

    const totalLectures =
        document.getElementById(
            "totalLectures"
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

    const overallAttendance =
        document.getElementById(
            "overallAttendance"
        );

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const subjectFilter =
        document.getElementById(
            "subjectFilter"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );

    const backBtn =
        document.getElementById(
            "backBtn"
        );

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    // ==========================================
    // BACK TO DASHBOARD
    // ==========================================

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-dashboard.html";

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
                    "admin"
                );

                window.location.href =
                    "login.html";

            }
        );

    }


    // ==========================================
    // GET JSON RESPONSE
    // ==========================================

    async function getJSON(response) {

        const text =
            await response.text();

        console.log(
            "ATTENDANCE API RESPONSE:",
            text
        );


        try {

            return JSON.parse(text);

        } catch (error) {

            throw new Error(
                "Server returned invalid JSON."
            );

        }

    }


    // ==========================================
    // LOAD ATTENDANCE
    // ==========================================

    async function loadAttendance() {

        try {

            // ----------------------------------
            // LOADING STATE
            // ----------------------------------

            if (tableBody) {

                tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="loading"
                        >
                            Loading attendance data...
                        </td>

                    </tr>

                `;

            }


            // ----------------------------------
            // API CALL
            // ----------------------------------

            const response =
                await fetch(
                    `${API}/admin/attendance-overview`
                );


            const data =
                await getJSON(response);


            console.log(
                "ADMIN ATTENDANCE:",
                data
            );


            // ----------------------------------
            // ERROR CHECK
            // ----------------------------------

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load attendance data."
                );

            }


            // ==================================
            // SUMMARY
            // ==================================

            const summary =
                data.summary || {};


            if (totalLectures) {

                totalLectures.textContent =
                    summary.totalLectures ?? 0;

            }


            if (totalStudents) {

                totalStudents.textContent =
                    summary.totalStudents ?? 0;

            }


            if (totalPresent) {

                totalPresent.textContent =
                    summary.totalPresent ?? 0;

            }


            if (totalAbsent) {

                totalAbsent.textContent =
                    summary.totalAbsent ?? 0;

            }


            if (overallAttendance) {

                overallAttendance.textContent =
                    `${summary.overallAttendance ?? 0}%`;

            }


            // ==================================
            // RECORDS
            // ==================================

            const records =
                Array.isArray(data.records)
                    ? data.records
                    : [];


            // ----------------------------------
            // RECORD COUNT
            // ----------------------------------

            if (recordCount) {

                recordCount.textContent =
                    `${records.length} ${
                        records.length === 1
                            ? "record"
                            : "records"
                    }`;

            }


            // ----------------------------------
            // NO RECORDS
            // ----------------------------------

            if (records.length === 0) {

                if (tableBody) {

                    tableBody.innerHTML = `

                        <tr>

                            <td
                                colspan="6"
                                class="empty"
                            >
                                No attendance records found.
                            </td>

                        </tr>

                    `;

                }

                return;

            }


            // ==================================
            // FILTER OPTIONS
            // ==================================

            populateFilters(records);


            // ==================================
            // RENDER TABLE
            // ==================================

            renderTable(records);


            console.log(
                "✅ Attendance data loaded successfully."
            );


        } catch (error) {

            console.error(
                "ADMIN ATTENDANCE ERROR:",
                error
            );


            if (tableBody) {

                tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            Unable to load attendance data.
                        </td>

                    </tr>

                `;

            }


            if (recordCount) {

                recordCount.textContent =
                    "0 records";

            }


            alert(
                error.message ||
                "Unable to load attendance data."
            );

        }

    }


    // ==========================================
    // POPULATE FILTERS
    // ==========================================

    function populateFilters(records) {

        if (classFilter) {

            const currentValue =
                classFilter.value;


            classFilter.innerHTML = `

                <option value="">
                    All Classes
                </option>

            `;


            const classes = [];


            records.forEach(record => {

                if (
                    record.class_id &&
                    !classes.includes(
                        record.class_id
                    )
                ) {

                    classes.push(
                        record.class_id
                    );

                }

            });


            classes.forEach(classId => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    classId;

                option.textContent =
                    classId;

                classFilter.appendChild(
                    option
                );

            });


            if (
                classes.includes(
                    currentValue
                )
            ) {

                classFilter.value =
                    currentValue;

            }

        }


        if (subjectFilter) {

            const currentValue =
                subjectFilter.value;


            subjectFilter.innerHTML = `

                <option value="">
                    All Subjects
                </option>

            `;


            const subjects = [];


            records.forEach(record => {

                if (
                    record.subject_id &&
                    !subjects.some(
                        subject =>
                            subject.id ===
                            record.subject_id
                    )
                ) {

                    subjects.push({

                        id:
                            record.subject_id,

                        name:
                            `${record.subject_code} - ${record.subject_name}`

                    });

                }

            });


            subjects.forEach(subject => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    subject.id;

                option.textContent =
                    subject.name;

                subjectFilter.appendChild(
                    option
                );

            });


            if (
                subjects.some(
                    subject =>
                        String(subject.id) ===
                        String(currentValue)
                )
            ) {

                subjectFilter.value =
                    currentValue;

            }

        }

    }


    // ==========================================
    // RENDER TABLE
    // ==========================================

    function renderTable(records) {

        if (!tableBody) return;


        const selectedClass =
            classFilter
                ? classFilter.value
                : "";


        const selectedSubject =
            subjectFilter
                ? subjectFilter.value
                : "";


        const filteredRecords =
            records.filter(record => {

                const classMatch =
                    !selectedClass ||
                    record.class_id ===
                    selectedClass;


                const subjectMatch =
                    !selectedSubject ||
                    String(record.subject_id) ===
                    String(selectedSubject);


                return (
                    classMatch &&
                    subjectMatch
                );

            });


        // ======================================
        // RECORD COUNT
        // ======================================

        if (recordCount) {

            recordCount.textContent =
                `${filteredRecords.length} ${
                    filteredRecords.length === 1
                        ? "record"
                        : "records"
                }`;

        }


        // ======================================
        // EMPTY FILTER RESULT
        // ======================================

        if (filteredRecords.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="empty"
                    >
                        No attendance records match
                        the selected filters.
                    </td>

                </tr>

            `;

            return;

        }


        // ======================================
        // TABLE
        // ======================================

        tableBody.innerHTML = "";


        filteredRecords.forEach(record => {

            const row =
                document.createElement(
                    "tr"
                );


            const percentage =
                Number(
                    record.attendancePercentage || 0
                );


            let percentageClass =
                "attendance-danger";


            if (percentage >= 75) {

                percentageClass =
                    "attendance-good";

            } else if (percentage >= 60) {

                percentageClass =
                    "attendance-warning";

            }


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            record.class_id || "—"
                        )}
                    </strong>

                    <br>

                    <small>
                        Year ${escapeHTML(
                            record.year ?? "—"
                        )}
                        ·
                        Section ${escapeHTML(
                            record.section || "—"
                        )}
                    </small>

                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            record.subject_code || "—"
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(
                            record.subject_name || "—"
                        )}
                    </small>

                </td>


                <td>
                    ${Number(
                        record.totalLectures || 0
                    )}
                </td>


                <td>
                    ${Number(
                        record.presentLectures || 0
                    )}
                </td>


                <td>
                    ${Number(
                        record.absentLectures || 0
                    )}
                </td>


                <td>

                    <span
                        class="${percentageClass}"
                    >
                        ${percentage}%
                    </span>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        });

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ==========================================
    // FILTER CHANGE
    // ==========================================

    if (classFilter) {

        classFilter.addEventListener(
            "change",
            async () => {

                // Fetch fresh data
                // and render according to filter.

                try {

                    const response =
                        await fetch(
                            `${API}/admin/attendance-overview`
                        );


                    const data =
                        await getJSON(
                            response
                        );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load attendance data."
                        );

                    }


                    renderTable(
                        data.records || []
                    );

                } catch (error) {

                    console.error(
                        "Class filter error:",
                        error
                    );

                }

            }
        );

    }


    if (subjectFilter) {

        subjectFilter.addEventListener(
            "change",
            async () => {

                try {

                    const response =
                        await fetch(
                            `${API}/admin/attendance-overview`
                        );


                    const data =
                        await getJSON(
                            response
                        );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load attendance data."
                        );

                    }


                    renderTable(
                        data.records || []
                    );

                } catch (error) {

                    console.error(
                        "Subject filter error:",
                        error
                    );

                }

            }
        );

    }


    // ==========================================
    // REFRESH
    // ==========================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            () => {

                loadAttendance();

            }
        );

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadAttendance();


    // ==========================================
    // READY
    // ==========================================

    console.log(
        "✅ Admin Attendance initialized."
    );

});