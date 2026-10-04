
// ==================================================
// CẤU HÌNH API
// ==================================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/borrowers";


// ==================================================
// BIẾN LƯU TOÀN BỘ NGƯỜI MƯỢN
// ==================================================

let allBorrowers = [];


// ==================================================
// LẤY TOKEN ĐĂNG NHẬP
// ==================================================

function getToken() {

    return localStorage.getItem("token");
}


// ==================================================
// TẠO HEADER CÓ TOKEN
// ==================================================

function getAuthHeaders(includeJson = false) {

    const token =
        getToken();

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


// ==================================================
// XỬ LÝ TOKEN HẾT HẠN / KHÔNG HỢP LỆ
// ==================================================

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


// ==================================================
// LOAD BORROWERS
// ==================================================

async function loadBorrowers() {

    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        // ------------------------------------------
        // CHƯA ĐĂNG NHẬP / TOKEN KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        if (!response.ok) {

            throw new Error(
                `HTTP error! status: ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không lấy được dữ liệu người mượn"
            );
        }


        allBorrowers =
            result.data;


        renderBorrowersTable(
            allBorrowers
        );

    } catch (error) {

        console.error(
            "Lỗi khi tải danh sách người mượn:",
            error
        );


        const tableBody =
            document.getElementById(
                "borrowersTableBody"
            );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Không có dữ liệu người mượn
                    </td>
                </tr>
            `;
        }
    }
}


// ==================================================
// RENDER TABLE
// ==================================================

function renderBorrowersTable(
    borrowers
) {

    const tableBody =
        document.getElementById(
            "borrowersTableBody"
        );


    if (!tableBody) {

        return;
    }


    // ------------------------------------------
    // KHÔNG CÓ DỮ LIỆU
    // ------------------------------------------

    if (
        !borrowers ||
        borrowers.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Không có người mượn
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = "";


    // ------------------------------------------
    // HIỂN THỊ TỪNG NGƯỜI MƯỢN
    // ------------------------------------------

    borrowers.forEach(
        function (borrower) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${borrower.borrower_code || ""}
                </td>

                <td>
                    ${borrower.full_name || ""}
                </td>

                <td>
                    ${borrower.email || ""}
                </td>

                <td>
                    ${borrower.phone || ""}
                </td>

                <td>
                    ${borrower.borrowing_count || 0}
                </td>

                <td>
                    ${borrower.overdue_count || 0}
                </td>

                <td>

                    <button
                        type="button"
                        class="borrower-detail-btn"
                        onclick="openBorrowerDetail('${borrower.borrower_code}')"
                    >
                        Chi tiết
                    </button>

                </td>

                <td>

                    <button
                        type="button"
                        class="borrower-delete-btn"
                        onclick="deleteBorrower('${borrower.borrower_code}')"
                    >
                        Xóa
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );
        }
    );
}


// ==================================================
// SEARCH
// ==================================================

const borrowerSearch =
    document.getElementById(
        "borrowerSearch"
    );


if (borrowerSearch) {

    borrowerSearch.addEventListener(
        "input",
        function () {

            const keyword =
                borrowerSearch.value
                    .trim()
                    .toLowerCase();


            const filteredBorrowers =
                allBorrowers.filter(
                    function (borrower) {

                        return (

                            (
                                borrower.borrower_code ||
                                ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                borrower.full_name ||
                                ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                borrower.email ||
                                ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                borrower.phone ||
                                ""
                            )
                                .toLowerCase()
                                .includes(keyword)
                        );
                    }
                );


            renderBorrowersTable(
                filteredBorrowers
            );
        }
    );
}


// ==================================================
// OPEN BORROWER DETAIL
// ==================================================

function openBorrowerDetail(
    borrowerCode
) {

    const borrower =
        allBorrowers.find(
            function (borrower) {

                return (
                    borrower.borrower_code ===
                    borrowerCode
                );
            }
        );


    if (!borrower) {

        console.error(
            "Không tìm thấy người mượn:",
            borrowerCode
        );

        return;
    }


    document.getElementById(
        "detailBorrowerCode"
    ).value =
        borrower.borrower_code || "";


    document.getElementById(
        "detailFullName"
    ).value =
        borrower.full_name || "";


    document.getElementById(
        "detailEmail"
    ).value =
        borrower.email || "";


    document.getElementById(
        "detailPhone"
    ).value =
        borrower.phone || "";


    document.getElementById(
        "detailDateOfBirth"
    ).value =
        borrower.date_of_birth
            ? String(
                borrower.date_of_birth
            ).slice(0, 10)
            : "";


    document.getElementById(
        "detailGender"
    ).value =
        borrower.gender || "";


    document.getElementById(
        "detailStatus"
    ).value =
        borrower.status || "active";


    document.getElementById(
        "detailAddress"
    ).value =
        borrower.address || "";


    document.getElementById(
        "borrowerDetailModal"
    ).classList.add("show");
}


// ==================================================
// CLOSE DETAIL MODAL
// ==================================================

function closeBorrowerDetail() {

    document.getElementById(
        "borrowerDetailModal"
    ).classList.remove("show");
}


const closeBorrowerModal =
    document.getElementById(
        "closeBorrowerModal"
    );


if (closeBorrowerModal) {

    closeBorrowerModal.addEventListener(
        "click",
        closeBorrowerDetail
    );
}


// ==================================================
// UPDATE BORROWER
// ==================================================

async function updateBorrower() {

    const borrowerCode =
        document.getElementById(
            "detailBorrowerCode"
        ).value;


    const data = {

        full_name:
            document.getElementById(
                "detailFullName"
            ).value.trim(),

        email:
            document.getElementById(
                "detailEmail"
            ).value.trim(),

        phone:
            document.getElementById(
                "detailPhone"
            ).value.trim(),

        date_of_birth:
            document.getElementById(
                "detailDateOfBirth"
            ).value,

        gender:
            document.getElementById(
                "detailGender"
            ).value,

        status:
            document.getElementById(
                "detailStatus"
            ).value,

        address:
            document.getElementById(
                "detailAddress"
            ).value.trim()
    };


    try {

        const response =
            await fetch(
                `${API_URL}/${borrowerCode}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body:
                        JSON.stringify(data)
                }
            );


        // ------------------------------------------
        // TOKEN KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        // ------------------------------------------
        // KHÔNG CÓ QUYỀN
        // ------------------------------------------

        if (response.status === 403) {

            alert(
                "Bạn không có quyền cập nhật người mượn"
            );

            return;
        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Cập nhật thất bại"
            );
        }


        alert(
            "Cập nhật người mượn thành công"
        );


        await loadBorrowers();

        closeBorrowerDetail();

    } catch (error) {

        console.error(
            "Lỗi khi cập nhật:",
            error
        );


        alert(
            error.message ||
            "Có lỗi xảy ra khi cập nhật"
        );
    }
}


// ==================================================
// SAVE UPDATE BUTTON
// ==================================================

const saveBorrowerBtn =
    document.getElementById(
        "saveBorrowerBtn"
    );


if (saveBorrowerBtn) {

    saveBorrowerBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            updateBorrower();
        }
    );
}


// ==================================================
// DELETE BORROWER
// ==================================================

async function deleteBorrower(
    borrowerCode
) {

    const confirmDelete =
        confirm(
            "Bạn có chắc muốn xóa người mượn này không?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${borrowerCode}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        // ------------------------------------------
        // TOKEN KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        // ------------------------------------------
        // LIBRARIAN KHÔNG CÓ QUYỀN XÓA
        // ------------------------------------------

        if (response.status === 403) {

            alert(
                "Bạn không có quyền xóa người mượn"
            );

            return;
        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Xóa người mượn thất bại"
            );
        }


        alert(
            "Xóa người mượn thành công"
        );


        await loadBorrowers();

    } catch (error) {

        console.error(
            "Lỗi khi xóa:",
            error
        );


        alert(
            error.message ||
            "Có lỗi xảy ra khi xóa người mượn"
        );
    }
}


// ==================================================
// CÁC PHẦN TỬ FORM THÊM NGƯỜI MƯỢN
// ==================================================

const addBorrowerBtn =
    document.getElementById(
        "addBorrowerBtn"
    );


const addBorrowerModal =
    document.getElementById(
        "addBorrowerModal"
    );


const closeAddBorrowerModal =
    document.getElementById(
        "closeAddBorrowerModal"
    );


const cancelAddBorrowerBtn =
    document.getElementById(
        "cancelAddBorrowerBtn"
    );


const addBorrowerForm =
    document.getElementById(
        "addBorrowerForm"
    );


const addBorrowerFormMessage =
    document.getElementById(
        "addBorrowerFormMessage"
    );


// ==================================================
// OPEN ADD MODAL
// ==================================================

if (addBorrowerBtn) {

    addBorrowerBtn.addEventListener(
        "click",
        function () {

            addBorrowerModal.classList.add(
                "show"
            );
        }
    );
}


// ==================================================
// CLOSE ADD MODAL
// ==================================================

function closeAddModal() {

    addBorrowerModal.classList.remove(
        "show"
    );
}


// ==================================================
// NÚT X ĐÓNG MODAL
// ==================================================

if (closeAddBorrowerModal) {

    closeAddBorrowerModal.addEventListener(
        "click",
        closeAddModal
    );
}


// ==================================================
// NÚT HỦY
// ==================================================

if (cancelAddBorrowerBtn) {

    cancelAddBorrowerBtn.addEventListener(
        "click",
        closeAddModal
    );
}


// ==================================================
// ADD BORROWER
// ==================================================

if (addBorrowerForm) {

    addBorrowerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // --------------------------------
            // XÓA THÔNG BÁO CŨ
            // --------------------------------

            addBorrowerFormMessage.textContent =
                "";


            // --------------------------------
            // LẤY DỮ LIỆU TỪ FORM
            // --------------------------------

            const data = {

                borrower_code:
                    document.getElementById(
                        "borrowerCode"
                    ).value.trim(),

                full_name:
                    document.getElementById(
                        "fullName"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "address"
                    ).value.trim(),

                date_of_birth:
                    document.getElementById(
                        "dateOfBirth"
                    ).value,

                gender:
                    document.getElementById(
                        "gender"
                    ).value,

                status:
                    document.getElementById(
                        "status"
                    ).value
            };


            // --------------------------------
            // KIỂM TRA DỮ LIỆU
            // --------------------------------

            if (!data.borrower_code) {

                addBorrowerFormMessage.textContent =
                    "Vui lòng nhập mã người mượn";

                return;
            }


            if (!data.full_name) {

                addBorrowerFormMessage.textContent =
                    "Vui lòng nhập họ và tên";

                return;
            }


            try {

                // --------------------------------
                // GỬI REQUEST POST
                // --------------------------------

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(true),

                            body:
                                JSON.stringify(data)
                        }
                    );


                // --------------------------------
                // TOKEN KHÔNG HỢP LỆ
                // --------------------------------

                if (
                    response.status === 401
                ) {

                    handleUnauthorized();

                    return;
                }


                // --------------------------------
                // KHÔNG CÓ QUYỀN
                // --------------------------------

                if (
                    response.status === 403
                ) {

                    addBorrowerFormMessage.textContent =
                        "Bạn không có quyền thêm người mượn";

                    return;
                }


                // --------------------------------
                // NHẬN RESPONSE
                // --------------------------------

                const result =
                    await response.json();


                // --------------------------------
                // KIỂM TRA KẾT QUẢ
                // --------------------------------

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Thêm người mượn thất bại"
                    );
                }


                // --------------------------------
                // THÀNH CÔNG
                // --------------------------------

                addBorrowerFormMessage.textContent =
                    "Thêm người mượn thành công";


                // --------------------------------
                // XÓA DỮ LIỆU FORM
                // --------------------------------

                addBorrowerForm.reset();


                // --------------------------------
                // ĐÓNG MODAL
                // --------------------------------

                setTimeout(
                    function () {

                        closeAddModal();

                        addBorrowerFormMessage.textContent =
                            "";

                    },
                    500
                );


                // --------------------------------
                // LOAD LẠI DANH SÁCH
                // --------------------------------

                await loadBorrowers();

            } catch (error) {

                console.error(
                    "Lỗi khi thêm người mượn:",
                    error
                );


                addBorrowerFormMessage.textContent =
                    error.message ||
                    "Có lỗi xảy ra khi thêm người mượn";
            }
        }
    );
}


// ==================================================
// CHẠY KHI MỞ TRANG
// ==================================================

loadBorrowers();

