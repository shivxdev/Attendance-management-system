// ==========================================
// STUDENT MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://attendance-management-system-production-72c4.up.railway.app/api";


    // ==========================================
    // GET ADMIN
    // ==========================================

    let admin = null;

    try {
        admin = JSON.parse(localStorage.getItem("admin"));
    } catch (error) {
        console.error("Admin localStorage error:", error);
    }


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!admin) {
        window.location.href = "login.html";
        return;
    }


    // ==========================================
    // ELEMENTS
    // ==========================================

    const adminName =
        document.getElementById("adminName");

    const backBtn =
        document.getElementById("backBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const addStudentBtn =
        document.getElementById("addStudentBtn");

    const closeFormBtn =
        document.getElementById("closeFormBtn");

    const cancelBtn =
        document.getElementById("cancelBtn");

    const studentFormSection =
        document.getElementById("studentFormSection");

    const studentForm =
        document.getElementById("studentForm");

    const studentTableBody =
        document.getElementById("studentTableBody");

    const loadingMessage =
        document.getElementById("loadingMessage");

    const refreshBtn =
        document.getElementById("refreshBtn");

    const formMessage =
        document.getElementById("formMessage");

    const saveStudentBtn =
        document.getElementById("saveStudentBtn");

    const classId =
        document.getElementById("classId");


    // ==========================================
    // ADMIN NAME
    // ==========================================

    if (adminName) {
        adminName.textContent =
            admin.admin_name ||
            admin.username ||
            "Admin";
    }


    // ==========================================
    // BACK BUTTON
    // ==========================================

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "admin-dashboard.html";
        });
    }


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("admin");

            window.location.href = "login.html";

        });
    }


    // ==========================================
    // OPEN FORM
    // ==========================================

    function openForm() {

        if (!studentFormSection) {
            return;
        }

        studentFormSection.classList.remove("hidden");

        studentFormSection.scrollIntoView({
            behavior: "smooth"
        });

        // Reload classes whenever form opens
        loadClasses();

    }


    // ==========================================
    // CLOSE FORM
    // ==========================================

    function closeForm() {

        if (!studentFormSection) {
            return;
        }

        studentFormSection.classList.add("hidden");

        if (studentForm) {
            studentForm.reset();
        }

        if (formMessage) {

            formMessage.textContent = "";

            formMessage.className =
                "form-message";

        }

    }


    if (addStudentBtn) {
        addStudentBtn.addEventListener(
            "click",
            openForm
        );
    }


    if (closeFormBtn) {
        closeFormBtn.addEventListener(
            "click",
            closeForm
        );
    }


    if (cancelBtn) {
        cancelBtn.addEventListener(
            "click",
            closeForm
        );
    }


    // ==========================================
    // SAFE JSON
    // ==========================================

    async function getJSON(response) {

        const text = await response.text();

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
    // GET FIELD VALUE
    // ==========================================
    // This function checks multiple possible IDs/names.
    // So HTML ID mismatch won't break the form.
    // ==========================================

    function getFieldValue(...selectors) {

        for (const selector of selectors) {

            const element =
                document.querySelector(selector);

            if (element) {

                return String(
                    element.value ?? ""
                ).trim();

            }

        }

        return "";

    }


    // ==========================================
    // LOAD CLASSES
    // ==========================================

    async function loadClasses() {

        if (!classId) {

            console.error(
                "❌ classId element not found in HTML."
            );

            return;

        }


        classId.innerHTML = `
            <option value="">
                Loading classes...
            </option>
        `;


        try {

            const response =
                await fetch(
                    `${API}/admin/classes`
                );


            const data =
                await getJSON(response);


            console.log(
                "CLASSES RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load classes."
                );

            }


            classId.innerHTML = `
                <option value="">
                    Select Class
                </option>
            `;


            const classes =
                Array.isArray(data.classes)
                    ? data.classes
                    : [];


            if (classes.length === 0) {

                classId.innerHTML = `
                    <option value="">
                        No classes available
                    </option>
                `;

                return;

            }


            classes.forEach(item => {

                const option =
                    document.createElement("option");


                option.value =
                    item.class_id;


                option.textContent =
                    `${item.class_id} — Year ${item.year} — ${item.section}`;


                classId.appendChild(option);

            });


        } catch (error) {

            console.error(
                "LOAD CLASSES ERROR:",
                error
            );


            classId.innerHTML = `
                <option value="">
                    Unable to load classes
                </option>
            `;

        }

    }


    // ==========================================
    // LOAD STUDENTS
    // ==========================================

    async function loadStudents() {

        if (!studentTableBody) {
            return;
        }


        studentTableBody.innerHTML = "";


        if (loadingMessage) {

            loadingMessage.style.display =
                "block";

            loadingMessage.textContent =
                "Loading students...";

        }


        try {

            const response =
                await fetch(
                    `${API}/admin/students`
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


            const students =
                Array.isArray(data.students)
                    ? data.students
                    : [];


            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }


            // ==================================
            // EMPTY
            // ==================================

            if (students.length === 0) {

                studentTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="empty-message"
                        >
                            No students found.
                        </td>
                    </tr>
                `;

                return;

            }


            // ==================================
            // CREATE ROWS
            // ==================================

            students.forEach(student => {

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
                        ${student.email || "-"}
                    </td>

                    <td>
                        ${student.class_id || "-"}
                    </td>

                    <td>
                        ${student.year || "-"}
                    </td>

                    <td>
                        ${student.section || "-"}
                    </td>

                    <td>

                        <button
                            class="delete-btn"
                            data-id="${student.student_id}"
                        >
                            Delete
                        </button>

                    </td>

                `;


                studentTableBody.appendChild(row);

            });


            // ==================================
            // DELETE BUTTONS
            // ==================================

            document
                .querySelectorAll(".delete-btn")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteStudent(
                                button.dataset.id
                            );

                        }
                    );

                });


        } catch (error) {

            console.error(
                "LOAD STUDENTS ERROR:",
                error
            );


            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }


            studentTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty-message"
                    >
                        ${error.message}
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // DELETE STUDENT
    // ==========================================

    async function deleteStudent(studentId) {

        if (!studentId) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this student?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/admin/students/${studentId}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await getJSON(response);


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to delete student."
                );

            }


            alert(
                "Student deleted successfully."
            );


            await loadStudents();


        } catch (error) {

            console.error(
                "DELETE STUDENT ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to delete student."
            );

        }

    }


    // ==========================================
    // ADD STUDENT
    // ==========================================

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                // ==================================
                // GET FORM VALUES
                // ==================================

                const username =
                    getFieldValue(
                        "#username",
                        "#studentUsername",
                        "[name='username']"
                    );


                const password =
                    getFieldValue(
                        "#password",
                        "#studentPassword",
                        "[name='password']"
                    );


                const university_roll_no =
                    getFieldValue(
                        "#universityRollNo",
                        "#university_roll_no",
                        "#rollNo",
                        "[name='university_roll_no']",
                        "[name='universityRollNo']"
                    );


                const student_name =
                    getFieldValue(
                        "#studentName",
                        "#student_name",
                        "[name='student_name']",
                        "[name='studentName']"
                    );


                const email =
                    getFieldValue(
                        "#email",
                        "[name='email']"
                    );


                const phone =
                    getFieldValue(
                        "#phone",
                        "[name='phone']"
                    );


                const year =
                    getFieldValue(
                        "#year",
                        "#studentYear",
                        "[name='year']"
                    );


                const branch =
                    getFieldValue(
                        "#branch",
                        "#studentBranch",
                        "[name='branch']"
                    );


                const section =
                    getFieldValue(
                        "#section",
                        "#studentSection",
                        "[name='section']"
                    );


                const semester =
                    getFieldValue(
                        "#semester",
                        "#studentSemester",
                        "[name='semester']"
                    );


                const selectedClass =
                    classId
                        ? String(
                            classId.value || ""
                        ).trim()
                        : "";


                // ==================================
                // DEBUG
                // ==================================

                console.log(
                    "========== STUDENT FORM DATA =========="
                );

                console.log({
                    username,
                    password:
                        password ? "********" : "",
                    university_roll_no,
                    student_name,
                    email,
                    phone,
                    year,
                    branch,
                    section,
                    semester,
                    selectedClass
                });

                console.log(
                    "========================================"
                );


                // ==================================
                // VALIDATION
                // ==================================

                const missingFields = [];


                if (!username)
                    missingFields.push("username");

                if (!password)
                    missingFields.push("password");

                if (!university_roll_no)
                    missingFields.push("roll number");

                if (!student_name)
                    missingFields.push("name");

                if (!email)
                    missingFields.push("email");

                if (!year)
                    missingFields.push("year");

                if (!branch)
                    missingFields.push("branch");

                if (!section)
                    missingFields.push("section");

                if (!semester)
                    missingFields.push("semester");

                if (!selectedClass)
                    missingFields.push("class");


                if (missingFields.length > 0) {

                    console.error(
                        "MISSING FIELDS:",
                        missingFields
                    );


                    showFormMessage(
                        `Required fields missing: ${missingFields.join(", ")}`,
                        "error"
                    );


                    return;

                }


                // ==================================
                // VALIDATE YEAR / SEMESTER
                // ==================================

                const numericYear =
                    Number(year);


                const numericSemester =
                    Number(semester);


                if (
                    Number.isNaN(numericYear)
                ) {

                    showFormMessage(
                        "Invalid year selected.",
                        "error"
                    );

                    return;

                }


                if (
                    Number.isNaN(numericSemester)
                ) {

                    showFormMessage(
                        "Invalid semester selected.",
                        "error"
                    );

                    return;

                }


                // ==================================
                // DISABLE BUTTON
                // ==================================

                if (saveStudentBtn) {

                    saveStudentBtn.disabled =
                        true;

                    saveStudentBtn.textContent =
                        "Saving...";

                }


                try {

                    // ==================================
                    // REQUEST BODY
                    // ==================================

                    const requestBody = {

                        username:
                            username,

                        password:
                            password,

                        university_roll_no:
                            university_roll_no,

                        student_name:
                            student_name,

                        email:
                            email,

                        phone:
                            phone || null,

                        year:
                            numericYear,

                        branch:
                            branch,

                        section:
                            section,

                        semester:
                            numericSemester,

                        class_id:
                            selectedClass

                    };


                    console.log(
                        "SENDING STUDENT DATA:",
                        {
                            ...requestBody,
                            password: "********"
                        }
                    );


                    // ==================================
                    // API REQUEST
                    // ==================================

                    const response =
                        await fetch(
                            `${API}/admin/students`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        requestBody
                                    )

                            }
                        );


                    const data =
                        await getJSON(
                            response
                        );


                    console.log(
                        "ADD STUDENT RESPONSE:",
                        data
                    );


                    // ==================================
                    // ERROR
                    // ==================================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to add student."
                        );

                    }


                    // ==================================
                    // SUCCESS
                    // ==================================

                    showFormMessage(
                        "Student added successfully.",
                        "success"
                    );


                    alert(
                        "Student added successfully!"
                    );


                    if (studentForm) {
                        studentForm.reset();
                    }


                    closeForm();


                    await loadStudents();


                } catch (error) {

                    console.error(
                        "ADD STUDENT ERROR:",
                        error
                    );


                    showFormMessage(
                        error.message ||
                        "Unable to add student.",
                        "error"
                    );

                } finally {

                    if (saveStudentBtn) {

                        saveStudentBtn.disabled =
                            false;

                        saveStudentBtn.textContent =
                            "Save Student";

                    }

                }

            }
        );

    }


    // ==========================================
    // FORM MESSAGE
    // ==========================================

    function showFormMessage(
        message,
        type
    ) {

        if (!formMessage) {
            return;
        }


        formMessage.textContent =
            message;


        formMessage.className =
            `form-message ${type}`;

    }


    // ==========================================
    // REFRESH
    // ==========================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadStudents
        );

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadStudents();

    loadClasses();


    // ==========================================
    // READY
    // ==========================================

    console.log(
        "✅ Student Management initialized successfully."
    );

});