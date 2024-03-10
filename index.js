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

function change_websocket_host(host) {
    try {
        socket = io(host, {
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            reconnection: true,
            timeout: 10000
        });
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

function get_pid() {
    $.ajax({
        url: `http://${host}/pid`,
        type: "GET",
        success: (data, textStatus, jqXHR) => {
            console.log("PID got");
            const [Kp, Ki, Kd] = data.split(' ');
            console.log(Kp, Ki, Kd);
            $("#Kp").attr("value", Kp);
            $("#Ki").attr("value", Ki);
            $("#Kd").attr("value", Kd);
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(`Error: ${errorThrown}\n Status: ${textStatus}`);
            console.log(jqXHR)
        }
    });
}

$(document).ready(() => {
    set_height();

    $("#PID").on("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        console.log(data);

        $.ajax({
            url: `http://${host}/pid`,
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

        get_pid();
    });

    host = localStorage.getItem("host_url") || "";
    change_websocket_host(host);
    get_pid();

    $("#webserver").on("submit", function (e) {
        e.preventDefault();
    })
    $("#url").val(host);

    $("#url").on("keydown", debounce(function (e) {
        if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Tab") {
            host = $(this).val();
            get_pid();
            change_websocket_host(host);
            localStorage.setItem("host_url", host);
        }
    }, 150));
});