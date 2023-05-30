const router = require('express').Router()
const users = require('../data/users.js')
const bcrypt = require('bcryptjs')
const xss = require('xss')

router.get('/login', async (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    } else {
        res.render('extras/login', {title: 'Log In'})
    }
})

router.post('/login', async (req, res) => {
    const title = 'Log In'
    let username = xss(req.body.username)
    let password = xss(req.body.password)
    let errors = []
    if (typeof username !== 'string' || username.trim().length < 4 || username.match('[^A-Za-z0-9]+')) {
        errors.push('Username must be at least 4 characters long and can only contain letters and numbers.')
    }
    if (typeof password !== 'string' || password.trim().length < 8 || password.match('[ ]+')) {
        errors.push('Password must be at least 8 characters long and cannot contain spaces.')
    }
    if (errors.length > 0) {
        res.status(400).render('extras/login', {errors, title})
        return
    }
    username = username.toLowerCase()
    const user = await users.getByUsername(username)
    errors = ['Either username or password is incorrect.']
    if (!user) {
        res.status(400).render('extras/login', {errors, title})
        return
    }
    const correctPassword = await bcrypt.compare(password, user.password)
    if (!correctPassword) {
        res.status(400).render('extras/login', {errors, title})
        return
    }
    req.session.user = username
    res.redirect('/')
})

router.get('/signup', async (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    } else {
        res.render('extras/signup', {title: 'Sign Up', errors: []})
    }
})

router.post('/signup', async (req, res) => {
    const title = 'Sign Up'
    let firstName = xss(req.body.firstName)
    let lastName = xss(req.body.lastName)
    let age = xss(req.body.age)
    let email = xss(req.body.email)
    let username = xss(req.body.username)
    username = username.toLowerCase()
    let password = xss(req.body.password)
    let passwordCopy = xss(req.body.passwordCopy)
    let errors = []
    if (typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.match('[^A-Za-z]+')) {
        errors.push('First name can only contain letters.')
    }
    if (typeof lastName !== 'string' || lastName.trim().length === 0 || lastName.match('[^A-Za-z]+')) {
        errors.push('Last name can only contain letters.')
    }
    age = parseInt(age)
    if (typeof age !== 'number' || age < 18) {
        errors.push('User must be at least 18 years old.')
    }
    if (!users.validEmail(email)) {
        errors.push('Email is not valid.')
    }
    if (typeof username !== 'string' || username.trim().length < 4 || username.match('[^A-Za-z0-9]+')) {
        errors.push('Username must be at least 4 characters long and can only contain alphanumeric characters.')
    }
    if (typeof password !== 'string' || password.trim().length < 8 || password.match('[ ]+')) {
        errors.push('Password must be at least 8 characters long and cannot contain any spaces.')
    }
    if (password !== passwordCopy) {
        errors.push('The passwords do not match.')
    }
    if (errors.length > 0) {
        res.status(400).render('extras/signup', {
            errors,
            title,
            firstName,
            lastName,
            email,
            age,
            username
        })
        return
    }
    let user = await users.getByUsername(username)
    if (user) {
        errors.push('Provided username is unavailable.')
    }
    user = await users.getByEmail(email)
    if (user) {
        errors.push('Provided email is unavailable.')
    }
    if (errors.length > 0) {
        res.status(400).render('extras/signup', {
            errors,
            title,
            firstName,
            lastName,
            email,
            age,
            username
        })
        return
    }
    try {
        await users.create(firstName, lastName, email, age, username, password)
    } catch (e) {
        console.log(e);
        res.status(500).render('extras/signup', {
            errors: ['Internal Server Error'],
            title,
            firstName,
            lastName,
            email,
            age,
            username
        })    
        return
    }
    res.redirect('/users/login')
})

router.get('/logout', async (req, res) => {
    if (req.session.user) {
        req.session.destroy()
    }
    res.redirect('/')
})

module.exports = router