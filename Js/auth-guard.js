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

    // 🔴 GRACE PERIOD: Login ke turant baad 3 second tak validation skip karo
    const timeSinceLogin = new Date().getTime() - parseInt(loginTime || 0);
    if (timeSinceLogin < 3000) { 
        console.log("Grace period active...");
        return; 
    }

    // 4. 🔴 BACKEND SESSION VALIDATION (The Real Fix)
    // Hum profile API ko hit kar rahe hain jo ki ab SECURE hai

    // auth-guard.js ke end mein Section 4 ko aise update karein
    const loginTime = localStorage.getItem("loginTime");
    const timeSinceLogin = new Date().getTime() - parseInt(loginTime);

    // Agar login kiye hue 4 seconds se kam waqt hua hai, toh validation skip karo
    if (!isLoginPage && isLoggedIn === "true" && timeSinceLogin > 4000) {
        fetch(`https://quantifire-iris-backend.onrender.com/api/agency/profile?email=${agencyEmail}`, {
            method: 'GET',
            credentials: 'include'
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
    }

})();