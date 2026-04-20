(function () {
    // ✅ JS-readable cookie reader
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("agencylogin.html");

    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyId = localStorage.getItem("agencyId");
    const loginTime = localStorage.getItem("loginTime");

    // ✅ KEY FIX: Cookie delete hui? → Logout force karo
    // isAgencyLoggedIn cookie NOT httpOnly, so JS padh sakta hai
    const cookiePresent = getCookie("isAgencyLoggedIn");
    if (isLoggedIn === "true" && !cookiePresent) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("AgencyLogin.html");
        return;
    }

    // 1. ⏰ SESSION EXPIRY (24 Hours)
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
        if (isLoggedIn === "true" && agencyId && cookiePresent) {
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

})();