const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5500;

// Cho phép truy cập các file HTML, CSS, JS
app.use(express.static(__dirname));

// Trang mặc định
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "login.html")
    );
});

app.listen(PORT, () => {
    console.log(
        `Frontend running on port ${PORT}`
    );
});