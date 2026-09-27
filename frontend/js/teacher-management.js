// ==========================================
// TEACHER MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "https://attendance-management-system-production-72c4.up.railway.app/api";


    // ==========================================
    // ELEMENTS
    // ==========================================

    const teacherForm =
        document.getElementById("teacherForm");

    const teacherTable =
        document.getElementById("teacherTable");

    const addTeacherBtn =
        document.getElementById("addTeacherBtn");

    const refreshBtn =
        document.getElementById("refreshBtn");

    const backBtn =
        document.getElementById("backBtn");

    const formMessage =
        document.getElementById("formMessage");


    // ==========================================
    // INPUTS
    // ==========================================

    const teacherCode =
        document.getElementById("teacherCode");

    const teacherName =
        document.getElementById("teacherName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const department =
        document.getElementById("department");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");


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
                "Server returned invalid JSON."
            );

        }

    }


    // ==========================================
    // LOAD TEACHERS
    // ==========================================

    async function loadTeachers() {

        teacherTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Loading teachers...
                </td>
            </tr>
        `;


        try {

            const response =
                await fetch(
                    `${API}/admin/teachers`
                );


            const data =
                await getJSON(response);


            console.log(
                "TEACHERS RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load teachers."
                );

            }


            if (
                !Array.isArray(data.teachers) ||
                data.teachers.length === 0
            ) {

                teacherTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="loading">
                            No teachers found.
                        </td>
                    </tr>
                `;

                return;

            }


            teacherTable.innerHTML = "";


            data.teachers.forEach(
                teacher => {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${teacher.teacher_id ?? "-"}
                        </td>

                        <td>
                            ${teacher.teacher_code ?? "-"}
                        </td>

                        <td>
                            ${teacher.teacher_name ?? "-"}
                        </td>

                        <td>
                            ${teacher.email ?? "-"}
                        </td>

                        <td>
                            ${teacher.phone ?? "-"}
                        </td>

                        <td>
                            ${teacher.department ?? "-"}
                        </td>

                        <td>

                            <button
                                class="delete-btn"
                                data-id="${teacher.teacher_id}"
                            >
                                Delete
                            </button>

                        </td>

                    `;


                    teacherTable.appendChild(row);

                }
            );


            // ======================================
            // DELETE EVENTS
            // ======================================

            document
                .querySelectorAll(".delete-btn")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const teacherId =
                                button.dataset.id;

                            deleteTeacher(
                                teacherId
                            );

                        }
                    );

                });


        } catch (error) {

            console.error(
                "LOAD TEACHERS ERROR:",
                error
            );


            teacherTable.innerHTML = `
                <tr>
                    <td colspan="7" class="loading">
                        ${error.message}
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // ADD TEACHER
    // ==========================================

    if (teacherForm) {

        teacherForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                formMessage.textContent = "";
                formMessage.className =
                    "form-message";


                addTeacherBtn.disabled = true;

                addTeacherBtn.textContent =
                    "Adding Teacher...";


                try {

                    const body = {

                        teacherCode:
                            teacherCode.value.trim(),

                        teacherName:
                            teacherName.value.trim(),

                        email:
                            email.value.trim(),

                        phone:
                            phone.value.trim(),

                        department:
                            department.value.trim(),

                        username:
                            username.value.trim(),

                        password:
                            password.value

                    };


                    console.log(
                        "ADDING TEACHER:",
                        body
                    );


                    const response =
                        await fetch(
                            `${API}/admin/teachers`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(body)

                            }
                        );


                    const data =
                        await getJSON(response);


                    console.log(
                        "ADD TEACHER RESPONSE:",
                        data
                    );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to add teacher."
                        );

                    }


                    // ==================================
                    // SUCCESS
                    // ==================================

                    formMessage.textContent =
                        "Teacher added successfully.";

                    formMessage.className =
                        "form-message success";


                    teacherForm.reset();


                    // Reload table

                    await loadTeachers();


                } catch (error) {

                    console.error(
                        "ADD TEACHER ERROR:",
                        error
                    );


                    formMessage.textContent =
                        error.message ||
                        "Unable to add teacher.";

                    formMessage.className =
                        "form-message error";


                } finally {

                    addTeacherBtn.disabled =
                        false;

                    addTeacherBtn.textContent =
                        "Add Teacher →";

                }

            }
        );

    }


    // ==========================================
    // DELETE TEACHER
    // ==========================================

    async function deleteTeacher(teacherId) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this teacher?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/admin/teachers/${teacherId}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await getJSON(response);


            console.log(
                "DELETE TEACHER RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to delete teacher."
                );

            }


            alert(
                "Teacher deleted successfully."
            );


            await loadTeachers();


        } catch (error) {

            console.error(
                "DELETE TEACHER ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to delete teacher."
            );

        }

    }


    // ==========================================
    // REFRESH
    // ==========================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadTeachers
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

    loadTeachers();


    console.log(
        "✅ Teacher Management initialized."
    );

});