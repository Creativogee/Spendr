const app = require('../server/app')
const request = require('supertest')
const User = require('../models/userModel')
const {setUpDataBase} = require('./fixtures/db')

beforeEach(setUpDataBase)

test('should create user', async () => {
  await request(app)
      .post('/api/users')
      .send({
        username: 'wazza',
        email: 'wazza@mail.com',
        password: 'blessedManWazza'
      }).expect(201)
})
