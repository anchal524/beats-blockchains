(function($) {
    function validEmail(email) {
        // same helper function in data/users.js
        if (typeof email !== 'string') {
            return false
        }
        const [username, website] = email.split('@')
        if (!username || !website) {
            return false
        }
        const [domain, tld] = website.split('.')
        if (!domain || !tld) {
            return false
        }
        if (username.length === 0 || username.match('[^A-Za-z0-9\.]+')) {
            return false
        }
        if (domain.length === 0 || domain.match('[^A-Za-z0-9\-]+')) {
            return false
        }
        if (tld.length === 0 || tld.match('[^A-Za-z0-9\-]+')) {
            return false
        }
        return true  
    }

    $('#signup-form').submit(function(event) {
        var firstname = $('#signup-firstname').val(),
            lastname = $('#signup-lastname').val(),
            email = $('#signup-email').val(),
            age = $('#signup-age').val(),
            username = $('#signup-username').val(),
            password = $('#signup-password').val(),
            password_copy = $('#signup-password-copy').val(),
            signup_errors = $('#signup-errors'),
            signup_error_list = $('#signup-error-list'),
            errors = []
        signup_errors.hide()
        signup_error_list.empty()
        if (firstname.match('[^A-Za-z]+')) {
            errors.push('First name should only contain letters.')
        }
        if (lastname.match('[^A-Za-z]+')) {
            errors.push('Last name should only contain letters.')
        }
        if (!validEmail(email)) {
            errors.push('Provided email is invalid.')
        }
        if (age < 18) {
            errors.push('You must be at least 18 years old to sign up.')
        }
        if (username.length < 4 || username.match('[^A-Za-z0-9]+')) {
            errors.push('Username must be at least 4 characters long and can only contain letters and numbers.')
        }
        if (password.length < 8 || password.match('[ ]+')) {
            errors.push('Password must be at least 8 characters long and cannot contain spaces.')
        }
        if (password !== password_copy) {
            errors.push('The two passwords do no match.')
        }
        if (errors.length > 0) {
            event.preventDefault()
            for (const error of errors) {
                signup_error_list.append(`<li>${error}</li>`)
            }
            signup_errors.show()
            return
        }
    })
})(window.jQuery)