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
    $('#app-room-chat-content').append(`<div class="row">
                                            <div class="col-12">${data.timeChat}</div>
                                            <div class="participant-chat-nickname col-2">
                                                ${data.nickname}
                                            </div>
                                            <div class="col-10"></div>
                                            <div class="participant-chat-content col-8">
                                                ${data.contentChat}
                                            </div>
                                        </div>`)
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
            $('#send-msg').click(() => {
                var dt = new Date();
                var time = dt.getHours() + ":" + dt.getMinutes()
                const contentmsg = $('#content-msg').val()
                socket.emit('client-send-msg', msg = {
                    content: contentmsg,
                    time: time
                })
                $('#content-msg').val("")
                $('#app-room-chat-content').append(`<div class="row">
                                                <div class="col-12 time-main">${time}</div>
                                                <div class="col-10"></div>
                                                <div class="participant-chat-nickname participant-chat-nickname-main col-2">
                                                    ${nickname}
                                                </div>
                                                <div class="col-4"></div>
                                                <div class="participant-chat-content participant-chat-content-main col-8">
                                                    ${contentmsg}
                                                </div>
                                            </div>`)
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
