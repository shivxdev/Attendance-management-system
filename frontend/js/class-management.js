// ==========================================
// CLASS MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API = "http://localhost:5000/api";


    // ==========================================
    // GET ADMIN
    // ==========================================

    let admin = null;

    try {

        admin = JSON.parse(
            localStorage.getItem("admin")
        );

    } catch (error) {

        console.error(
            "Admin localStorage error:",
            error
        );

    }


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

    const classForm =
        document.getElementById("classForm");

    const year =
        document.getElementById("year");

    const branch =
        document.getElementById("branch");

    const section =
        document.getElementById("section");

    const semester =
        document.getElementById("semester");

    const classId =
        document.getElementById("classId");

    const addClassBtn =
        document.getElementById("addClassBtn");

    const formMessage =
        document.getElementById("formMessage");

    const classTableBody =
        document.getElementById("classTableBody");

    const refreshBtn =
        document.getElementById("refreshBtn");


    // ==========================================
    // ADMIN NAME
    // ==========================================

    if (adminName) {

        adminName.textContent =
            admin.username || "Admin";

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
                `Server returned invalid response (${response.status})`
            );

        }

    }


    // ==========================================
    // LOAD CLASSES
    // ==========================================

    async function loadClasses() {

        if (!classTableBody) {
            return;
        }

        classTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Loading classes...
                </td>
            </tr>
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


            if (
                !Array.isArray(data.classes) ||
                data.classes.length === 0
            ) {

                classTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="loading">
                            No classes found.
                        </td>
                    </tr>
                `;

                return;

            }


            classTableBody.innerHTML = "";


            data.classes.forEach(cls => {

                const row =
                    document.createElement("tr");


                const createdDate =
                    cls.created_at
                        ? new Date(
                            cls.created_at
                        ).toLocaleDateString()
                        : "-";


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHTML(cls.class_id)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(cls.year)}
                    </td>

                    <td>
                        ${escapeHTML(cls.branch)}
                    </td>

                    <td>
                        ${escapeHTML(cls.section)}
                    </td>

                    <td>
                        ${escapeHTML(cls.semester)}
                    </td>

                    <td>
                        ${createdDate}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="delete-btn"
                            data-class-id="${escapeHTML(cls.class_id)}"
                        >
                            Delete
                        </button>

                    </td>

                `;


                classTableBody.appendChild(row);

            });


            // ======================================
            // DELETE BUTTONS
            // ======================================

            const deleteButtons =
                document.querySelectorAll(
                    ".delete-btn"
                );


            deleteButtons.forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.classId;


                        const confirmDelete =
                            confirm(
                                `Delete class "${id}"?`
                            );


                        if (!confirmDelete) {
                            return;
                        }


                        await deleteClass(id);

                    }
                );

            });


        } catch (error) {

            console.error(
                "LOAD CLASSES ERROR:",
                error
            );


            classTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

        }

    }


    // ==========================================
    // ADD CLASS
    // ==========================================

    if (classForm) {

        classForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                showMessage("", "");


                // ======================================
                // COLLECT FORM DATA
                // ======================================

                const classData = {

                    // IMPORTANT:
                    // Backend expects classId
                    classId:
                        classId.value.trim(),

                    year:
                        Number(year.value),

                    branch:
                        branch.value.trim(),

                    section:
                        section.value.trim(),

                    semester:
                        Number(semester.value)

                };


                console.log(
                    "SENDING CLASS DATA:",
                    classData
                );


                // ======================================
                // VALIDATION
                // ======================================

                if (
                    !classData.classId ||
                    !classData.year ||
                    !classData.branch ||
                    !classData.section ||
                    !classData.semester
                ) {

                    showMessage(
                        "Please fill all fields.",
                        "error"
                    );

                    return;

                }


                // ======================================
                // DISABLE BUTTON
                // ======================================

                addClassBtn.disabled = true;

                addClassBtn.textContent =
                    "Adding...";


                try {

                    const response =
                        await fetch(
                            `${API}/admin/classes`,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        classData
                                    )

                            }
                        );


                    const data =
                        await getJSON(response);


                    console.log(
                        "ADD CLASS RESPONSE:",
                        data
                    );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to add class."
                        );

                    }


                    // ======================================
                    // SUCCESS
                    // ======================================

                    showMessage(
                        "Class added successfully.",
                        "success"
                    );


                    classForm.reset();


                    await loadClasses();


                } catch (error) {

                    console.error(
                        "ADD CLASS ERROR:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to add class.",
                        "error"
                    );

                } finally {

                    addClassBtn.disabled =
                        false;

                    addClassBtn.textContent =
                        "Add Class →";

                }

            }
        );

    }


    // ==========================================
    // DELETE CLASS
    // ==========================================

    async function deleteClass(id) {

        try {

            const response =
                await fetch(
                    `${API}/admin/classes/${encodeURIComponent(id)}`,
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
                    "Unable to delete class."
                );

            }


            showMessage(
                "Class deleted successfully.",
                "success"
            );


            await loadClasses();


        } catch (error) {

            console.error(
                "DELETE CLASS ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to delete class."
            );

        }

    }


    // ==========================================
    // REFRESH
    // ==========================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadClasses
        );

    }


    // ==========================================
    // MESSAGE
    // ==========================================

    function showMessage(message, type) {

        if (!formMessage) {
            return;
        }


        formMessage.textContent =
            message;


        formMessage.className =
            "form-message";


        if (type) {

            formMessage.classList.add(
                type
            );

        }

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadClasses();


    console.log(
        "✅ Class Management initialized successfully."
    );

});