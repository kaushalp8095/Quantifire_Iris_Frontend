(function () {
    const path = window.location.pathname;
    const isLoggedIn = localStorage.getItem("isAgencyLoggedIn");
    const agencyEmail = localStorage.getItem("agencyEmail");

    // Ye check karo ki kya hum login page par hain
    const isLoginPage = path.includes("AgencyLogin.html") || path.endsWith("AgencyLogin.html") || path === "/";

    if (isLoginPage) {
        if (isLoggedIn === "true" && agencyEmail) {
            window.location.replace("AgencyDashboard.html");
            return; 
        }
        return; 
    }

    // DASHBOARD PROTECTION
    if (!isLoggedIn || isLoggedIn !== "true" || !agencyEmail) {    
        localStorage.clear();
        window.location.replace("AgencyLogin.html");
    }
})();