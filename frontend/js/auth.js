// ==========================================
// AUTHENTICATION SYSTEM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginForm =
            document.getElementById("loginForm");


        if (!loginForm) {
            return;
        }


        const roleTabs =
            document.querySelectorAll(
                ".role-tab"
            );

        const selectedRole =
            document.getElementById(
                "selectedRole"
            );

        const loginId =
            document.getElementById(
                "loginId"
            );

        const loginIdLabel =
            document.getElementById(
                "loginIdLabel"
            );

        const password =
            document.getElementById(
                "password"
            );

        const passwordToggle =
            document.getElementById(
                "passwordToggle"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        // ==========================================
        // ROLE SELECTION
        // ==========================================

        roleTabs.forEach(
            (tab) => {

                tab.addEventListener(
                    "click",
                    () => {

                        roleTabs.forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        tab.classList.add(
                            "active"
                        );


                        const role =
                            tab.dataset.role;


                        selectedRole.value =
                            role;


                        if (role === "student") {

                            loginIdLabel.textContent =
                                "University Roll Number";

                            loginId.placeholder =
                                "Enter your roll number";

                        }


                        if (role === "teacher") {

                            loginIdLabel.textContent =
                                "Teacher Code";

                            loginId.placeholder =
                                "Enter your teacher code";

                        }


                        if (role === "admin") {

                            loginIdLabel.textContent =
                                "Admin Code";

                            loginId.placeholder =
                                "Enter your admin code";

                        }


                        loginId.value = "";

                        password.value = "";

                        showMessage("", "");

                    }
                );

            }
        );


        // ==========================================
        // PASSWORD SHOW / HIDE
        // ==========================================

        if (passwordToggle) {

            passwordToggle.addEventListener(
                "click",
                () => {

                    if (
                        password.type ===
                        "password"
                    ) {

                        password.type =
                            "text";

                        passwordToggle.textContent =
                            "◉";

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        password.type =
                            "password";

                        passwordToggle.textContent =
                            "◉";

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }


        // ==========================================
        // LOGIN SUBMIT
        // ==========================================

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const role =
                    selectedRole.value;

                const loginValue =
                    loginId.value.trim();

                const passwordValue =
                    password.value;


                if (
                    !loginValue ||
                    !passwordValue
                ) {

                    showMessage(
                        "Please enter your login details.",
                        "error"
                    );

                    return;
                }


                showMessage(
                    "Signing in...",
                    "loading"
                );


                try {

                    const response =
                        await fetch(
                            "http://localhost:5000/api/auth/login",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        role:
                                            role,

                                        loginId:
                                            loginValue,

                                        password:
                                            passwordValue
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        showMessage(
                            data.message ||
                            "Invalid login details.",
                            "error"
                        );

                        return;
                    }


                    // ==================================
                    // SAVE USER
                    // ==================================

                    localStorage.removeItem(
                        "student"
                    );

                    localStorage.removeItem(
                        "teacher"
                    );

                    localStorage.removeItem(
                        "admin"
                    );


                    if (role === "student") {

                        localStorage.setItem(
                            "student",
                            JSON.stringify(
                                data.user
                            )
                        );

                    }


                    if (role === "teacher") {

                        localStorage.setItem(
                            "teacher",
                            JSON.stringify(
                                data.user
                            )
                        );

                    }


                    if (role === "admin") {

                        localStorage.setItem(
                            "admin",
                            JSON.stringify(
                                data.user
                            )
                        );

                    }


                    showMessage(
                        "Login successful! Redirecting...",
                        "success"
                    );


                    // ==================================
                    // REDIRECT
                    // ==================================

                    setTimeout(
                        () => {

                            if (
                                role ===
                                "student"
                            ) {

                                window.location.href =
                                    "student-dashboard.html";

                                return;
                            }


                            if (
                                role ===
                                "teacher"
                            ) {

                                window.location.href =
                                    "teacher-dashboard.html";

                                return;
                            }


                            if (
                                role ===
                                "admin"
                            ) {

                                window.location.href =
                                    "admin-dashboard.html";

                                return;
                            }

                        },
                        700
                    );


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        "Unable to connect to server.",
                        "error"
                    );

                }

            }
        );


        // ==========================================
        // MESSAGE
        // ==========================================

        function showMessage(
            message,
            type
        ) {

            if (!loginMessage) {
                return;
            }


            loginMessage.textContent =
                message;


            loginMessage.className =
                "login-message " +
                type;

        }

    }
);