import express from 'express'
import { readFile } from 'fs/promises'
import { book, user, hash } from './db.js'
var { log, error } = console
var { env } = process
var { port, href } = new URL('http://[::1]:' + (env.port || 1111))
var header = title => `<link rel='icon'
href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text x='50%' y='50%' font-size='25' text-anchor='middle' alignment-baseline='middle'>RR</text></svg>">
<link rel="stylesheet" href="user_interface.css">
<title>${title}</title>
<body>
`
express()
  .all(express.json())
  .all('/', (req, res) => readFile('main_page.html', 'utf8').then(o => res.send(header('RateRead') + o)))
  .all('/user_interface.css', (req, res) => readFile('user_interface.css', 'utf8').then(o => res.send(o)))
  .all('/register', ({ body: { id, pass } }, res, next) =>
    user.findOne({ id }).exec().then(o => o ? next([400, 'id exists']) : new user({ id, pass }).save().then(
      o1 => res.status(201).send('registered successfully! send a json of your {"id":"like this", "password": "like this"} to /login and get your session token'),
      e => next([500, 'could not register user'])
    ), e => next([400, 'could not get user details']))
  )
  .all('/login', ({ body: { id, pass } }, res, next) =>
    user.findOne({ id }).exec().then(user =>
      user?.pass != hash(pass) ? next([401, 'incorrect credentials']) : jwt.sign({ _id: user.toJSON()._id, id }, env.secret_key, { expiresIn: 1000 * 60 * 60 + '' }, (e, t) => e ? next([500, 'could not issue access token']) : res.status(200).cookie('token', t, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 }).send()),
      e => next([400, 'could not get user details']))
  )
  .all('/book', (req, res) => fetch('https://openlibrary.org/search.json?' + new URLSearchParams(req.query)).then(o=>o.json()).then(async o => res.send(o.docs)))
  .all((err, req, res, next) => error(err[1]))
  .listen(port, () => log(href))
