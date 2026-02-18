$(document).ready(function () {
            const $sidebar = $('.sidebar');
            const $notifDropdown = $('#notifDropdown');
            const $profileDropdown = $('#profileDropdown');
            const $profileChevron = $('#profileChevron');

            // ---  Sidebar Toggle ---
            $('#sidebarToggle').click(function (e) {
                e.stopPropagation();
                
                $notifDropdown.removeClass('active');
                $profileDropdown.removeClass('active');
                $profileChevron.css("transform", "rotate(0deg)");

                $sidebar.toggleClass('collapsed');

                setTimeout(() => { if (typeof map !== 'undefined') map.invalidateSize(); }, 300);
            });

            // ---  Notification Toggle ---
            window.toggleNotification = function (event) {
                event.stopPropagation();
            
                $sidebar.removeClass('collapsed');
                $profileDropdown.removeClass('active');
                $profileChevron.css("transform", "rotate(0deg)");

                $notifDropdown.toggleClass('active');
            };

            // ---  Profile Dropdown Toggle ---
            window.toggleProfileDropdown = function (event) {
                event.stopPropagation();
            
                $sidebar.removeClass('collapsed');
                $notifDropdown.removeClass('active');

                const isActive = $profileDropdown.toggleClass('active').hasClass('active');
                $profileChevron.css("transform", isActive ? "rotate(180deg)" : "rotate(0deg)");
            };

            // ---  Global Click to Close All ---
            $(document).click(function (event) {
                
                if (!$(event.target).closest('.sidebar, .notification-wrapper, .profile-info, .notif-dropdown, .profile-dropdown').length) {
                    $sidebar.removeClass('collapsed');
                    $notifDropdown.removeClass('active');
                    $profileDropdown.removeClass('active');
                    $profileChevron.css("transform", "rotate(0deg)");
                }
            });

            // Sidebar close button logic
            $('#closeSidebarBtn').click(function () {
                $sidebar.removeClass('collapsed');
            });
        });

        
        // --- Logout Model Logic --- //
        
        function openLogoutModal() {
            const modal = document.getElementById('logoutModal');
            if (modal) {
                modal.classList.add('active');
                console.log("Logout Modal Opened");
            }

            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) dropdown.classList.remove('active');
        }

        function closeLogoutModal() {
            const modal = document.getElementById('logoutModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }

        function confirmLogout() {
            window.location.href = "AgencyLoginPage.html";
        }

        document.addEventListener('click', function (event) {
            const modal = document.getElementById('logoutModal');
            const modalContent = document.querySelector('.modal-content');

            if (modal && modal.classList.contains('active') && event.target === modal) {
                closeLogoutModal();
            }
        });