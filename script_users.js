// ========================================
// CẤU HÌNH API
// ========================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/users";



// ========================================
// BIẾN LƯU DANH SÁCH USER
// ========================================

let allUsers = [];



// ========================================
// LẤY ELEMENT
// ========================================

const userSearch =
    document.getElementById("userSearch");

const roleFilter =
    document.getElementById("roleFilter");

const statusFilter =
    document.getElementById("statusFilter");

const addUserBtn =
    document.getElementById("addUserBtn");

const usersTableBody =
    document.getElementById("usersTableBody");



// ========================================
// JWT - LẤY TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("token");
}



// ========================================
// JWT - TẠO HEADERS
// ========================================

function getAuthHeaders(includeJson = false) {

    const token = getToken();

    const headers = {};

    if (includeJson) {
        headers["Content-Type"] =
            "application/json";
    }

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}



// ========================================
// XỬ LÝ KHI TOKEN KHÔNG HỢP LỆ
// ========================================

function handleUnauthorized() {

    alert(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    );

    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    sessionStorage.removeItem("currentUser");

    window.location.href =
        "login.html";
}



// ========================================
// HÀM ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// ========================================
// LẤY DATA TỪ RESPONSE
// ========================================

function getResponseData(result) {

    if (!result) {
        return [];
    }

    if (Array.isArray(result.data)) {
        return result.data;
    }

    if (
        result.data &&
        Array.isArray(result.data.data)
    ) {
        return result.data.data;
    }

    return [];
}



// ========================================
// CHUYỂN ROLE SANG TIẾNG VIỆT
// ========================================

function getRoleText(role) {

    if (role === "admin") {
        return "Admin";
    }

    if (role === "librarian") {
        return "Thủ thư";
    }

    return role || "-";
}



// ========================================
// CHUYỂN STATUS SANG TIẾNG VIỆT
// ========================================

function getStatusText(status) {

    if (status === "active") {
        return "Hoạt động";
    }

    if (status === "inactive") {
        return "Đã khóa";
    }

    return status || "-";
}



// ========================================
// LOAD DANH SÁCH USER
// ========================================

async function loadUsers() {

    try {

        const response =
            await fetch(
                API_URL,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        // ----------------------------
        // TOKEN HẾT HẠN / KHÔNG HỢP LỆ
        // ----------------------------

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        // ----------------------------
        // KHÔNG CÓ QUYỀN
        // ----------------------------

        if (response.status === 403) {

            usersTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align: center;"
                    >
                        Bạn không có quyền quản lý người dùng
                    </td>
                </tr>
            `;

            return;
        }


        // ----------------------------
        // LỖI KHÁC
        // ----------------------------

        if (!response.ok) {

            throw new Error(
                "Không thể tải danh sách người dùng"
            );
        }


        const result =
            await response.json();


        allUsers =
            getResponseData(result);


        renderUsersTable();


    } catch (error) {

        console.error(
            "Lỗi load users:",
            error
        );


        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align: center;"
                >
                    Không thể tải danh sách người dùng
                </td>
            </tr>
        `;
    }
}



// ========================================
// HIỂN THỊ DANH SÁCH USER
// ========================================

function renderUsersTable(
    users = allUsers
) {

    usersTableBody.innerHTML = "";


    if (!users.length) {

        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align: center;"
                >
                    Không có người dùng
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(user => {

        const row =
            document.createElement("tr");


        const statusClass =
            user.status === "active"
                ? "active"
                : "inactive";


        const nextStatus =
            user.status === "active"
                ? "inactive"
                : "active";


        const statusText =
            getStatusText(
                user.status
            );


        const actionText =
            user.status === "active"
                ? "Khóa"
                : "Mở khóa";


        row.innerHTML = `

            <!-- NGƯỜI DÙNG -->

            <td>

                <div class="user-info">

                    <strong>
                        ${escapeHtml(
                            user.full_name
                        )}
                    </strong>

                    <span>
                        @${escapeHtml(
                            user.username
                        )}
                    </span>

                </div>

            </td>


            <!-- EMAIL -->

            <td>
                ${escapeHtml(
                    user.email || "-"
                )}
            </td>


            <!-- SỐ ĐIỆN THOẠI -->

            <td>
                ${escapeHtml(
                    user.phone || "-"
                )}
            </td>


            <!-- VAI TRÒ -->

            <td>
                ${escapeHtml(
                    getRoleText(
                        user.role
                    )
                )}
            </td>


            <!-- TRẠNG THÁI -->

            <td>

                <button
                    type="button"
                    class="user-status-btn ${statusClass}"
                    onclick="
                        updateUserStatus(
                            ${user.id},
                            '${nextStatus}'
                        )
                    "
                >
                    ${statusText}
                </button>

            </td>


            <!-- THAO TÁC -->

            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="user-detail-btn"
                        onclick="
                            openUserDetail(
                                ${user.id}
                            )
                        "
                    >
                        Chi tiết
                    </button>


                    <button
                        type="button"
                        class="user-edit-btn"
                        onclick="
                            openEditUser(
                                ${user.id}
                            )
                        "
                    >
                        Sửa
                    </button>


                    <button
                        type="button"
                        class="
                            user-lock-btn
                            ${
                                user.status === "inactive"
                                    ? "user-unlock-btn"
                                    : ""
                            }
                        "
                        onclick="
                            updateUserStatus(
                                ${user.id},
                                '${nextStatus}'
                            )
                        "
                    >
                        ${actionText}
                    </button>

                </div>

            </td>
        `;


        usersTableBody.appendChild(row);

    });
}



// ========================================
// LỌC USER
// ========================================

function filterUsers() {

    const keyword =
        userSearch
            ? userSearch.value
                .trim()
                .toLowerCase()
            : "";


    const role =
        roleFilter
            ? roleFilter.value
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredUsers =
        allUsers.filter(user => {

            const matchesKeyword =
                !keyword ||

                (
                    user.full_name &&
                    user.full_name
                        .toLowerCase()
                        .includes(keyword)
                ) ||

                (
                    user.username &&
                    user.username
                        .toLowerCase()
                        .includes(keyword)
                ) ||

                (
                    user.email &&
                    user.email
                        .toLowerCase()
                        .includes(keyword)
                ) ||

                (
                    user.phone &&
                    user.phone
                        .toLowerCase()
                        .includes(keyword)
                );


            const matchesRole =
                !role ||
                user.role === role;


            const matchesStatus =
                !status ||
                user.status === status;


            return (
                matchesKeyword &&
                matchesRole &&
                matchesStatus
            );

        });


    renderUsersTable(
        filteredUsers
    );
}



// ========================================
// SỰ KIỆN SEARCH
// ========================================

if (userSearch) {

    userSearch.addEventListener(
        "input",
        filterUsers
    );
}


if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        filterUsers
    );
}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterUsers
    );
}



// ========================================
// MODAL THÊM USER
// ========================================

const addUserModal =
    document.getElementById(
        "addUserModal"
    );

const closeAddUserModal =
    document.getElementById(
        "closeAddUserModal"
    );

const addUserForm =
    document.getElementById(
        "addUserForm"
    );

const cancelAddUserBtn =
    document.getElementById(
        "cancelAddUserBtn"
    );



// ========================================
// MỞ MODAL THÊM USER
// ========================================

if (addUserBtn) {

    addUserBtn.addEventListener(
        "click",
        function () {

            if (addUserModal) {

                addUserModal.classList.add(
                    "show"
                );

            }

        }
    );

}



// ========================================
// ĐÓNG MODAL THÊM USER
// ========================================

function closeAddUserModalFunction() {

    if (addUserModal) {

        addUserModal.classList.remove(
            "show"
        );

    }


    if (addUserForm) {

        addUserForm.reset();

    }


    const message =
        document.getElementById(
            "addUserFormMessage"
        );


    if (message) {

        message.textContent = "";

    }
}



if (closeAddUserModal) {

    closeAddUserModal.addEventListener(
        "click",
        closeAddUserModalFunction
    );

}



if (cancelAddUserBtn) {

    cancelAddUserBtn.addEventListener(
        "click",
        closeAddUserModalFunction
    );

}



// ========================================
// THÊM USER
// ========================================

if (addUserForm) {

    addUserForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fullName =
                document.getElementById(
                    "addFullName"
                ).value.trim();


            const username =
                document.getElementById(
                    "addUsername"
                ).value.trim();


            const email =
                document.getElementById(
                    "addEmail"
                ).value.trim();


            const phone =
                document.getElementById(
                    "addPhone"
                ).value.trim();


            const password =
                document.getElementById(
                    "addPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "addConfirmPassword"
                ).value;


            const role =
                document.getElementById(
                    "addRole"
                ).value;


            const status =
                document.getElementById(
                    "addStatus"
                ).value;


            const message =
                document.getElementById(
                    "addUserFormMessage"
                );



            // ----------------------------
            // KIỂM TRA PASSWORD
            // ----------------------------

            if (
                password !==
                confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "Xác nhận mật khẩu không khớp";

                }

                return;
            }



            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({

                                    full_name:
                                        fullName,

                                    username:
                                        username,

                                    email:
                                        email || null,

                                    phone:
                                        phone || null,

                                    password:
                                        password,

                                    role:
                                        role,

                                    status:
                                        status

                                })
                        }
                    );



                if (
                    response.status ===
                    401
                ) {

                    handleUnauthorized();

                    return;
                }



                const result =
                    await response.json();



                if (
                    response.status ===
                    403
                ) {

                    throw new Error(
                        "Bạn không có quyền thêm người dùng"
                    );

                }



                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Không thể thêm người dùng"
                    );

                }



                closeAddUserModalFunction();

                await loadUsers();


            } catch (error) {

                console.error(
                    "Lỗi thêm user:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message;

                }

            }

        }
    );

}



// ========================================
// MODAL CHI TIẾT USER
// ========================================

const userDetailModal =
    document.getElementById(
        "userDetailModal"
    );

const closeUserDetailModal =
    document.getElementById(
        "closeUserDetailModal"
    );

const closeUserDetailBtn =
    document.getElementById(
        "closeUserDetailBtn"
    );



// ========================================
// ĐÓNG MODAL CHI TIẾT
// ========================================

function closeUserDetail() {

    if (userDetailModal) {

        userDetailModal.classList.remove(
            "show"
        );

    }

}



if (closeUserDetailModal) {

    closeUserDetailModal.addEventListener(
        "click",
        closeUserDetail
    );

}



if (closeUserDetailBtn) {

    closeUserDetailBtn.addEventListener(
        "click",
        closeUserDetail
    );

}



// ========================================
// MỞ CHI TIẾT USER
// ========================================

async function openUserDetail(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status ===
            401
        ) {

            handleUnauthorized();

            return;
        }


        const result =
            await response.json();


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem người dùng"
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Không thể lấy thông tin người dùng"
            );

        }


        const user =
            result.data;


        document.getElementById(
            "detailUserName"
        ).textContent =
            user.full_name || "-";


        document.getElementById(
            "detailUserEmail"
        ).textContent =
            user.email || "-";


        const detailPhone =
            document.getElementById(
                "detailUserPhone"
            );


        if (detailPhone) {

            detailPhone.textContent =
                user.phone || "-";

        }


        document.getElementById(
            "detailUsername"
        ).textContent =
            user.username || "-";


        document.getElementById(
            "detailPassword"
        ).textContent =
            "••••••••";


        document.getElementById(
            "detailUserRole"
        ).textContent =
            getRoleText(
                user.role
            );


        document.getElementById(
            "detailUserStatus"
        ).textContent =
            getStatusText(
                user.status
            );


        document.getElementById(
            "detailUserCreatedAt"
        ).textContent =
            formatDate(
                user.created_at
            );


        const changePasswordBtn =
            document.getElementById(
                "changePasswordBtn"
            );


        if (changePasswordBtn) {

            changePasswordBtn.onclick =
                function () {

                    closeUserDetail();

                    openChangePassword(
                        user.id
                    );

                };

        }


        if (userDetailModal) {

            userDetailModal.classList.add(
                "show"
            );

        }


    } catch (error) {

        console.error(
            "Lỗi lấy chi tiết user:",
            error
        );


        alert(
            error.message
        );

    }

}



// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "vi-VN"
    );

}



// ========================================
// MODAL EDIT USER
// ========================================

const editUserModal =
    document.getElementById(
        "editUserModal"
    );

const closeEditUserModal =
    document.getElementById(
        "closeEditUserModal"
    );

const editUserForm =
    document.getElementById(
        "editUserForm"
    );

const cancelEditUserBtn =
    document.getElementById(
        "cancelEditUserBtn"
    );



// ========================================
// ĐÓNG MODAL EDIT
// ========================================

function closeEditUser() {

    if (editUserModal) {

        editUserModal.classList.remove(
            "show"
        );

    }


    if (editUserForm) {

        editUserForm.reset();

    }


    const message =
        document.getElementById(
            "editUserFormMessage"
        );


    if (message) {

        message.textContent = "";

    }

}



if (closeEditUserModal) {

    closeEditUserModal.addEventListener(
        "click",
        closeEditUser
    );

}



if (cancelEditUserBtn) {

    cancelEditUserBtn.addEventListener(
        "click",
        closeEditUser
    );

}



// ========================================
// MỞ MODAL EDIT USER
// ========================================

async function openEditUser(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status ===
            401
        ) {

            handleUnauthorized();

            return;
        }


        const result =
            await response.json();


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền sửa người dùng"
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Không thể lấy thông tin người dùng"
            );

        }


        const user =
            result.data;


        document.getElementById(
            "editUserId"
        ).value =
            user.id;


        document.getElementById(
            "editFullName"
        ).value =
            user.full_name || "";


        document.getElementById(
            "editUsername"
        ).value =
            user.username || "";


        document.getElementById(
            "editEmail"
        ).value =
            user.email || "";


        const editPhone =
            document.getElementById(
                "editPhone"
            );


        if (editPhone) {

            editPhone.value =
                user.phone || "";

        }


        document.getElementById(
            "editRole"
        ).value =
            user.role ||
            "librarian";


        document.getElementById(
            "editStatus"
        ).value =
            user.status ||
            "active";


        if (editUserModal) {

            editUserModal.classList.add(
                "show"
            );

        }


    } catch (error) {

        console.error(
            "Lỗi mở edit user:",
            error
        );


        alert(
            error.message
        );

    }

}



// ========================================
// SUBMIT EDIT USER
// ========================================

if (editUserForm) {

    editUserForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editUserId"
                ).value;


            const fullName =
                document.getElementById(
                    "editFullName"
                ).value.trim();


            const username =
                document.getElementById(
                    "editUsername"
                ).value.trim();


            const email =
                document.getElementById(
                    "editEmail"
                ).value.trim();


            const phone =
                document.getElementById(
                    "editPhone"
                ).value.trim();


            const role =
                document.getElementById(
                    "editRole"
                ).value;


            const status =
                document.getElementById(
                    "editStatus"
                ).value;


            const message =
                document.getElementById(
                    "editUserFormMessage"
                );



            try {

                const response =
                    await fetch(
                        `${API_URL}/${id}`,
                        {
                            method: "PUT",

                            headers:
                                getAuthHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({

                                    full_name:
                                        fullName,

                                    username:
                                        username,

                                    email:
                                        email || null,

                                    phone:
                                        phone || null,

                                    role:
                                        role,

                                    status:
                                        status

                                })
                        }
                    );


                if (
                    response.status ===
                    401
                ) {

                    handleUnauthorized();

                    return;
                }


                const result =
                    await response.json();


                if (
                    response.status ===
                    403
                ) {

                    throw new Error(
                        "Bạn không có quyền sửa người dùng"
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Không thể cập nhật người dùng"
                    );

                }


                closeEditUser();

                await loadUsers();


            } catch (error) {

                console.error(
                    "Lỗi cập nhật user:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message;

                }

            }

        }
    );

}



// ========================================
// KHÓA / MỞ KHÓA USER
// ========================================

async function updateUserStatus(
    id,
    status
) {

    const action =
        status === "inactive"
            ? "khóa"
            : "mở khóa";


    const confirmed =
        confirm(
            `Bạn có chắc muốn ${action} người dùng này?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}/status`,
                {
                    method: "PATCH",

                    headers:
                        getAuthHeaders(
                            true
                        ),

                    body:
                        JSON.stringify({
                            status: status
                        })
                }
            );


        if (
            response.status ===
            401
        ) {

            handleUnauthorized();

            return;
        }


        const result =
            await response.json();


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền khóa/mở khóa người dùng"
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Không thể cập nhật trạng thái"
            );

        }


        await loadUsers();


    } catch (error) {

        console.error(
            "Lỗi cập nhật trạng thái:",
            error
        );


        alert(
            error.message
        );

    }

}



// ========================================
// MODAL ĐỔI PASSWORD
// ========================================

const changePasswordModal =
    document.getElementById(
        "changePasswordModal"
    );

const closeChangePasswordModal =
    document.getElementById(
        "closeChangePasswordModal"
    );

const changePasswordForm =
    document.getElementById(
        "changePasswordForm"
    );

const cancelChangePasswordBtn =
    document.getElementById(
        "cancelChangePasswordBtn"
    );



// ========================================
// MỞ MODAL ĐỔI PASSWORD
// ========================================

function openChangePassword(id) {

    document.getElementById(
        "changePasswordUserId"
    ).value =
        id;


    if (changePasswordModal) {

        changePasswordModal.classList.add(
            "show"
        );

    }

}



// ========================================
// ĐÓNG MODAL ĐỔI PASSWORD
// ========================================

function closeChangePassword() {

    if (changePasswordModal) {

        changePasswordModal.classList.remove(
            "show"
        );

    }


    if (changePasswordForm) {

        changePasswordForm.reset();

    }


    const message =
        document.getElementById(
            "changePasswordMessage"
        );


    if (message) {

        message.textContent = "";

    }

}



if (closeChangePasswordModal) {

    closeChangePasswordModal.addEventListener(
        "click",
        closeChangePassword
    );

}



if (cancelChangePasswordBtn) {

    cancelChangePasswordBtn.addEventListener(
        "click",
        closeChangePassword
    );

}



// ========================================
// SUBMIT ĐỔI PASSWORD
// ========================================

if (changePasswordForm) {

    changePasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "changePasswordUserId"
                ).value;


            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmNewPassword"
                ).value;


            const message =
                document.getElementById(
                    "changePasswordMessage"
                );



            // ----------------------------
            // KIỂM TRA PASSWORD
            // ----------------------------

            if (
                newPassword !==
                confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "Xác nhận mật khẩu không khớp";

                }

                return;

            }



            try {

                const response =
                    await fetch(
                        `${API_URL}/${id}/password`,
                        {
                            method: "PATCH",

                            headers:
                                getAuthHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({

                                    new_password:
                                        newPassword,

                                    confirm_password:
                                        confirmPassword

                                })
                        }
                    );


                if (
                    response.status ===
                    401
                ) {

                    handleUnauthorized();

                    return;
                }


                const result =
                    await response.json();


                if (
                    response.status ===
                    403
                ) {

                    throw new Error(
                        "Bạn không có quyền đổi mật khẩu"
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Không thể đổi mật khẩu"
                    );

                }


                closeChangePassword();

                await loadUsers();


            } catch (error) {

                console.error(
                    "Lỗi đổi password:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message;

                }

            }

        }
    );

}



// ========================================
// CLICK RA NGOÀI MODAL
// ========================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            addUserModal
        ) {

            closeAddUserModalFunction();

        }


        if (
            event.target ===
            userDetailModal
        ) {

            closeUserDetail();

        }


        if (
            event.target ===
            editUserModal
        ) {

            closeEditUser();

        }


        if (
            event.target ===
            changePasswordModal
        ) {

            closeChangePassword();

        }

    }
);



// ========================================
// KHỞI ĐỘNG
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUsers();

    }
);