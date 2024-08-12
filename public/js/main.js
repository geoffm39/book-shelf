$(".edit-button").click(function() {
    const bookId = $(this).attr("book-index");
    window.location.href = `/edit/${bookId}`;
});

$(".delete-button").click(function() {
    const bookId = $(this).attr("book-index");
    fetch(`/delete/${bookId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(data => {
        window.location.href = "/";
    });
});