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

test('should delete merchant after authorization', async () => {
  await request(app)
      .delete('/api/v1/merchants/account')
      .set('Authorization', `Bearer ${merchantOne.token}`)
      .send()
      .expect(200)

      const merchant = await Merchant.findById(merchantOneId)
      expect(merchant).toBeNull()
})

test('should login merchant with email and password', async () => {
  await request(app)
      .post('/api/v1/merchants/login')
      .send({
        email: merchantOne.email,
        password: merchantOne.password
      })
      .expect(200)
})

test('should login merchant with company and password', async () => {
  await request(app)
      .post('/api/v1/merchants/login')
      .send({
        company: merchantOne.company,
        password: merchantOne.password
      })
      .expect(200)
})

test('should logout merchant after authorization', async () => {
  await request(app)
      .post('/api/v1/merchants/logout')
      .set('Authorization', `Bearer ${merchantOne.token}`)
      .send()
      .expect(200)
})

test('should get merchant profile after authorization', async () => {
  await request(app)
      .get('/api/v1/merchants/account')
      .set('Authorization', `Bearer ${merchantOne.token}`)
      .send()
      .expect(200)
})

test('should update merchant profile', async () => {
  await request(app)
      .patch('/api/v1/merchants/account')
      .set('Authorization', `Bearer ${merchantOne.token}`)
      .send({
        company: 'XXX-videos'
      })
      .expect(200)
})