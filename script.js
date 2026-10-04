// ========================================
// CẤU HÌNH API
// ========================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app";

const BOOKS_API_URL =
    `${API_URL}/api/books`;

const BORROWINGS_API_URL =
    `${API_URL}/api/borrowings`;


// ========================================
// JWT - LẤY TOKEN
// ========================================

function getToken() {

    return localStorage.getItem("token");

}


// ========================================
// JWT - TẠO HEADERS
// ========================================

function getAuthHeaders() {

    const token =
        getToken();

    const headers = {};

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

    localStorage.removeItem(
        "currentUser"
    );

    sessionStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "login.html";

}


// ========================================
// TỔNG SÁCH
// ========================================

async function loadTotalBooks() {

    try {

        const response =
            await fetch(
                `${BOOKS_API_URL}/count`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem thống kê sách"
            );

        }


        if (!response.ok) {

            throw new Error(
                "Không thể lấy tổng số sách"
            );

        }


        const result =
            await response.json();


        document.getElementById(
            "totalBooks"
        ).textContent =
            result.data.total;


    } catch (error) {

        console.error(
            "Lỗi khi lấy tổng số sách:",
            error
        );

    }

}

loadTotalBooks();


// ========================================
// SÁCH CÓ SẴN
// ========================================

async function loadTotalAvailableBooks() {

    try {

        const response =
            await fetch(
                `${BOOKS_API_URL}/available-count`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem thống kê sách"
            );

        }


        if (!response.ok) {

            throw new Error(
                "Không thể lấy tổng số sách có sẵn"
            );

        }


        const result =
            await response.json();


        document.getElementById(
            "availableBooks"
        ).textContent =
            result.data;


    } catch (error) {

        console.error(
            "Lỗi khi lấy tổng số sách có sẵn:",
            error
        );

    }

}

loadTotalAvailableBooks();


// ========================================
// SÁCH ĐANG MƯỢN
// ========================================

async function loadTotalBorrowedBooks() {

    try {

        const response =
            await fetch(
                `${BOOKS_API_URL}/borrowed-count`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem thống kê sách"
            );

        }


        if (!response.ok) {

            throw new Error(
                "Không thể lấy tổng số sách đang mượn"
            );

        }


        const result =
            await response.json();


        document.getElementById(
            "borrowedBooks"
        ).textContent =
            result.data;


    } catch (error) {

        console.error(
            "Lỗi khi lấy tổng số sách đang mượn:",
            error
        );

    }

}

loadTotalBorrowedBooks();


// ========================================
// ĐẾM SÁCH QUÁ HẠN
// ========================================

async function loadTotalOverdueBooks() {

    try {

        const response =
            await fetch(
                `${BOOKS_API_URL}/overdue-count`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem thống kê sách"
            );

        }


        if (!response.ok) {

            throw new Error(
                "Không thể lấy tổng số sách quá hạn"
            );

        }


        const result =
            await response.json();


        document.getElementById(
            "overdueBooks"
        ).textContent =
            result.data;


    } catch (error) {

        console.error(
            "Lỗi khi lấy tổng số sách quá hạn:",
            error
        );

    }

}

loadTotalOverdueBooks();


// ========================================
// BIỂU ĐỒ LƯỢT MƯỢN
// ========================================

function renderBorrowingChart(data) {

    const chart =
        document.getElementById(
            "borrowingChart"
        );


    chart.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        chart.innerHTML = `
            <div class="bar-column">

                <div
                    class="bar"
                    style="height: 0%"
                ></div>

                <span>
                    Không có dữ liệu
                </span>

            </div>
        `;

        return;

    }


    const maxValue =
        Math.max(
            ...data.map(
                item =>
                    Number(
                        item.total
                    )
            )
        );


    data.forEach(item => {

        const total =
            Number(
                item.total
            );


        const height =
            maxValue > 0
                ? (total / maxValue) * 100
                : 0;


        const barColumn =
            document.createElement(
                "div"
            );


        barColumn.className =
            "bar-column";


        barColumn.innerHTML = `
            <div class="bar-value">
                ${total}
            </div>

            <div
                class="bar"
                style="height: ${height}%"
            ></div>

            <span>
                Tháng ${item.month}
            </span>
        `;


        chart.appendChild(
            barColumn
        );

    });

}


// ========================================
// LẤY DỮ LIỆU BIỂU ĐỒ LƯỢT MƯỢN
// ========================================

async function loadBorrowingChart(
    months = 6
) {

    try {

        const response =
            await fetch(
                `${BORROWINGS_API_URL}/statistics?months=${months}`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem thống kê mượn sách"
            );

        }


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Dữ liệu biểu đồ:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không lấy được dữ liệu"
            );

        }


        renderBorrowingChart(
            result.data
        );


    } catch (error) {

        console.error(
            "Lỗi khi lấy thống kê lượt mượn:",
            error
        );

    }

}


// ========================================
// XỬ LÝ SỰ KIỆN THAY ĐỔI
// KHOẢNG THỜI GIAN BIỂU ĐỒ
// ========================================

const chartPeriod =
    document.getElementById(
        "chartPeriod"
    );


if (chartPeriod) {

    chartPeriod.addEventListener(
        "change",
        function () {

            const months =
                Number(
                    this.value
                );


            loadBorrowingChart(
                months
            );

        }
    );

}


loadBorrowingChart(6);


// ========================================
// TẠO BẢNG DỮ LIỆU SÁCH QUÁ HẠN
// ========================================

function renderOverdueBooks(data) {

    const list =
        document.getElementById(
            "overdueList"
        );


    if (!list) {

        console.error(
            "Không tìm thấy #overdueList"
        );

        return;

    }


    // XÓA DỮ LIỆU CŨ

    list.innerHTML = "";


    // ========================================
    // TẠO HÀNG TIÊU ĐỀ
    // ========================================

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "overdue-header";


    header.innerHTML = `
        <div></div>

        <div>
            Mã phiếu
        </div>

        <div>
            Tên sách
        </div>

        <div>
            Người mượn
        </div>

        <div>
            Hạn trả
        </div>

        <div>
            Số lượng
        </div>
    `;


    list.appendChild(
        header
    );


    // ========================================
    // KHÔNG CÓ DỮ LIỆU
    // ========================================

    if (
        !data ||
        data.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "overdue-empty";


        empty.textContent =
            "Không có sách quá hạn";


        list.appendChild(
            empty
        );


        return;

    }


    // ========================================
    // TẠO CÁC DÒNG DỮ LIỆU
    // ========================================

    data.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "overdue-item";


        row.innerHTML = `
            <div class="book-icon">
                ▤
            </div>

            <div class="overdue-code">
                ${item.borrowing_code}
            </div>

            <div class="overdue-book">
                ${item.book_title}
            </div>

            <div class="overdue-borrower">
                ${item.borrower_name}
            </div>

            <div class="overdue-date">
                ${formatDate(
                    item.due_date
                )}
            </div>

            <div class="overdue-quantity">
                ${item.quantity}
            </div>
        `;


        list.appendChild(
            row
        );

    });

}


// ========================================
// LẤY DỮ LIỆU SÁCH QUÁ HẠN
// ========================================

async function loadOverdueBooks() {

    try {

        const response =
            await fetch(
                `${BORROWINGS_API_URL}/overdue`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem sách quá hạn"
            );

        }


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Sách quá hạn:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không lấy được dữ liệu"
            );

        }


        renderOverdueBooks(
            result.data
        );


    } catch (error) {

        console.error(
            "Lỗi khi lấy danh sách sách quá hạn:",
            error
        );

    }

}


loadOverdueBooks();


// ========================================
// HIỂN THỊ PHIẾU MƯỢN GẦN ĐÂY
// ========================================

function renderRecentBorrowings(data) {

    const table =
        document.getElementById(
            "recentBorrowings"
        );


    if (!table) {

        console.error(
            "Không tìm thấy #recentBorrowings"
        );

        return;

    }


    table.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Không có phiếu mượn gần đây
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(item => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `
            <td>
                <strong>
                    ${item.borrowing_code}
                </strong>
            </td>

            <td>
                ${item.borrower_name}
            </td>

            <td>
                ${item.book_title}
            </td>

            <td>
                ${formatDate(
                    item.borrow_date
                )}
            </td>

            <td>
                ${formatDate(
                    item.due_date
                )}
            </td>

            <td>
                ${getBorrowingStatus(
                    item.status
                )}
            </td>
        `;


        table.appendChild(
            row
        );

    });

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ========================================
// LẤY PHIẾU MƯỢN GẦN ĐÂY
// ========================================

async function loadRecentBorrowings() {

    try {

        const response =
            await fetch(
                `${BORROWINGS_API_URL}/recent`,
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


        if (
            response.status ===
            403
        ) {

            throw new Error(
                "Bạn không có quyền xem phiếu mượn gần đây"
            );

        }


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Phiếu mượn gần đây:",
            result
        );


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Không lấy được dữ liệu"
            );

        }


        renderRecentBorrowings(
            result.data
        );


    } catch (error) {

        console.error(
            "Lỗi khi lấy danh sách phiếu mượn gần đây:",
            error
        );

    }

}


// ========================================
// CHUYỂN TRẠNG THÁI PHIẾU MƯỢN
// ========================================

function getBorrowingStatus(status) {

    switch (status) {

        case "borrowing":

            return `
                <span class="status borrowing">
                    Đang mượn
                </span>
            `;


        case "returned":

            return `
                <span class="status returned">
                    Đã trả
                </span>
            `;


        case "overdue":

            return `
                <span class="status overdue">
                    Quá hạn
                </span>
            `;


        case "cancelled":

            return `
                <span class="status cancelled">
                    Đã hủy
                </span>
            `;


        default:

            return `
                <span class="status">
                    Không xác định
                </span>
            `;

    }

}


// ========================================
// KHỞI ĐỘNG
// ========================================

loadRecentBorrowings();