(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("agencylogin.html");

    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyId = localStorage.getItem("agencyId");
    const agencyEmail = localStorage.getItem("agencyEmail");

    // 1. 🛡️ LOGIN PAGE LOGIC
    if (isLoginPage) {
        if (isLoggedIn === "true" && agencyId) {
            window.location.replace("AgencyDashboard.html");
        }
        return;
    }

    // 2. 🔒 BASIC LOCALSTORAGE CHECK
    if (isLoggedIn !== "true" || !agencyId) {
        localStorage.clear();
        window.location.replace("AgencyLogin.html");
        return;
    }

    // 3. 🔴 LIVE COOKIE VALIDATION (The Fix)
   
    fetch(`https://quantifire-iris-backend.onrender.com/api/agency/profile?email=${agencyEmail}`, {
        priority: 'high',
        headers: { 'Cache-Control': 'no-cache' }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            // 🚨 COOKIE GAYAB HAI!
            console.error("Session Cookie Missing. Logging out...");
            throw new Error("UNAUTHORIZED");
        }
    })
    .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("AgencyLogin.html?error=session_expired");
        }
    });
})();