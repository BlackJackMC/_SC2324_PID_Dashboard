
function debounce(func, delay) {
    let timer;

    return function () {
        const args = arguments;
        const scope = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { func.apply(scope, args); }, delay);
    };
}

let host = "";
let socket;

const serial_message = $("#message");
const time_formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
});

function change_host(host) {
    try {
        socket = io(host);
    } catch (e) {
        console.error(`Host not found: ${host}`);
        return;
    }

    socket.on("serial", async (message) => {
        await serial_message.append(`<p>${message}</p>`)
    });
}

function set_height() {
    const height = $("#sidebar").height();
    $("#serial_monitor").css("max-height", height);
}

$(document).ready(() => {
    set_height();

    $("#PID").on("submit", function (e) {
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

    host = localStorage.getItem("host_url") || "";
    change_host(host);

    $("#webserver").on("submit", function (e) {
        e.preventDefault();
    })
    $("#url").val(host);

    $("#url").on("keydown", debounce(function (e) {
        if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Tab") {
            host = $(this).val();
            change_host(host);
            localStorage.setItem("host_url", host);
        }
    }, 150));
});