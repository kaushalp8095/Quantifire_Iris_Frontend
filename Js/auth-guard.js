(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("agencylogin.html");

    // Variables ko sirf EK BAAR declare kiya hai
    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyId = localStorage.getItem("agencyId");
    const agencyEmail = localStorage.getItem("agencyEmail");
    const loginTime = parseInt(localStorage.getItem("loginTime") || "0");

    // 1. ⏰ SESSION EXPIRY (Frontend 24 Hours Check)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (isLoggedIn === "true" && loginTime) {
        if (new Date().getTime() - loginTime > ONE_DAY) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("AgencyLogin.html?session=expired");
            return;
        }
    }

    // 2. 🛡️ LOGIN PAGE REDIRECT
    if (isLoginPage) {
        if (isLoggedIn === "true" && agencyId) {
            window.location.replace("AgencyDashboard.html");
        }
        return;
    }

    // 3. 🔒 PROTECT DASHBOARD (Local Check)
    if (isLoggedIn !== "true" || !agencyId) {
        localStorage.clear();
        window.location.replace("AgencyLogin.html");
        return;
    }

    // 4. 🔴 BACKEND SESSION VALIDATION (With Grace Period)
    const timeSinceLogin = new Date().getTime() - loginTime;

    // Agar login kiye hue 4 seconds se kam waqt hua hai, toh validation skip karo
    // Isse cookie set hone ka time mil jayega aur Loop nahi banega
    if (timeSinceLogin > 4000) {
        fetch(`https://quantifire-iris-backend.onrender.com/api/agency/profile?email=${agencyEmail}`, {
            method: 'GET',
            credentials: 'include' // 🔴 Cookies bhejne ke liye compulsory
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) throw new Error("UNAUTHORIZED");
        })
        .catch((err) => {
            if (err.message === "UNAUTHORIZED") {
                console.warn("Unauthorized! Redirecting...");
                localStorage.clear();
                window.location.replace("AgencyLogin.html?session=invalid");
            }
        });
    } else {
        console.log("Grace period active, skipping backend validation.");
    }
})();