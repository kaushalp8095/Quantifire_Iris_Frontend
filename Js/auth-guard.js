(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("agencylogin.html");

    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyId = localStorage.getItem("agencyId");
    const agencyEmail = localStorage.getItem("agencyEmail");
    const loginTime = localStorage.getItem("loginTime");

    // 1. ⏰ SESSION EXPIRY (Frontend 24 Hours Check)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (isLoggedIn === "true" && loginTime) {
        if (new Date().getTime() - parseInt(loginTime) > ONE_DAY) {
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

    // 4. 🔴 BACKEND SESSION VALIDATION (The Real Fix)
    // Hum profile API ko hit kar rahe hain jo ki ab SECURE hai
    fetch(`https://quantifire-iris-backend.onrender.com/api/agency/profile?email=${agencyEmail}`, {
        method: 'GET',
        priority: 'high',
        credentials: 'include', // 🔴 YE LINE SABSE ZAROORI HAI (Cookie bhejne ke liye)
        headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    })
    .then(res => {
        // Agar Backend 401 bhejta hai (Cookie missing or invalid)
        if (res.status === 401 || res.status === 403) {
            console.warn("Unauthorized! Redirecting to login...");
            throw new Error("UNAUTHORIZED");
        }
    })
    .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("AgencyLogin.html?session=invalid");
        }
    });
})();