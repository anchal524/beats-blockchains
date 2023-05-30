function sortTable(f, n) {
    var rows = $("#songslist tbody  tr").get();

    rows.sort(function (a, b) {
        var A = getVal(a);
        var B = getVal(b);

        if (A < B) {
            return -1 * f;
        }
        if (A > B) {
            return 1 * f;
        }
        return 0;
    });

    function getVal(elm) {
        var v = $(elm).children("td").eq(n).text().toUpperCase();
        if ($.isNumeric(v)) {
            v = parseInt(v, 10);
        }
        return v;
    }

    $.each(rows, function (index, row) {
        $("#songslist").children("tbody").append(row);
    });
}
var name = 1;
var artistSort = 1;
var lastPriceSort = 1;
var currpriceSort = 1;
$("#songname").click(function () {
    name *= -1;
    var n = $(this).prevAll().length;
    sortTable(name, n);
});
$("#artist").click(function () {
    artistSort *= -1;
    var n = $(this).prevAll().length;
    sortTable(artistSort, n);
});
$("#lastprice").click(function () {
    lastPriceSort *= -1;
    var n = $(this).prevAll().length;
    sortTable(lastPriceSort, n);
});
$("#currprice").click(function () {
    currpriceSort *= -1;
    var n = $(this).prevAll().length;
    sortTable(currpriceSort, n);
});
