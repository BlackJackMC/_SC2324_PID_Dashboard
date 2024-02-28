let host = "";

function debounce(func, delay) {
    let timer;

    return function() {
        const args = arguments;
        const scope = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {func.apply(scope, args);}, delay);
    };
}

$(document).ready(() => {
    $("#PID").on("submit", function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        formData.entries().forEach((value, key) => { data[key] = value; });

        console.log(data);

        $.ajax({
            url: host,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: (data, textStatus, jqXHR) => {
                console.log("PID sent");
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error("Error: " + errorThrown);
            }
        });
    });

    host = sessionStorage.getItem("host_url") || "";
    $("#webserver").on("submit", function(e) {
        e.preventDefault();
    })
    $("#url").val(host);
    $("#url").on("keydown", debounce(function(e) {
        if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Tab") {
            host = $(this).val();
            sessionStorage.setItem("host_url", host);
        }
    }, 150));
});