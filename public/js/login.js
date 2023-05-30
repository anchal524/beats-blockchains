(function($) {
    var login_form = $('#login-form'),
        login_username = $('#login-username'),
        login_password = $('#login-password'),
        login_errors = $('#login-errors'),
        login_error_list = $('#login-error-list')

    login_form.submit(function(event) {
        login_errors.hide()
        login_error_list.empty()
        var username = login_username.val(),
            password = login_password.val(),
            errors = []
        if (username.length < 4 || username.match('[^A-Za-z0-9]+')) {
            errors.push('Username must be at least 4 characters long and can only contain letters and numbers.')
        }
        if (password.length < 8 || password.match('[ ]+')) {
            errors.push('Password must be at least 8 characters long and cannot contain spaces.')
        }
        if (errors.length > 0) {
            event.preventDefault()
            for (const error of errors) {
                login_error_list.append(`<li>${error}</li>`)
            }
            login_errors.show()
            return
        }
    })
})(window.jQuery)