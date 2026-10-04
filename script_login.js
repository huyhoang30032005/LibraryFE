
// ========================================
// CẤU HÌNH API
// ========================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/users";


// ========================================
// LẤY CÁC PHẦN TỬ HTML
// ========================================

const loginForm =
    document.getElementById("loginForm");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const rememberLogin =
    document.getElementById("rememberLogin");

const loginMessage =
    document.getElementById("loginMessage");

const loginBtn =
    document.getElementById("loginBtn");


// ========================================
// HIỂN THỊ THÔNG BÁO
// ========================================

function showLoginMessage(message) {

    loginMessage.textContent =
        message;
}


// ========================================
// XÓA THÔNG BÁO
// ========================================

function clearLoginMessage() {

    loginMessage.textContent = "";
}


// ========================================
// XỬ LÝ ĐĂNG NHẬP
// ========================================

async function login() {

    // ------------------------------------
    // XÓA THÔNG BÁO CŨ
    // ------------------------------------

    clearLoginMessage();


    // ------------------------------------
    // LẤY DỮ LIỆU TỪ FORM
    // ------------------------------------

    const username =
        loginUsername.value.trim();

    const password =
        loginPassword.value;


    // ------------------------------------
    // KIỂM TRA TÊN ĐĂNG NHẬP
    // ------------------------------------

    if (!username) {

        showLoginMessage(
            "Vui lòng nhập tên đăng nhập"
        );

        loginUsername.focus();

        return;
    }


    // ------------------------------------
    // KIỂM TRA MẬT KHẨU
    // ------------------------------------

    if (!password) {

        showLoginMessage(
            "Vui lòng nhập mật khẩu"
        );

        loginPassword.focus();

        return;
    }


    // ------------------------------------
    // KHÓA NÚT ĐĂNG NHẬP
    // ------------------------------------

    loginBtn.disabled = true;

    loginBtn.textContent =
        "Đang đăng nhập...";


    try {

        // ====================================
        // GỌI API LOGIN
        // ====================================

        const response =
            await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );


        // ====================================
        // ĐỌC KẾT QUẢ SERVER
        // ====================================

        const result =
            await response.json();


        // ====================================
        // KIỂM TRA LOGIN THẤT BẠI
        // ====================================

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Tên đăng nhập hoặc mật khẩu không đúng"
            );
        }


        // ====================================
        // LẤY USER VÀ TOKEN
        // ====================================

        const user =
            result.data.user;

        const token =
            result.data.token;


        // ====================================
        // KIỂM TRA TOKEN
        // ====================================

        if (!token) {

            throw new Error(
                "Server không trả về token đăng nhập"
            );
        }


        // ====================================
        // XÓA THÔNG TIN ĐĂNG NHẬP CŨ
        // ====================================

        localStorage.removeItem(
            "currentUser"
        );

        localStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "currentUser"
        );


        // ====================================
        // LƯU TOKEN
        // ====================================

        localStorage.setItem(
            "token",
            token
        );


        // ====================================
        // LƯU THÔNG TIN USER
        // ====================================

        if (rememberLogin.checked) {

            // Người dùng chọn ghi nhớ
            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );

        } else {

            // Chỉ lưu trong phiên hiện tại
            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );
        }


        // ====================================
        // CHUYỂN ĐẾN TRANG CHÍNH
        // ====================================

        window.location.href =
            "index.html";


    } catch (error) {

        // ====================================
        // XỬ LÝ LỖI
        // ====================================

        console.error(
            "Login error:",
            error
        );


        showLoginMessage(
            error.message ||
            "Không thể đăng nhập"
        );


    } finally {

        // ====================================
        // MỞ LẠI NÚT ĐĂNG NHẬP
        // ====================================

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Đăng nhập";
    }
}


// ========================================
// BẮT SỰ KIỆN SUBMIT FORM
// ========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            // Ngăn form reload trang
            event.preventDefault();

            // Thực hiện đăng nhập
            login();
        }
    );
}

