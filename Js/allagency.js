// ==========================================
// 1. AJAX GLOBAL SETUP & ERROR HANDLER
// ==========================================

// 🟢 Sabse upar setup kar do taaki har request mein credentials jayein
$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true
});

// URL replacement logic
$.ajaxPrefilter(function (options) {
    var oldBase = "http://localhost:8080";
    var liveBase = "https://quantifire-iris-backend.onrender.com";

    if (options.url.indexOf(oldBase) !== -1) {
        options.url = options.url.replace(oldBase, liveBase);
    }
});

// 🔴 GLOBAL ERROR HANDLER (Isko Prefilter se BAHAR rakhein)
$(document).ajaxError(function (event, jqXHR, settings) {
    // 🟢 AGAR REQUEST LOGIN KI HAI, TOH IGNORE KARO
    if (settings.url.includes("/api/agency/login")) {
        return; 
    }

    // 🔴 AGAR STATUS 401/403 HAI AUR HUM DASHBOARD PAR HAIN
    if (jqXHR.status === 401 || jqXHR.status === 403) {
        const isLoginPage = window.location.pathname.toLowerCase().includes("agencylogin.html");
        
        if (!isLoginPage) {
            console.warn("Session expired. Redirecting...");
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("AgencyLogin.html?error=session_expired");
        }
    }
});

// ==========================================
// 2. GLOBAL UI SYNC (Logos & Names)
// ==========================================
function syncGlobalAgencyUI() {
    const agencyEmail = localStorage.getItem("agencyEmail");
    if (!agencyEmail) return;

    $.ajax({
        url: "https://quantifire-iris-backend.onrender.com/api/agency/profile",
        type: "GET",
        data: { email: agencyEmail },
        xhrFields: {
            withCredentials: true // 🔴 Ye line yahan bhi honi chahiye!
        },
        success: function (data) {
            if (data.agencyLogo) {
                let finalPath = data.agencyLogo;

                // Supabase Cleaning Logic
                if (finalPath.includes("https://egkhvxnutuiivybwibqx.supabase.co")) {
                    if (finalPath.includes("localhost:8080")) {
                        finalPath = finalPath.substring(finalPath.indexOf("https://"));
                        finalPath = decodeURIComponent(finalPath);
                    }
                }
                else if (!finalPath.startsWith('http')) {
                    finalPath = "https://quantifire-iris-backend.onrender.com/uploads/logos/" + finalPath;
                }

                $("#sidebarAgencyLogo, #headerAgencyLogo, #leftAgencyLogo, .avatar-circle img").attr("src", finalPath);

            }

            const aName = data.agencyName || "Agency User";
            $(".display-agency-name, .user-mini-profile p, .d-name").text(aName);
            $("#display-agency-email").text(data.email);
        }
    });
}

// ==========================================
// 3. LOGOUT LOGIC
// ==========================================
function openLogoutModal() {
    $("#logoutModal").fadeIn(200).css("display", "flex").addClass('active');
    $("#profileDropdown").removeClass('active');
}

function closeLogoutModal() {
    $("#logoutModal").fadeOut(200).removeClass('active');
}

function confirmLogout() {
    // 1. Button par loading dikhao (Optional but good)
    const $btn = $(".btn-modal-delete1");
    $btn.text("Logging out...").prop("disabled", true);

    // 2. Backend ko request bhejo cookie expire karne ke liye
    $.ajax({
        url: "https://quantifire-iris-backend.onrender.com/api/agency/logout",
        type: "POST",
        xhrFields: {
            withCredentials: true // 🔴 Ye sabse zaroori hai cookie delete karne ke liye
        },
        success: function (response) {
            console.log("Session cleared on server");
        },
        error: function (xhr) {
            console.error("Server logout failed, but clearing local session anyway.");
        },
        complete: function () {
            // 3. Local data saaf karo chahe API chale ya na chale
            localStorage.clear();

            // Agar koi normal JS cookie hai use bhi hatao
            document.cookie = "isAgencyLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            // 4. Redirect to Login
            window.location.href = "AgencyLogin.html";
        }
    });
}

// ==========================================
// 4. DOCUMENT READY (Sidebar Fix included)
// ==========================================
$(document).ready(function () {
    const $sidebar = $('.sidebar');
    const $notifDropdown = $('#notifDropdown');
    const $profileDropdown = $('#profileDropdown');
    const $profileChevron = $('#profileChevron');

    syncGlobalAgencyUI();
    loadTopBarNotifications();

    // SIDEBAR TOGGLE
    $('#sidebarToggle').on('click', function (e) {
        e.stopPropagation();

        $notifDropdown.removeClass('active');
        $profileDropdown.removeClass('active');
        $profileChevron.css("transform", "rotate(0deg)");
        $sidebar.toggleClass('collapsed');
    });

    // CLOSE SIDEBAR BUTTON (Mobile Fix)
    $('#closeSidebarBtn').on('click', function (e) {
        e.stopPropagation();
        $sidebar.removeClass('collapsed');
    });

    // DROPDOWN TOGGLES
    window.toggleNotification = function (event) {
        event.stopPropagation();
        $sidebar.removeClass('collapsed');
        $profileDropdown.removeClass('active');
        $profileChevron.css("transform", "rotate(0deg)");

        $notifDropdown.toggleClass('active');
    };

    window.toggleProfileDropdown = function (event) {
        event.stopPropagation();
        $sidebar.removeClass('collapsed');
        $notifDropdown.removeClass('active');

        const isActive = $profileDropdown.toggleClass('active').hasClass('active');
        $profileChevron.css("transform", isActive ? "rotate(180deg)" : "rotate(0deg)");
    };

    // GLOBAL CLICK (Outside Click to close everything)
    $(document).on('click', function (event) {
        // Sidebar close logic
        if (!$(event.target).closest('.sidebar, #sidebarToggle').length) {
            $sidebar.removeClass('collapsed');
        }

        // Dropdowns close logic
        if (!$(event.target).closest('.notification-wrapper, .profile-info, .notif-dropdown, .profile-dropdown').length) {
            $notifDropdown.removeClass('active');
            $profileDropdown.removeClass('active');
            $profileChevron.css("transform", "rotate(0deg)");
        }

        // Modal close
        if ($(event.target).is('#logoutModal')) closeLogoutModal();
    });

    const checkStatusBtn = document.getElementById('checkStatusBtn');
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', handleHealthCheck);
    }
});

// ==========================================
// 5. NOTIFICATIONS & HELPERS (UPDATED)
// ==========================================

function timeAgo(dateString) {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    if (days < 7) return days + "d ago";
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function loadTopBarNotifications() {
    const email = localStorage.getItem("agencyEmail");
    if (!email) return;

    $.get(`https://quantifire-iris-backend.onrender.com/api/top-notifications/get?email=${email}`, function (res) {
        // Badge count update
        if (res.unreadCount > 0) {
            $('.notif-count').text(res.unreadCount).show();
        } else {
            $('.notif-count').hide();
        }

        const list = $('.notif-list').empty();
        if (res.notifications.length === 0) {
            list.append('<li style="padding:15px; text-align:center; color:#888;">No notifications</li>');
            return;
        }

        // 🟢 CHANGE 1: Slice badhakar 10 kar diya taki scrollbar use ho sake
        res.notifications.slice(0, 5).forEach(log => {
            let iconClass = log.type.toLowerCase();
            let iconHtml = '<i class="fa-solid fa-bell"></i>';

            // Icon logic according to type
            if (log.type === "SUCCESS") iconHtml = '<i class="fa-solid fa-check"></i>';
            else if (log.type === "WARNING" || log.type === "ERROR") iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';

            list.append(`
                <li class="notif-item ${log.read ? '' : 'unread'}">
                    <div class="n-icon ${iconClass}">${iconHtml}</div>
                    <div class="n-text">
                        <p><strong>${log.title}</strong></p>
                        <span>${log.message}</span>
                    </div>
                    <span class="n-time">${timeAgo(log.createdAt)}</span>
                </li>`);
        });
    });
}

// 🟢 CHANGE 2: Unified Mark All Read (Header + Page Sync)
$(document).on('click', '.mark-read, #markAllReadBtn', function () {
    const email = localStorage.getItem("agencyEmail");
    if (!email) return;

    // 1. UI updates instantly
    $('.notif-item').removeClass('unread');      // Header Dropdown sync
    $('.full-notif-item').removeClass('unread'); // Main Notifications Page sync
    $('.notif-count').fadeOut();

    // 2. Local array sync (agar main page par use ho raha hai)
    if (typeof allNotifications !== 'undefined') {
        allNotifications.forEach(n => n.read = true);
    }


    // 3. API Call
    $.post(`https://quantifire-iris-backend.onrender.com/api/top-notifications/mark-read?email=${email}`);
});
async function handleHealthCheck() {
    const statusText = document.getElementById('statusMessage');
    if (!statusText) return;
    statusText.innerText = "Checking...";
    try {
        const response = await fetch('https://quantifire-iris-backend.onrender.com/api/health');
        statusText.innerText = response.ok ? "✅ Server Online" : "❌ Server Error";
        statusText.style.color = response.ok ? "green" : "red";
    } catch (e) {
        statusText.innerText = "❌ Server Offline";
        statusText.style.color = "orange";
    }
}


// ==========================================
// GLOBAL KEYBOARD SHORTCUTS (ENTER & ESCAPE KEYS)
// ==========================================
$(document).on('keydown', function (e) {

    // --- 1. ENTER KEY LOGIC (For OK / Submit / Confirm) ---
    if (e.key === "Enter" || e.keyCode === 13) {

        // Agar Custom Alert (Success/Error) open hai
        if ($('#customAlertOverlay').hasClass('active')) {
            e.preventDefault(); // Default form submit roke
            $('.btn-alert-ok').click(); // OK button click kare
        }

        // Agar Logout Confirmation open hai
        else if ($('#logoutModal').hasClass('active') || $('#logoutModal').css('display') === 'block') {
            e.preventDefault();
            confirmLogout();
        }

        // Agar Disconnect Confirmation open hai
        else if ($('#disconnectConfirmOverlay').hasClass('active')) {
            e.preventDefault();
            $('#confirmDisconnectBtn').click();
        }

        // Agar OTP box dikh raha hai aur user OTP type kar raha hai
        else if ($('#otpVerificationBox').is(':visible') && $('#tfaOtpInput').is(':focus')) {
            e.preventDefault();
            $('#tfaVerifyBtn').click(); // OTP Verify button dabaye
        }
    }

    // --- 2. ESCAPE (ESC) KEY LOGIC (For Cancel / Close) ---
    if (e.key === "Escape" || e.keyCode === 27) {

        if ($('#customAlertOverlay').hasClass('active')) {
            closeCustomAlert();
        }
        if ($('#logoutModal').hasClass('active') || $('#logoutModal').css('display') === 'block') {
            closeLogoutModal();
        }
        if ($('#disconnectConfirmOverlay').hasClass('active')) {
            closeDisconnectModal();
        }
    }
});