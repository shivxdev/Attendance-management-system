// ==========================================
// ADMIN DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API = "http://localhost:5000/api";


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

    const adminName =
        document.getElementById(
            "adminName"
        );

    const welcomeAdminName =
        document.getElementById(
            "welcomeAdminName"
        );

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );

    const totalTeachers =
        document.getElementById(
            "totalTeachers"
        );

    const totalClasses =
        document.getElementById(
            "totalClasses"
        );

    const totalSubjects =
        document.getElementById(
            "totalSubjects"
        );

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    // ==========================================
    // INITIAL ADMIN NAME
    // ==========================================

    const initialName =
        admin.username ||
        admin.admin_name ||
        admin.name ||
        "Admin";


    if (adminName) {

        adminName.textContent =
            initialName;

    }


    if (welcomeAdminName) {

        welcomeAdminName.textContent =
            initialName;

    }


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
                "Server returned invalid response."
            );

        }

    }


    // ==========================================
    // LOAD ADMIN DASHBOARD
    // ==========================================

    async function loadDashboard() {

        try {

            // --------------------------------------
            // GET ADMIN ID
            // --------------------------------------

            const adminId =
                admin.user_id ||
                admin.admin_id ||
                admin.id;


            if (!adminId) {

                throw new Error(
                    "Admin ID missing. Please login again."
                );

            }


            console.log(
                "Loading dashboard for Admin ID:",
                adminId
            );


            // --------------------------------------
            // API REQUEST
            // --------------------------------------

            const response =
                await fetch(
                    `${API}/admin/dashboard/${adminId}`
                );


            // --------------------------------------
            // GET JSON
            // --------------------------------------

            const data =
                await getJSON(response);


            console.log(
                "ADMIN DASHBOARD DATA:",
                data
            );


            // --------------------------------------
            // CHECK RESPONSE
            // --------------------------------------

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load admin dashboard."
                );

            }


            // ======================================
            // ADMIN INFORMATION
            // ======================================

            if (data.admin) {

                const adminData =
                    data.admin;


                const displayName =
                    adminData.username ||
                    initialName ||
                    "Admin";


                if (adminName) {

                    adminName.textContent =
                        displayName;

                }


                if (welcomeAdminName) {

                    welcomeAdminName.textContent =
                        displayName;

                }

            }


            // ======================================
            // STATISTICS
            // ======================================

            const statistics =
                data.statistics || {};


            // Students

            if (totalStudents) {

                totalStudents.textContent =
                    statistics.students ?? 0;

            }


            // Teachers

            if (totalTeachers) {

                totalTeachers.textContent =
                    statistics.teachers ?? 0;

            }


            // Classes

            if (totalClasses) {

                totalClasses.textContent =
                    statistics.classes ?? 0;

            }


            // Subjects

            if (totalSubjects) {

                totalSubjects.textContent =
                    statistics.subjects ?? 0;

            }


            console.log(
                "✅ Admin dashboard loaded successfully."
            );

        } catch (error) {

            console.error(
                "ADMIN DASHBOARD ERROR:",
                error
            );


            // Show fallback

            if (totalStudents) {

                totalStudents.textContent =
                    "—";

            }

            if (totalTeachers) {

                totalTeachers.textContent =
                    "—";

            }

            if (totalClasses) {

                totalClasses.textContent =
                    "—";

            }

            if (totalSubjects) {

                totalSubjects.textContent =
                    "—";

            }


            alert(
                error.message ||
                "Unable to load admin dashboard."
            );

        }

    }


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    await loadDashboard();


    // ==========================================
    // MANAGEMENT BUTTONS
    // ==========================================

    const studentsBtn =
        document.getElementById(
            "studentsBtn"
        );

    const teachersBtn =
        document.getElementById(
            "teachersBtn"
        );

    const classesBtn =
        document.getElementById(
            "classesBtn"
        );

    const subjectsBtn =
        document.getElementById(
            "subjectsBtn"
        );

    const assignmentsBtn =
        document.getElementById(
            "assignmentsBtn"
        );

    const attendanceBtn =
        document.getElementById(
            "attendanceBtn"
        );


    // ==========================================
    // STUDENT MANAGEMENT
    // ==========================================

    if (studentsBtn) {

        studentsBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "student-management.html";

            }
        );

    }


    // ==========================================
    // TEACHER MANAGEMENT
    // ==========================================

    if (teachersBtn) {

        teachersBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-management.html";

            }
        );

    }


    // ==========================================
    // CLASS MANAGEMENT
    // ==========================================

    if (classesBtn) {

        classesBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "class-management.html";

            }
        );

    }


    // ==========================================
    // SUBJECT MANAGEMENT
    // ==========================================

    if (subjectsBtn) {

        subjectsBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "subject-management.html";

            }
        );

    }


    // ==========================================
    // TEACHER ASSIGNMENT
    // ==========================================

    if (assignmentsBtn) {

        assignmentsBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-assignment.html";

            }
        );

    }


    // ==========================================
    // ATTENDANCE OVERVIEW
    // ==========================================

    if (attendanceBtn) {

        attendanceBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-attendance.html";

            }
        );

    }


    // ==========================================
    // QUICK ACTIONS
    // ==========================================

    const quickStudent =
        document.getElementById(
            "quickStudent"
        );

    const quickTeacher =
        document.getElementById(
            "quickTeacher"
        );

    const quickClass =
        document.getElementById(
            "quickClass"
        );

    const quickSubject =
        document.getElementById(
            "quickSubject"
        );


    // ==========================================
    // QUICK - ADD STUDENT
    // ==========================================

    if (quickStudent) {

        quickStudent.addEventListener(
            "click",
            () => {

                window.location.href =
                    "student-management.html";

            }
        );

    }


    // ==========================================
    // QUICK - ADD TEACHER
    // ==========================================

    if (quickTeacher) {

        quickTeacher.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-management.html";

            }
        );

    }


    // ==========================================
    // QUICK - ADD CLASS
    // ==========================================

    if (quickClass) {

        quickClass.addEventListener(
            "click",
            () => {

                window.location.href =
                    "class-management.html";

            }
        );

    }


    // ==========================================
    // QUICK - ADD SUBJECT
    // ==========================================

    if (quickSubject) {

        quickSubject.addEventListener(
            "click",
            () => {

                window.location.href =
                    "subject-management.html";

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
    // READY
    // ==========================================

    console.log(
        "✅ Admin Dashboard initialized successfully."
    );

});