// ==========================================
// TEACHER ASSIGNMENT MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API =
        "http://localhost:5000/api";


    // ==========================================
    // GET ADMIN
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


    if (!admin) {

        window.location.href =
            "login.html";

        return;

    }


    console.log(
        "LOGGED-IN ADMIN:",
        admin
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const adminName =
        document.getElementById(
            "adminName"
        );


    const backBtn =
        document.getElementById(
            "backBtn"
        );


    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    const assignmentForm =
        document.getElementById(
            "assignmentForm"
        );


    const teacherSelect =
        document.getElementById(
            "teacherSelect"
        );


    const classSelect =
        document.getElementById(
            "classSelect"
        );


    const subjectSelect =
        document.getElementById(
            "subjectSelect"
        );


    const assignBtn =
        document.getElementById(
            "assignBtn"
        );


    const formMessage =
        document.getElementById(
            "formMessage"
        );


    const assignmentTable =
        document.getElementById(
            "assignmentTable"
        );


    // ==========================================
    // ADMIN NAME
    // ==========================================

    if (adminName) {

        adminName.textContent =
            admin.username ||
            "Admin";

    }


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
    // LOAD TEACHERS
    // ==========================================

    async function loadTeachers() {

        try {

            const response =
                await fetch(
                    `${API}/admin/teachers`
                );


            const data =
                await getJSON(response);


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load teachers."
                );

            }


            teacherSelect.innerHTML = `
                <option value="">
                    Select Teacher
                </option>
            `;


            data.teachers.forEach(
                teacher => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        teacher.teacher_id;


                    option.textContent =
                        `${teacher.teacher_name} (${teacher.teacher_code})`;


                    teacherSelect.appendChild(
                        option
                    );

                }
            );


            console.log(
                "✅ Teachers loaded."
            );

        } catch (error) {

            console.error(
                "LOAD TEACHERS ERROR:",
                error
            );

            teacherSelect.innerHTML = `
                <option value="">
                    Unable to load teachers
                </option>
            `;

        }

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


            classSelect.innerHTML = `
                <option value="">
                    Select Class
                </option>
            `;


            data.classes.forEach(
                cls => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        cls.class_id;


                    option.textContent =
                        `${cls.class_id} — Year ${cls.year}, ${cls.branch}, Section ${cls.section}`;


                    classSelect.appendChild(
                        option
                    );

                }
            );


            console.log(
                "✅ Classes loaded."
            );

        } catch (error) {

            console.error(
                "LOAD CLASSES ERROR:",
                error
            );

            classSelect.innerHTML = `
                <option value="">
                    Unable to load classes
                </option>
            `;

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


            subjectSelect.innerHTML = `
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


            console.log(
                "✅ Subjects loaded."
            );

        } catch (error) {

            console.error(
                "LOAD SUBJECTS ERROR:",
                error
            );

            subjectSelect.innerHTML = `
                <option value="">
                    Unable to load subjects
                </option>
            `;

        }

    }


    // ==========================================
    // LOAD ASSIGNMENTS
    // ==========================================

    async function loadAssignments() {

        assignmentTable.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    Loading assignments...
                </td>
            </tr>
        `;


        try {

            const response =
                await fetch(
                    `${API}/admin/assignments`
                );


            const data =
                await getJSON(response);


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load assignments."
                );

            }


            if (
                !Array.isArray(
                    data.assignments
                ) ||
                data.assignments.length === 0
            ) {

                assignmentTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="loading">
                            No teacher assignments found.
                        </td>
                    </tr>
                `;

                return;

            }


            assignmentTable.innerHTML =
                "";


            data.assignments.forEach(
                assignment => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${assignment.teacher_name || "-"}
                        </td>

                        <td>
                            ${assignment.teacher_code || "-"}
                        </td>

                        <td>
                            ${assignment.class_id || "-"}
                        </td>

                        <td>
                            ${assignment.subject_code || "-"}
                            <br>
                            <small>
                                ${assignment.subject_name || ""}
                            </small>
                        </td>

                        <td>

                            <button
                                class="delete-btn"
                                data-id="${assignment.id}"
                            >
                                Remove
                            </button>

                        </td>

                    `;


                    assignmentTable.appendChild(
                        row
                    );

                }
            );


            // ==================================
            // DELETE EVENTS
            // ==================================

            const deleteButtons =
                assignmentTable.querySelectorAll(
                    ".delete-btn"
                );


            deleteButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const id =
                                button.dataset.id;


                            const confirmDelete =
                                confirm(
                                    "Remove this teacher assignment?"
                                );


                            if (
                                !confirmDelete
                            ) {

                                return;

                            }


                            await deleteAssignment(
                                id
                            );

                        }
                    );

                }
            );


        } catch (error) {

            console.error(
                "LOAD ASSIGNMENTS ERROR:",
                error
            );


            assignmentTable.innerHTML = `
                <tr>
                    <td colspan="5" class="loading">
                        ${error.message}
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // DELETE ASSIGNMENT
    // ==========================================

    async function deleteAssignment(
        assignmentId
    ) {

        try {

            const response =
                await fetch(
                    `${API}/admin/assignments/${assignmentId}`,
                    {
                        method:
                            "DELETE"
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
                    "Unable to remove assignment."
                );

            }


            alert(
                "Teacher assignment removed successfully."
            );


            await loadAssignments();

        } catch (error) {

            console.error(
                "DELETE ASSIGNMENT ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to remove assignment."
            );

        }

    }


    // ==========================================
    // ASSIGN TEACHER
    // ==========================================

    if (assignmentForm) {

        assignmentForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const teacherId =
                    teacherSelect.value;


                const classId =
                    classSelect.value;


                const subjectId =
                    subjectSelect.value;


                if (
                    !teacherId ||
                    !classId ||
                    !subjectId
                ) {

                    formMessage.textContent =
                        "Please select teacher, class and subject.";

                    formMessage.className =
                        "form-message error";

                    return;

                }


                assignBtn.disabled =
                    true;


                assignBtn.textContent =
                    "Assigning...";


                formMessage.textContent =
                    "";


                try {

                    const response =
                        await fetch(
                            `${API}/admin/assignments`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        teacherId:
                                            Number(
                                                teacherId
                                            ),

                                        classId:
                                            classId,

                                        subjectId:
                                            Number(
                                                subjectId
                                            )

                                    })

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
                            "Unable to assign teacher."
                        );

                    }


                    formMessage.textContent =
                        "Teacher assigned successfully!";

                    formMessage.className =
                        "form-message success";


                    assignmentForm.reset();


                    await loadAssignments();


                } catch (error) {

                    console.error(
                        "ASSIGN TEACHER ERROR:",
                        error
                    );


                    formMessage.textContent =
                        error.message ||
                        "Unable to assign teacher.";

                    formMessage.className =
                        "form-message error";

                } finally {

                    assignBtn.disabled =
                        false;

                    assignBtn.textContent =
                        "Assign Teacher →";

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
            async () => {

                await loadAssignments();

            }
        );

    }


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
    // INITIAL LOAD
    // ==========================================

    await Promise.all([

        loadTeachers(),

        loadClasses(),

        loadSubjects()

    ]);


    await loadAssignments();


    // ==========================================
    // READY
    // ==========================================

    console.log(
        "✅ Teacher Assignment page initialized."
    );

});