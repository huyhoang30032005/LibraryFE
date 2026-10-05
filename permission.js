// Lấy thông tin người dùng
const user = JSON.parse(localStorage.getItem("user"));


// Nếu có thông tin người dùng
if (user) {

    // Hiển thị tên người dùng
    document.getElementById("sidebarUserName").textContent = user.username;
    document.getElementById("headerUserName").textContent = user.username;

    // Hiển thị role
    document.getElementById("sidebarUserRole").textContent = user.role;
    document.getElementById("headerUserRole").textContent = user.role;

}