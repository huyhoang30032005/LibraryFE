
// ========================================
// ĐĂNG XUẤT
// ========================================

const logoutBtn =
    document.querySelector(".logout");


// ========================================
// XỬ LÝ ĐĂNG XUẤT
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            // Không cho thẻ <a> thực hiện href="#"
            event.preventDefault();


            // Xác nhận đăng xuất
            const confirmed =
                confirm(
                    "Bạn có chắc muốn đăng xuất không?"
                );


            // Nếu người dùng chọn Hủy
            if (!confirmed) {
                return;
            }


            // ========================================
            // XÓA THÔNG TIN ĐĂNG NHẬP
            // ========================================

            localStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "token"
            );


            // ========================================
            // CHUYỂN VỀ TRANG ĐĂNG NHẬP
            // ========================================

            window.location.href =
                "login.html";
        }
    );
}

