const app = require('../server/app')
const request = require('supertest')
const Merchant = require('../models/merchantModel')
const {
  merchantOne, 
  merchantOneId,
  setUpDataBase
} = require('./fixtures/db')

beforeEach(setUpDataBase)

test('should create merchant', async () => {
  await request(app)
      .post('/api/v1/merchants')
      .send({
        company: 'Pornhub',
        email: 'pornhub@mail.com',
        password: 'fuckShit789'
      }).expect(201)
})
