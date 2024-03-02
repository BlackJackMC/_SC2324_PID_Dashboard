
function debounce(func, delay) {
    let timer;
    
    return function() {
        const args = arguments;
        const scope = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {func.apply(scope, args);}, delay);
    };
}

let host = "";
let socket;

const serial_message = $("#message");



$(document).ready(() => {
    $("#PID").on("submit", function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        console.log(data);

        $.ajax({
            url: host + "/pid",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: (data, textStatus, jqXHR) => {
                console.log("PID sent");
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error(`Error: ${errorThrown}\n Status: ${textStatus}`);
            }
        });
    });

    host = sessionStorage.getItem("host_url") || "";
    socket = io(host);

    $("#webserver").on("submit", function(e) {
        e.preventDefault();
    })
    $("#url").val(host);

    $("#url").on("keydown", debounce(function(e) {
        if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Tab") {
            host = $(this).val();
            socket = io(host);
            sessionStorage.setItem("host_url", host);
        }
    }, 150));

    socket.on("serial", (message) => {
        serial_message.append(`<p>[Serial]: ${message}</p>`)
    });
});