
// =====================================================
// CẤU HÌNH API
// =====================================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/borrowings";

const BORROWERS_API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/borrowers";

const BOOKS_API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/books";


// =====================================================
// BIẾN DÙNG CHUNG
// =====================================================

let borrowings = [];

let borrowers = [];

let books = [];

let selectedBooks = [];


// =====================================================
// LẤY TOKEN ĐĂNG NHẬP
// =====================================================

function getToken() {

    return localStorage.getItem("token");
}


// =====================================================
// TẠO HEADER CÓ TOKEN
// =====================================================

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


// =====================================================
// XỬ LÝ TOKEN HẾT HẠN / KHÔNG HỢP LỆ
// =====================================================

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


// =====================================================
// 1. TẢI DANH SÁCH PHIẾU MƯỢN
// =====================================================

async function loadBorrowings() {

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
                "Không thể tải danh sách phiếu mượn"
            );
        }


        borrowings =
            result.data || [];


        renderBorrowingsTable();

    } catch (error) {

        console.error(
            "Lỗi tải danh sách phiếu mượn:",
            error
        );


        const tbody =
            document.getElementById(
                "borrowingsTableBody"
            );


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-table"
                    >
                        Không thể tải dữ liệu
                    </td>
                </tr>
            `;
        }
    }
}


// =====================================================
// 2. HIỂN THỊ BẢNG PHIẾU MƯỢN
// =====================================================

function renderBorrowingsTable(
    data = borrowings
) {

    const tbody =
        document.getElementById(
            "borrowingsTableBody"
        );


    if (!tbody) {

        return;
    }


    tbody.innerHTML = "";


    // -----------------------------------------------
    // KHÔNG CÓ DỮ LIỆU
    // -----------------------------------------------

    if (
        !data ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-table"
                >
                    Không có phiếu mượn nào
                </td>
            </tr>
        `;

        return;
    }


    // -----------------------------------------------
    // TẠO TỪNG DÒNG
    // -----------------------------------------------

    data.forEach(
        borrowing => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${borrowing.borrowing_code || "-"}
                </td>

                <td>
                    ${borrowing.borrower_name || "-"}
                </td>

                <td>
                    ${borrowing.book_titles || "-"}
                </td>

                <td>
                    ${formatDate(
                        borrowing.borrow_date
                    )}
                </td>

                <td>
                    ${formatDate(
                        borrowing.due_date
                    )}
                </td>

                <td>
                    ${
                        borrowing.return_date
                            ? formatDate(
                                borrowing.return_date
                            )
                            : "-"
                    }
                </td>

                <td>
                    ${getStatusHTML(
                        borrowing.status
                    )}
                </td>

                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="detail-btn borrowing-detail-btn"
                            data-id="${borrowing.id}"
                        >
                            Chi tiết
                        </button>

                        ${
                            borrowing.status === "borrowing" ||
                            borrowing.status === "overdue"

                                ? `

                                    <button
                                        type="button"
                                        class="edit-btn borrowing-return-btn"
                                        data-id="${borrowing.id}"
                                    >
                                        Trả sách
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-btn borrowing-cancel-btn"
                                        data-id="${borrowing.id}"
                                    >
                                        Hủy
                                    </button>

                                `

                                : ""
                        }

                    </div>

                </td>
            `;


            tbody.appendChild(
                row
            );
        }
    );


    // -----------------------------------------------
    // NÚT CHI TIẾT
    // -----------------------------------------------

    document
        .querySelectorAll(
            ".borrowing-detail-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );


                        openBorrowingDetail(
                            id
                        );
                    }
                );
            }
        );


    // -----------------------------------------------
    // NÚT TRẢ SÁCH
    // -----------------------------------------------

    document
        .querySelectorAll(
            ".borrowing-return-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );


                        returnBorrowing(
                            id
                        );
                    }
                );
            }
        );


    // -----------------------------------------------
    // NÚT HỦY
    // -----------------------------------------------

    document
        .querySelectorAll(
            ".borrowing-cancel-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );


                        cancelBorrowing(
                            id
                        );
                    }
                );
            }
        );
}


// =====================================================
// 3. HIỂN THỊ TRẠNG THÁI
// =====================================================

function getStatusHTML(
    status
) {

    switch (status) {

        case "borrowing":

            return `
                <span
                    class="status-badge status-borrowing"
                >
                    Đang mượn
                </span>
            `;


        case "returned":

            return `
                <span
                    class="status-badge status-returned"
                >
                    Đã trả
                </span>
            `;


        case "overdue":

            return `
                <span
                    class="status-badge status-overdue"
                >
                    Quá hạn
                </span>
            `;


        case "cancelled":

            return `
                <span
                    class="status-badge status-cancelled"
                >
                    Đã hủy
                </span>
            `;


        default:

            return `
                <span class="status-badge">
                    ${status || "-"}
                </span>
            `;
    }
}


// =====================================================
// 4. ĐỊNH DẠNG NGÀY
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";
    }


    const date =
        new Date(dateString);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;
}


// =====================================================
// 5. TÌM KIẾM + LỌC
// =====================================================

function filterBorrowings() {

    const searchInput =
        document.getElementById(
            "borrowingSearch"
        );


    const statusFilter =
        document.getElementById(
            "borrowingStatusFilter"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredData =
        borrowings.filter(
            borrowing => {

                const text = `

                    ${borrowing.borrowing_code || ""}

                    ${borrowing.borrower_name || ""}

                    ${borrowing.borrower_code || ""}

                    ${borrowing.book_titles || ""}

                `.toLowerCase();


                const matchKeyword =
                    text.includes(
                        keyword
                    );


                let matchStatus =
                    true;


                if (status) {

                    matchStatus =
                        borrowing.status ===
                        status;
                }


                return (
                    matchKeyword &&
                    matchStatus
                );
            }
        );


    renderBorrowingsTable(
        filteredData
    );
}


// =====================================================
// 6. MỞ MODAL THÊM PHIẾU
// =====================================================

async function openAddBorrowingModal() {

    const modal =
        document.getElementById(
            "addBorrowingModal"
        );


    if (!modal) {

        return;
    }


    selectedBooks = [];


    document
        .getElementById(
            "addBorrowingForm"
        )
        ?.reset();


    clearAddBorrowingMessage();


    const borrowDate =
        document.getElementById(
            "borrowDate"
        );


    if (borrowDate) {

        const today =
            new Date();


        borrowDate.value =
            today.toISOString()
                .slice(
                    0,
                    16
                );
    }


    modal.classList.add(
        "show"
    );


    await Promise.all([
        loadBorrowers(),
        loadBooks()
    ]);


    renderSelectedBooks();
}


// =====================================================
// 7. ĐÓNG MODAL THÊM PHIẾU
// =====================================================

function closeAddBorrowingModal() {

    const modal =
        document.getElementById(
            "addBorrowingModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }


    selectedBooks = [];


    renderSelectedBooks();
}


// =====================================================
// 8. TẢI NGƯỜI MƯỢN
// =====================================================

async function loadBorrowers() {

    try {

        const response =
            await fetch(
                BORROWERS_API_URL,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


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
                "Không thể tải người mượn"
            );
        }


        borrowers =
            result.data || [];


        const select =
            document.getElementById(
                "borrowingBorrower"
            );


        if (!select) {

            return;
        }


        select.innerHTML = `
            <option value="">
                -- Chọn người mượn --
            </option>
        `;


        borrowers.forEach(
            borrower => {

                if (
                    borrower.status &&
                    borrower.status !== "active"
                ) {

                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    borrower.id;


                option.textContent =
                    `${borrower.borrower_code} - ${borrower.full_name}`;


                select.appendChild(
                    option
                );
            }
        );

    } catch (error) {

        console.error(
            "Lỗi tải người mượn:",
            error
        );
    }
}


// =====================================================
// 9. TẢI SÁCH
// =====================================================

async function loadBooks() {

    try {

        const response =
            await fetch(
                BOOKS_API_URL,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


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
                "Không thể tải danh sách sách"
            );
        }


        books =
            result.data || [];


        const select =
            document.getElementById(
                "borrowingBook"
            );


        if (!select) {

            return;
        }


        select.innerHTML = `
            <option value="">
                -- Chọn sách --
            </option>
        `;


        books.forEach(
            book => {

                if (
                    book.is_deleted === true ||
                    Number(
                        book.available_quantity
                    ) <= 0
                ) {

                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    book.id;


                option.textContent =
                    `${book.book_code} - ${book.title} (còn ${book.available_quantity})`;


                select.appendChild(
                    option
                );
            }
        );

    } catch (error) {

        console.error(
            "Lỗi tải sách:",
            error
        );
    }
}


// =====================================================
// 10. THÊM SÁCH VÀO PHIẾU
// =====================================================

function addBorrowingBook() {

    const bookSelect =
        document.getElementById(
            "borrowingBook"
        );


    const quantityInput =
        document.getElementById(
            "borrowingQuantity"
        );


    if (
        !bookSelect ||
        !quantityInput
    ) {

        return;
    }


    const bookId =
        Number(
            bookSelect.value
        );


    const quantity =
        Number(
            quantityInput.value
        );


    if (!bookId) {

        showAddBorrowingMessage(
            "Vui lòng chọn sách.",
            "error"
        );

        return;
    }


    if (
        !quantity ||
        quantity < 1
    ) {

        showAddBorrowingMessage(
            "Số lượng phải lớn hơn 0.",
            "error"
        );

        return;
    }


    const book =
        books.find(
            item =>
                Number(item.id) ===
                bookId
        );


    if (!book) {

        showAddBorrowingMessage(
            "Không tìm thấy sách.",
            "error"
        );

        return;
    }


    const availableQuantity =
        Number(
            book.available_quantity
        );


    if (
        quantity >
        availableQuantity
    ) {

        showAddBorrowingMessage(
            `Sách chỉ còn ${availableQuantity} quyển.`,
            "error"
        );

        return;
    }


    const existing =
        selectedBooks.find(
            item =>
                Number(item.book_id) ===
                bookId
        );


    if (existing) {

        const newQuantity =
            existing.quantity +
            quantity;


        if (
            newQuantity >
            availableQuantity
        ) {

            showAddBorrowingMessage(
                `Sách chỉ còn ${availableQuantity} quyển.`,
                "error"
            );

            return;
        }


        existing.quantity =
            newQuantity;

    } else {

        selectedBooks.push({

            book_id:
                bookId,

            quantity:
                quantity,

            book_code:
                book.book_code,

            title:
                book.title,

            available_quantity:
                availableQuantity
        });
    }


    renderSelectedBooks();


    bookSelect.value = "";

    quantityInput.value = 1;


    clearAddBorrowingMessage();
}


// =====================================================
// 11. HIỂN THỊ SÁCH ĐÃ CHỌN
// =====================================================

function renderSelectedBooks() {

    const tbody =
        document.getElementById(
            "borrowingBooksTableBody"
        );


    if (!tbody) {

        return;
    }


    tbody.innerHTML = "";


    if (
        selectedBooks.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="empty-table"
                >
                    Chưa có sách nào
                </td>
            </tr>
        `;

        return;
    }


    selectedBooks.forEach(
        (book, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${book.book_code}
                </td>

                <td>
                    ${book.title}
                </td>

                <td>
                    ${book.quantity}
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-btn borrowing-remove-book-btn"
                        data-index="${index}"
                    >
                        Xóa
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );
        }
    );


    document
        .querySelectorAll(
            ".borrowing-remove-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        removeBorrowingBook(
                            index
                        );
                    }
                );
            }
        );
}


// =====================================================
// 12. XÓA SÁCH KHỎI PHIẾU
// =====================================================

function removeBorrowingBook(
    index
) {

    selectedBooks.splice(
        index,
        1
    );


    renderSelectedBooks();
}


// =====================================================
// 13. TẠO PHIẾU MƯỢN
// =====================================================

async function createBorrowing(
    event
) {

    event.preventDefault();


    const borrowingCode =
        document.getElementById(
            "borrowingCode"
        ).value.trim();


    const borrowerId =
        Number(
            document.getElementById(
                "borrowingBorrower"
            ).value
        );


    const borrowDate =
        document.getElementById(
            "borrowDate"
        ).value;


    const dueDate =
        document.getElementById(
            "dueDate"
        ).value;


    const note =
        document.getElementById(
            "borrowingNote"
        ).value.trim();


    if (!borrowingCode) {

        showAddBorrowingMessage(
            "Vui lòng nhập mã phiếu.",
            "error"
        );

        return;
    }


    if (!borrowerId) {

        showAddBorrowingMessage(
            "Vui lòng chọn người mượn.",
            "error"
        );

        return;
    }


    if (!dueDate) {

        showAddBorrowingMessage(
            "Vui lòng chọn hạn trả.",
            "error"
        );

        return;
    }


    if (
        selectedBooks.length === 0
    ) {

        showAddBorrowingMessage(
            "Vui lòng thêm ít nhất một quyển sách.",
            "error"
        );

        return;
    }


    const data = {

        borrowing_code:
            borrowingCode,

        borrower_id:
            borrowerId,

        // Không gửi user_id = 1 nữa.
        // Backend lấy req.user.id từ JWT.

        borrow_date:
            borrowDate ||
            undefined,

        due_date:
            dueDate,

        note:
            note,

        books:
            selectedBooks.map(
                book => ({

                    book_id:
                        Number(
                            book.book_id
                        ),

                    quantity:
                        Number(
                            book.quantity
                        )
                })
            )
    };


    try {

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


        // ------------------------------------------
        // TOKEN KHÔNG HỢP LỆ
        // ------------------------------------------

        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;
        }


        // ------------------------------------------
        // KHÔNG CÓ QUYỀN
        // ------------------------------------------

        if (
            response.status === 403
        ) {

            showAddBorrowingMessage(
                "Bạn không có quyền tạo phiếu mượn.",
                "error"
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
                "Không thể tạo phiếu mượn"
            );
        }


        alert(
            result.message ||
            "Lập phiếu mượn thành công"
        );


        closeAddBorrowingModal();


        await loadBorrowings();

    } catch (error) {

        console.error(
            "Lỗi tạo phiếu mượn:",
            error
        );


        showAddBorrowingMessage(
            error.message ||
            "Không thể tạo phiếu mượn",
            "error"
        );
    }
}


// =====================================================
// 14. XEM CHI TIẾT PHIẾU MƯỢN
// =====================================================

async function openBorrowingDetail(
    id
) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;
        }


        if (
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền xem phiếu mượn này."
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
                "Không thể tải chi tiết phiếu mượn"
            );
        }


        console.log(
            "Dữ liệu chi tiết phiếu:",
            result
        );


        console.log(
            "result.data:",
            result.data
        );


        const data =
            result.data;


        const borrowing =
            data.borrowing;


        const details =
            data.details || [];


        // -------------------------
        // THÔNG TIN PHIẾU
        // -------------------------

        document.getElementById(
            "detailBorrowingCode"
        ).textContent =
            borrowing.borrowing_code || "-";


        document.getElementById(
            "detailBorrowerName"
        ).textContent =
            borrowing.borrower_name || "-";


        document.getElementById(
            "detailBorrowerCode"
        ).textContent =
            borrowing.borrower_code || "-";


        document.getElementById(
            "detailBorrowDate"
        ).textContent =
            formatDate(
                borrowing.borrow_date
            );


        document.getElementById(
            "detailDueDate"
        ).textContent =
            formatDate(
                borrowing.due_date
            );


        document.getElementById(
            "detailReturnDate"
        ).textContent =
            borrowing.return_date
                ? formatDate(
                    borrowing.return_date
                )
                : "-";


        document.getElementById(
            "detailBorrowingNote"
        ).textContent =
            borrowing.note || "-";


        document.getElementById(
            "detailBorrowingStatus"
        ).innerHTML =
            getStatusHTML(
                borrowing.status
            );


        // -------------------------
        // DANH SÁCH SÁCH
        // -------------------------

        const tbody =
            document.getElementById(
                "detailBorrowingBooksBody"
            );


        if (!tbody) {

            return;
        }


        tbody.innerHTML = "";


        if (
            details.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="empty-table"
                    >
                        Không có sách
                    </td>
                </tr>
            `;

        } else {

            details.forEach(
                book => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${book.book_code || "-"}
                        </td>

                        <td>
                            ${book.title || "-"}
                        </td>

                        <td>
                            ${book.quantity || 0}
                        </td>

                        <td>
                            ${book.returned_quantity || 0}
                        </td>

                    `;


                    tbody.appendChild(
                        row
                    );
                }
            );
        }


        // -------------------------
        // MỞ MODAL
        // -------------------------

        const modal =
            document.getElementById(
                "borrowingDetailModal"
            );


        if (modal) {

            modal.classList.add(
                "show"
            );
        }

    } catch (error) {

        console.error(
            "Lỗi tải chi tiết:",
            error
        );


        alert(
            error.message ||
            "Không thể tải chi tiết phiếu mượn"
        );
    }
}


// =====================================================
// 15. ĐÓNG MODAL CHI TIẾT
// =====================================================

function closeBorrowingDetail() {

    const modal =
        document.getElementById(
            "borrowingDetailModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// 16. TRẢ SÁCH
// =====================================================

async function returnBorrowing(
    id
) {

    const confirmed =
        confirm(
            "Bạn có chắc muốn trả sách cho phiếu này?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}/return`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;
        }


        if (
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền trả sách."
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
                "Không thể trả sách"
            );
        }


        alert(
            result.message ||
            "Trả sách thành công"
        );


        await loadBorrowings();

    } catch (error) {

        console.error(
            "Lỗi trả sách:",
            error
        );


        alert(
            error.message ||
            "Không thể trả sách"
        );
    }
}


// =====================================================
// 17. HỦY PHIẾU
// =====================================================

async function cancelBorrowing(
    id
) {

    const confirmed =
        confirm(
            "Bạn có chắc muốn hủy phiếu mượn này?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}/cancel`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;
        }


        if (
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền hủy phiếu mượn."
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
                "Không thể hủy phiếu"
            );
        }


        alert(
            result.message ||
            "Hủy phiếu thành công"
        );


        await loadBorrowings();

    } catch (error) {

        console.error(
            "Lỗi hủy phiếu:",
            error
        );


        alert(
            error.message ||
            "Không thể hủy phiếu"
        );
    }
}


// =====================================================
// 18. THÔNG BÁO TRONG FORM
// =====================================================

function showAddBorrowingMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "addBorrowingFormMessage"
        );


    if (!element) {

        return;
    }


    element.textContent =
        message;


    element.className =
        `form-message ${type}`;
}


function clearAddBorrowingMessage() {

    const element =
        document.getElementById(
            "addBorrowingFormMessage"
        );


    if (!element) {

        return;
    }


    element.textContent = "";

    element.className =
        "form-message";
}


// =====================================================
// 19. KHỞI TẠO TRANG
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ------------------------------------------
        // TẢI PHIẾU MƯỢN
        // ------------------------------------------

        loadBorrowings();


        // ------------------------------------------
        // TÌM KIẾM
        // ------------------------------------------

        const searchInput =
            document.getElementById(
                "borrowingSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterBorrowings
            );
        }


        // ------------------------------------------
        // LỌC TRẠNG THÁI
        // ------------------------------------------

        const statusFilter =
            document.getElementById(
                "borrowingStatusFilter"
            );


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterBorrowings
            );
        }


        // ------------------------------------------
        // MODAL THÊM
        // ------------------------------------------

        const addButton =
            document.getElementById(
                "addBorrowingBtn"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                openAddBorrowingModal
            );
        }


        const closeAddButton =
            document.getElementById(
                "closeAddBorrowingModal"
            );


        if (closeAddButton) {

            closeAddButton.addEventListener(
                "click",
                closeAddBorrowingModal
            );
        }


        const cancelAddButton =
            document.getElementById(
                "cancelAddBorrowingBtn"
            );


        if (cancelAddButton) {

            cancelAddButton.addEventListener(
                "click",
                closeAddBorrowingModal
            );
        }


        const addBookButton =
            document.getElementById(
                "addBorrowingBookBtn"
            );


        if (addBookButton) {

            addBookButton.addEventListener(
                "click",
                addBorrowingBook
            );
        }


        const form =
            document.getElementById(
                "addBorrowingForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                createBorrowing
            );
        }


        // ------------------------------------------
        // MODAL CHI TIẾT
        // ------------------------------------------

        const closeDetailButton =
            document.getElementById(
                "closeBorrowingDetailModal"
            );


        if (closeDetailButton) {

            closeDetailButton.addEventListener(
                "click",
                closeBorrowingDetail
            );
        }


        const closeDetailFooterButton =
            document.getElementById(
                "closeBorrowingDetailBtn"
            );


        if (closeDetailFooterButton) {

            closeDetailFooterButton.addEventListener(
                "click",
                closeBorrowingDetail
            );
        }
    }
);

