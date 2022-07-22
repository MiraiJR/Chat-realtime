toastr.options = {
    "closeButton": true,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "3000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

var socket = io(`${window.location.origin}`)

socket.on('notification', (data) => {
    if(data.state == 'connect'){
        toastr.success(`${data.nickname} đã tham gia room chat`)
    }else {
        toastr.warning(`${data.nickname} đã thoát khỏi room chat`)
    }
})

socket.on('server-send-data', (data) => {
    data = data.filter(ele => ele.id != socket.id)

    if(data.length == 0) {
        $('#app-content-participants').html('<div class="no-participant">Không có người online</div>')   
    } else {
        $('#app-content-participants').html("")
        var stringHTML = ""
        for(let i = 0; i < data.length; i++)
        {
            stringHTML += `<div class="participant">${data[i].nickname} Đang online </div>`
        }
        $('#app-content-participants').html(stringHTML)
    }

})

socket.on('server-send-msg-to-everyone', (data) => {
    
    $('#app-room-chat-content').append(`<div class="col-12">${data.timeChat}</div>
                                        <div class="participant-chat-nickname-father">
                                            <div class="col-6"></div>
                                            <div class="participant-chat-nickname">
                                                ${data.nickname}
                                            </div>
                                        </div>
                                        <div class="participant-chat-content-father">
                                            <div class="col-4"></div>
                                            <div class="participant-chat-content">
                                                ${data.contentChat}
                                            </div>
                                        </div>`)

    var listMsg = $('.participant-chat-content:last-child')
    listMsg[listMsg.length - 1].scrollIntoView()
})

$(document).ready(() => {
    $('#app-login').show()
    $('#app-chat').hide()
    $('#join-chat').click(() => {
        const nickname = $('#nickname').val()
        if(nickname == "")
        {
            toastr.error('Xin vui lòng nhập nickname')
        }else {
            socket.emit('client-send-nickname', nickname)
            $('#app-login').hide(500)
            $('#app-chat').show(1000)
            $('#welcome-participant').html(`Chào ${nickname} nha (^_^)/`)

            $('#content-msg').keyup(function(e){
                if(e.keyCode == 13)
                {
                    $(this).attr("disabled", "disabled");

                    sendMsgToServer(socket, nickname)
                    
                    $(this).removeAttr("disabled");

                    $(this).focus()
                }
            });

            $('#send-msg').click(() => {
                sendMsgToServer(socket, nickname)
                $("#content-msg").focus()
            })
        }

        // $('#content-msg').focusin(() => {
        //     socket.emit('client-send-participant-is-typing', true)
        // })
        // $('#content-msg').focusout(() => {
        //     socket.emit('client-send-participant-is-typing', false)
        // })
        
    })
})

function sendMsgToServer(socket, nickname) {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes()
    var contentmsg = $('#content-msg').val()
    if(isURL(contentmsg)) {
        contentmsg = `<a href="${contentmsg}">${contentmsg}</a>`
    }
    console.log(contentmsg)
    socket.emit('client-send-msg', msg = {
        content: contentmsg,
        time: time
    })
    $('#content-msg').val("")
    $('#app-room-chat-content').append(`<div class="col-12 time-main">${time}</div>
                                        <div class="participant-chat-nickname-father-main">
                                            <div class="row">
                                                <div class="col-6"></div>
                                                <div class="participant-chat-nickname participant-chat-nickname-main">
                                                ${nickname}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="participant-chat-content-father-main">
                                            <div class="col-4"></div>
                                            <div class="participant-chat-content participant-chat-content-main">
                                                ${contentmsg}
                                            </div>
                                        </div>`)
        //trượt tới tin nhắn mới nhất
        var listMsg = $('.participant-chat-content:last-child')
        listMsg[listMsg.length - 1].scrollIntoView()
}

function isURL(str) {
    var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }