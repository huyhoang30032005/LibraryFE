
// =================================================
// CẤU HÌNH API
// ==================================================

const API_URL =
    "https://library-management-backend-production-6e7d.up.railway.app/api/books";


// ==================================================
// BIẾN LƯU TOÀN BỘ SÁCH
// ==================================================

let allBooks = [];


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
// TẢI DANH SÁCH SÁCH TỪ API
// ==================================================

async function loadBooks() {

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
        // KIỂM TRA CHƯA ĐĂNG NHẬP
        // ------------------------------------------

        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );
        }


        const result =
            await response.json();


        console.log(
            "Dữ liệu sách:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không lấy được dữ liệu sách"
            );
        }


        // ------------------------------------------
        // LƯU TOÀN BỘ SÁCH
        // ------------------------------------------

        allBooks =
            result.data;


        // ------------------------------------------
        // TẠO DANH SÁCH THỂ LOẠI
        // ------------------------------------------

        renderCategoryFilter(
            allBooks
        );


        // ------------------------------------------
        // HIỂN THỊ TOÀN BỘ SÁCH
        // ------------------------------------------

        renderBooks(
            allBooks
        );

    } catch (error) {

        console.error(
            "Lỗi khi tải danh sách sách:",
            error
        );


        const tableBody =
            document.getElementById(
                "booksTableBody"
            );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        Không thể tải dữ liệu sách
                    </td>
                </tr>
            `;
        }
    }
}


// ==================================================
// HIỂN THỊ SÁCH RA BẢNG
// ==================================================

function renderBooks(books) {

    const tableBody =
        document.getElementById(
            "booksTableBody"
        );


    if (!tableBody) {

        console.error(
            "Không tìm thấy #booksTableBody"
        );

        return;
    }


    // ------------------------------------------
    // XÓA DỮ LIỆU CŨ
    // ------------------------------------------

    tableBody.innerHTML = "";


    // ------------------------------------------
    // KHÔNG CÓ DỮ LIỆU
    // ------------------------------------------

    if (
        !books ||
        books.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Không tìm thấy sách
                </td>
            </tr>
        `;

        return;
    }


    // ------------------------------------------
    // HIỂN THỊ TỪNG CUỐN SÁCH
    // ------------------------------------------

    books.forEach(book => {

        const row =
            document.createElement("tr");


        // ------------------------------------------
        // SỐ LƯỢNG ĐANG ĐƯỢC MƯỢN
        // ------------------------------------------

        const borrowedQuantity =
            Number(book.quantity) -
            Number(book.available_quantity);


        row.innerHTML = `

            <td>
                ${book.id}
            </td>

            <td>
                <strong>
                    ${book.title}
                </strong>
            </td>

            <td>
                ${book.author || "-"}
            </td>

            <td>
                ${book.genre || "-"}
            </td>

            <td>
                ${book.quantity}
            </td>

            <td>
                ${borrowedQuantity}
            </td>

            <td>
                ${book.language || "-"}
            </td>

            <td>

                <button
                    type="button"
                    class="detail-btn"
                    onclick="openBookDetail(${book.id})"
                >
                    Chi tiết
                </button>

            </td>

            <td>

                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteBook(${book.id})"
                >
                    Xóa
                </button>

            </td>

        `;


        tableBody.appendChild(
            row
        );
    });
}


// ==================================================
// TẠO DANH SÁCH THỂ LOẠI
// ==================================================

function renderCategoryFilter(books) {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) {

        console.error(
            "Không tìm thấy #categoryFilter"
        );

        return;
    }


    // ------------------------------------------
    // LẤY GENRE CỦA TẤT CẢ SÁCH
    // ------------------------------------------

    const categories =
        books
            .map(book => book.genre)
            .filter(genre => genre);


    // ------------------------------------------
    // XÓA THỂ LOẠI TRÙNG NHAU
    // ------------------------------------------

    const uniqueCategories =
        [...new Set(categories)];


    // ------------------------------------------
    // XÓA OPTION CŨ
    // ------------------------------------------

    categoryFilter.innerHTML = `
        <option value="">
            Tất cả thể loại
        </option>
    `;


    // ------------------------------------------
    // THÊM TỪNG THỂ LOẠI
    // ------------------------------------------

    uniqueCategories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );
        }
    );
}


// ==================================================
// TÌM KIẾM + LỌC THỂ LOẠI
// ==================================================

function filterBooks() {

    const searchInput =
        document.getElementById(
            "bookSearch"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (
        !searchInput ||
        !categoryFilter
    ) {

        console.error(
            "Không tìm thấy ô tìm kiếm hoặc bộ lọc"
        );

        return;
    }


    // ------------------------------------------
    // LẤY TỪ KHÓA TÌM KIẾM
    // ------------------------------------------

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    // ------------------------------------------
    // LẤY THỂ LOẠI ĐANG CHỌN
    // ------------------------------------------

    const selectedCategory =
        categoryFilter.value;


    // ------------------------------------------
    // LỌC DANH SÁCH SÁCH
    // ------------------------------------------

    const filteredBooks =
        allBooks.filter(book => {

            const matchesTitle =
                (book.title || "")
                    .toLowerCase()
                    .includes(keyword);


            const matchesAuthor =
                (book.author || "")
                    .toLowerCase()
                    .includes(keyword);


            const matchesGenre =
                (book.genre || "")
                    .toLowerCase()
                    .includes(keyword);


            const matchesKeyword =
                matchesTitle ||
                matchesAuthor ||
                matchesGenre;


            const matchesCategory =
                selectedCategory === "" ||
                book.genre === selectedCategory;


            return (
                matchesKeyword &&
                matchesCategory
            );
        });


    // ------------------------------------------
    // HIỂN THỊ KẾT QUẢ
    // ------------------------------------------

    renderBooks(
        filteredBooks
    );
}


// ==================================================
// SỰ KIỆN Ô TÌM KIẾM
// ==================================================

const bookSearch =
    document.getElementById(
        "bookSearch"
    );


if (bookSearch) {

    bookSearch.addEventListener(
        "input",
        filterBooks
    );
}


// ==================================================
// SỰ KIỆN BỘ LỌC THỂ LOẠI
// ==================================================

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterBooks
    );
}


// ==================================================
// MỞ CHI TIẾT SÁCH
// ==================================================

function openBookDetail(bookId) {

    const book =
        allBooks.find(
            book =>
                Number(book.id) ===
                Number(bookId)
        );


    if (!book) {

        console.error(
            "Không tìm thấy sách:",
            bookId
        );

        return;
    }


    document.getElementById(
        "editBookId"
    ).value =
        book.id;


    document.getElementById(
        "editBookCode"
    ).value =
        book.book_code || "";


    document.getElementById(
        "editBookTitle"
    ).value =
        book.title || "";


    document.getElementById(
        "editBookAuthor"
    ).value =
        book.author || "";


    document.getElementById(
        "editBookGenre"
    ).value =
        book.genre || "";


    document.getElementById(
        "editBookPublisher"
    ).value =
        book.publisher || "";


    document.getElementById(
        "editBookYear"
    ).value =
        book.publication_year || "";


    document.getElementById(
        "editBookLanguage"
    ).value =
        book.language || "";


    document.getElementById(
        "editBookPrice"
    ).value =
        book.price || "";


    document.getElementById(
        "editBookQuantity"
    ).value =
        book.quantity || 0;


    document.getElementById(
        "editBookShelf"
    ).value =
        book.shelf_location || "";


    document.getElementById(
        "editBookDescription"
    ).value =
        book.description || "";


    document
        .getElementById("bookModal")
        .classList.add("show");
}


// ==================================================
// ĐÓNG CHI TIẾT SÁCH
// ==================================================

function closeBookDetail() {

    document
        .getElementById("bookModal")
        .classList.remove("show");
}


const closeBookModal =
    document.getElementById(
        "closeBookModal"
    );


const cancelBookEdit =
    document.getElementById(
        "cancelBookEdit"
    );


if (closeBookModal) {

    closeBookModal.addEventListener(
        "click",
        closeBookDetail
    );
}


if (cancelBookEdit) {

    cancelBookEdit.addEventListener(
        "click",
        closeBookDetail
    );
}


// ==================================================
// CẬP NHẬT SÁCH
// ==================================================

async function updateBook() {

    const id =
        document.getElementById(
            "editBookId"
        ).value;


    const data = {

        book_code:
            document.getElementById(
                "editBookCode"
            ).value,

        title:
            document.getElementById(
                "editBookTitle"
            ).value,

        author:
            document.getElementById(
                "editBookAuthor"
            ).value,

        publisher:
            document.getElementById(
                "editBookPublisher"
            ).value,

        publication_year:
            document.getElementById(
                "editBookYear"
            ).value,

        genre:
            document.getElementById(
                "editBookGenre"
            ).value,

        language:
            document.getElementById(
                "editBookLanguage"
            ).value,

        price:
            document.getElementById(
                "editBookPrice"
            ).value,

        quantity:
            document.getElementById(
                "editBookQuantity"
            ).value,

        shelf_location:
            document.getElementById(
                "editBookShelf"
            ).value,

        description:
            document.getElementById(
                "editBookDescription"
            ).value
    };


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body:
                        JSON.stringify(data)
                }
            );


        // ------------------------------------------
        // TOKEN HẾT HẠN / KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            window.location.href =
                "login.html";

            return;
        }


        const result =
            await response.json();


        console.log(
            "Kết quả cập nhật:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Cập nhật sách thất bại"
            );
        }


        alert(
            "Cập nhật sách thành công"
        );


        closeBookDetail();


        await loadBooks();

    } catch (error) {

        console.error(
            "Lỗi khi cập nhật sách:",
            error
        );


        alert(
            error.message ||
            "Có lỗi xảy ra khi cập nhật sách"
        );
    }
}


// ==================================================
// FORM CẬP NHẬT SÁCH
// ==================================================

const bookForm =
    document.getElementById(
        "bookForm"
    );


if (bookForm) {

    bookForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            updateBook();
        }
    );
}


// ==================================================
// MỞ FORM THÊM SÁCH
// ==================================================

const addBookBtn =
    document.getElementById(
        "addBookBtn"
    );


const addBookModal =
    document.getElementById(
        "addBookModal"
    );


const closeAddBookModal =
    document.getElementById(
        "closeAddBookModal"
    );


const cancelAddBook =
    document.getElementById(
        "cancelAddBook"
    );


if (addBookBtn) {

    addBookBtn.addEventListener(
        "click",
        function () {

            addBookModal.classList.add(
                "show"
            );
        }
    );
}


if (closeAddBookModal) {

    closeAddBookModal.addEventListener(
        "click",
        function () {

            addBookModal.classList.remove(
                "show"
            );
        }
    );
}


if (cancelAddBook) {

    cancelAddBook.addEventListener(
        "click",
        function () {

            addBookModal.classList.remove(
                "show"
            );
        }
    );
}


// ==================================================
// THÊM SÁCH MỚI
// ==================================================

async function addBook() {

    const data = {

        book_code:
            document.getElementById(
                "addBookCode"
            ).value,

        title:
            document.getElementById(
                "addBookTitle"
            ).value,

        author:
            document.getElementById(
                "addBookAuthor"
            ).value,

        publisher:
            document.getElementById(
                "addBookPublisher"
            ).value,

        publication_year:
            document.getElementById(
                "addBookYear"
            ).value,

        genre:
            document.getElementById(
                "addBookGenre"
            ).value,

        language:
            document.getElementById(
                "addBookLanguage"
            ).value,

        price:
            document.getElementById(
                "addBookPrice"
            ).value,

        quantity:
            document.getElementById(
                "addBookQuantity"
            ).value,

        shelf_location:
            document.getElementById(
                "addBookShelf"
            ).value,

        description:
            document.getElementById(
                "addBookDescription"
            ).value
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
        // TOKEN HẾT HẠN / KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            window.location.href =
                "login.html";

            return;
        }


        const result =
            await response.json();


        console.log(
            "Kết quả thêm sách:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Thêm sách thất bại"
            );
        }


        alert(
            "Thêm sách thành công"
        );


        addBookModal.classList.remove(
            "show"
        );


        document
            .getElementById("addBookForm")
            .reset();


        await loadBooks();

    } catch (error) {

        console.error(
            "Lỗi khi thêm sách:",
            error
        );


        alert(
            error.message ||
            "Có lỗi xảy ra khi thêm sách"
        );
    }
}


// ==================================================
// FORM THÊM SÁCH
// ==================================================

const addBookForm =
    document.getElementById(
        "addBookForm"
    );


if (addBookForm) {

    addBookForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            addBook();
        }
    );
}


// ==================================================
// XÓA SÁCH
// ==================================================

async function deleteBook(id) {

    console.log(
        "Đã gọi deleteBook(), ID =",
        id
    );


    const confirmed =
        confirm(
            "Bạn có chắc chắn muốn xóa sách này không?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        // ------------------------------------------
        // CHƯA ĐĂNG NHẬP / TOKEN KHÔNG HỢP LỆ
        // ------------------------------------------

        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            window.location.href =
                "login.html";

            return;
        }


        // ------------------------------------------
        // KHÔNG CÓ QUYỀN XÓA
        // ------------------------------------------

        if (response.status === 403) {

            alert(
                "Bạn không có quyền xóa sách"
            );

            return;
        }


        const result =
            await response.json();


        console.log(
            "Kết quả DELETE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Xóa sách thất bại"
            );
        }


        alert(
            "Xóa sách thành công"
        );


        await loadBooks();

    } catch (error) {

        console.error(
            "Lỗi khi xóa sách:",
            error
        );


        alert(
            error.message ||
            "Có lỗi xảy ra khi xóa sách"
        );
    }
}


// ==================================================
// CHẠY KHI MỞ TRANG
// ==================================================

loadBooks();

