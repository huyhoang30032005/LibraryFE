
// ========================================
// LẤY THÔNG TIN NGƯỜI DÙNG
// ========================================

// Kiểm tra localStorage trước
let userData = localStorage.getItem("currentUser");


// Nếu localStorage không có
// thì kiểm tra sessionStorage
if (!userData) {
    userData = sessionStorage.getItem("currentUser");
}


// ========================================
// HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
// ========================================

if (userData) {

    // Chuyển dữ liệu JSON thành object
    const user = JSON.parse(userData);


    // ====================================
    // LẤY CÁC PHẦN TỬ HTML
    // ====================================

    const sidebarUserName =
        document.getElementById("sidebarUserName");

    const sidebarUserRole =
        document.getElementById("sidebarUserRole");

    const headerUserName =
        document.getElementById("headerUserName");

    const headerUserRole =
        document.getElementById("headerUserRole");


    // ====================================
    // HIỂN THỊ TÊN NGƯỜI DÙNG
    // ====================================

    if (sidebarUserName) {
        sidebarUserName.textContent = user.username;
    }

    if (headerUserName) {
        headerUserName.textContent = user.username;
    }


    // ====================================
    // HIỂN THỊ ROLE
    // ====================================

    if (sidebarUserRole) {
        sidebarUserRole.textContent = user.role;
    }

    if (headerUserRole) {
        headerUserRole.textContent = user.role;
    }

}

