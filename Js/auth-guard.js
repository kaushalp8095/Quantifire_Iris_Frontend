(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("agencylogin.html");

    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyId = localStorage.getItem("agencyId");
    const loginTime = localStorage.getItem("loginTime");

    // 1. ⏰ SESSION EXPIRY (24 Hours Check)
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

    // 3. 🔒 PROTECT DASHBOARD
    if (isLoggedIn !== "true" || !agencyId) {
        localStorage.clear();
        window.location.replace("AgencyLogin.html");
        return;
    }

    // 4. 🔴 BACKEND SESSION VALIDATION (Ping)
    // Ye check karega ki kya backend par session zinda hai
    fetch(`https://quantifire-iris-backend.onrender.com/api/agency/profile?email=${localStorage.getItem("agencyEmail")}`, {
        priority: 'high',
        headers: { 'Cache-Control': 'no-cache' }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) throw new Error("UNAUTHORIZED");
    })
    .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
            localStorage.clear();
            window.location.replace("AgencyLogin.html?session=invalid");
        }
    });
})();