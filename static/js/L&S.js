(function () {
    function getParam(name, fallback) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || fallback;
    }

    function safeNameFromEmail(email) {
        if (!email || !email.includes("@")) return "Citizen";
        return email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, function (s) { return s.toUpperCase(); });
    }

    function buildAvatarFromName(name) {
        const seed = encodeURIComponent(name || "Citizen");
        return "https://ui-avatars.com/api/?name=" + seed + "&background=6366f1&color=ffffff&size=256";
    }

    function buildGoogleStyleAvatar(email) {
        const safe = encodeURIComponent(email || "citizen@cleanindia.app");
        return "https://www.gravatar.com/avatar/?d=identicon&s=256&f=y&email=" + safe;
    }

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const emailInput = document.getElementById("email");
    const usernameHidden = document.getElementById("usernameHidden");
    const usernameInput = document.getElementById("username");
    const profileHidden = document.getElementById("profileUrlHidden");
    const nextInput = document.getElementById("nextUrl");
    const facebookFillBtn = document.getElementById("facebookFillBtn");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const togglePasswordBtn = document.getElementById("togglePasswordBtn");
    const togglePasswordIcon = document.getElementById("togglePasswordIcon");
    const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPasswordBtn");
    const toggleConfirmPasswordIcon = document.getElementById("toggleConfirmPasswordIcon");
    const signupError = document.getElementById("signupError");

    if (nextInput) {
        nextInput.value = getParam("next", "/home");
    }

    function applySocialProfile(buttonEl, labelText) {
        const mail = emailInput ? emailInput.value.trim() : "";
        if (!mail) {
            alert("Enter your email first.");
            return;
        }
        if (usernameHidden) usernameHidden.value = safeNameFromEmail(mail);
        if (profileHidden) profileHidden.value = buildGoogleStyleAvatar(mail);
        if (buttonEl) {
            const labelNode = buttonEl.querySelector("span");
            if (labelNode) labelNode.textContent = labelText;
        }
    }

    if (facebookFillBtn) {
        facebookFillBtn.addEventListener("click", function () {
            applySocialProfile(facebookFillBtn, "Facebook Selected");
        });
    }

    if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
        togglePasswordBtn.addEventListener("click", function () {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePasswordIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
            togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });
    }

    if (toggleConfirmPasswordBtn && confirmPasswordInput && toggleConfirmPasswordIcon) {
        toggleConfirmPasswordBtn.addEventListener("click", function () {
            const isPassword = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isPassword ? "text" : "password";
            toggleConfirmPasswordIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
            toggleConfirmPasswordBtn.setAttribute("aria-label", isPassword ? "Hide confirm password" : "Show confirm password");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function () {
            const mail = (emailInput ? emailInput.value.trim() : "") || "";
            const name = (usernameHidden && usernameHidden.value.trim()) || safeNameFromEmail(mail) || "Citizen";
            const profile = (profileHidden && profileHidden.value.trim()) || buildAvatarFromName(name);
            if (usernameHidden) usernameHidden.value = name;
            if (profileHidden) profileHidden.value = profile;

            try {
                localStorage.setItem("cleanSightUser", JSON.stringify({
                    name: name,
                    email: mail,
                    profileUrl: profile
                }));
            } catch (e) {
                console.error("Unable to save login session", e);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            const mail = (emailInput ? emailInput.value.trim() : "") || "";
            const pass = (passwordInput ? passwordInput.value : "") || "";
            const confirmPass = (confirmPasswordInput ? confirmPasswordInput.value : "") || "";
            const name = (usernameInput ? usernameInput.value.trim() : "") || safeNameFromEmail(mail) || "Citizen";

            if (pass !== confirmPass) {
                e.preventDefault();
                if (signupError) signupError.classList.remove("d-none");
                return;
            }
            if (signupError) signupError.classList.add("d-none");

            const profile = (profileHidden && profileHidden.value.trim()) || buildAvatarFromName(name);
            if (profileHidden) profileHidden.value = profile;

            try {
                localStorage.setItem("cleanSightUser", JSON.stringify({
                    name: name,
                    email: mail,
                    profileUrl: profile
                }));
            } catch (err) {
                console.error("Unable to save signup session", err);
            }
        });
    }
})();
