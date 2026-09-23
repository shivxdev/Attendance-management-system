// ==========================================
// SUBJECT MANAGEMENT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        // ==========================================
        // ELEMENTS
        // ==========================================

        const adminName =
            document.getElementById(
                "adminName"
            );


        const subjectForm =
            document.getElementById(
                "subjectForm"
            );


        const subjectCode =
            document.getElementById(
                "subjectCode"
            );


        const subjectName =
            document.getElementById(
                "subjectName"
            );


        const addSubjectBtn =
            document.getElementById(
                "addSubjectBtn"
            );


        const formMessage =
            document.getElementById(
                "formMessage"
            );


        const subjectTable =
            document.getElementById(
                "subjectTable"
            );


        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        const backBtn =
            document.getElementById(
                "backBtn"
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
                    "Server returned invalid JSON."
                );

            }

        }


        // ==========================================
        // LOAD SUBJECTS
        // ==========================================

        async function loadSubjects() {

            subjectTable.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="loading"
                    >
                        Loading subjects...
                    </td>

                </tr>

            `;


            try {

                const response =
                    await fetch(
                        `${API}/admin/subjects`
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
                        "Unable to load subjects."
                    );

                }


                if (
                    !Array.isArray(
                        data.subjects
                    ) ||
                    data.subjects.length === 0
                ) {

                    subjectTable.innerHTML = `

                        <tr>

                            <td
                                colspan="5"
                                class="loading"
                            >
                                No subjects found.
                            </td>

                        </tr>

                    `;

                    return;

                }


                subjectTable.innerHTML =
                    "";


                data.subjects.forEach(
                    subject => {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        const createdDate =
                            subject.created_at
                                ? new Date(
                                    subject.created_at
                                ).toLocaleDateString()
                                : "-";


                        row.innerHTML = `

                            <td>
                                ${subject.subject_id}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        subject.subject_code
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    subject.subject_name
                                )}
                            </td>

                            <td>
                                ${createdDate}
                            </td>

                            <td>

                                <button
                                    class="delete-btn"
                                    data-id="${subject.subject_id}"
                                >
                                    Delete
                                </button>

                            </td>

                        `;


                        subjectTable.appendChild(
                            row
                        );

                    }
                );


                // ==================================
                // DELETE EVENTS
                // ==================================

                const deleteButtons =
                    document.querySelectorAll(
                        ".delete-btn"
                    );


                deleteButtons.forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                deleteSubject(
                                    button.dataset.id
                                );

                            }
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "LOAD SUBJECTS ERROR:",
                    error
                );


                subjectTable.innerHTML = `

                    <tr>

                        <td
                            colspan="5"
                            class="loading"
                        >
                            ${escapeHTML(
                                error.message ||
                                "Unable to load subjects."
                            )}
                        </td>

                    </tr>

                `;

            }

        }


        // ==========================================
        // ADD SUBJECT
        // ==========================================

        if (subjectForm) {

            subjectForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const code =
                        subjectCode.value.trim();


                    const name =
                        subjectName.value.trim();


                    if (!code || !name) {

                        showMessage(
                            "Please fill all fields.",
                            "error"
                        );

                        return;

                    }


                    addSubjectBtn.disabled =
                        true;

                    addSubjectBtn.textContent =
                        "Adding...";


                    showMessage(
                        "",
                        ""
                    );


                    try {

                        const response =
                            await fetch(
                                `${API}/admin/subjects`,
                                {

                                    method: "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            subjectCode:
                                                code,

                                            subjectName:
                                                name

                                        })

                                }
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
                                "Unable to create subject."
                            );

                        }


                        showMessage(
                            "Subject created successfully.",
                            "success"
                        );


                        subjectForm.reset();


                        await loadSubjects();


                    } catch (error) {

                        console.error(
                            "ADD SUBJECT ERROR:",
                            error
                        );


                        showMessage(
                            error.message ||
                            "Unable to create subject.",
                            "error"
                        );

                    } finally {

                        addSubjectBtn.disabled =
                            false;

                        addSubjectBtn.textContent =
                            "Add Subject →";

                    }

                }
            );

        }


        // ==========================================
        // DELETE SUBJECT
        // ==========================================

        async function deleteSubject(
            subjectId
        ) {

            const confirmed =
                confirm(
                    "Are you sure you want to delete this subject?"
                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API}/admin/subjects/${encodeURIComponent(
                            subjectId
                        )}`,
                        {

                            method: "DELETE"

                        }
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
                        "Unable to delete subject."
                    );

                }


                alert(
                    "Subject deleted successfully."
                );


                await loadSubjects();


            } catch (error) {

                console.error(
                    "DELETE SUBJECT ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to delete subject."
                );

            }

        }


        // ==========================================
        // REFRESH
        // ==========================================

        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                () => {

                    loadSubjects();

                }
            );

        }


        // ==========================================
        // MESSAGE
        // ==========================================

        function showMessage(
            message,
            type
        ) {

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

            if (value === null ||
                value === undefined) {

                return "";

            }


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
        // INITIAL LOAD
        // ==========================================

        loadSubjects();


        console.log(
            "✅ Subject Management initialized."
        );

    }
);