const app = require('../server/app')
const request = require('supertest')
const User = require('../models/userModel')
const {
  userOne, 
  userOneId,
  setUpDataBase
} = require('./fixtures/db')

beforeEach(setUpDataBase)

test('should create user', async () => {
  await request(app)
      .post('/api/v1/users')
      .send({
        username: 'wazza',
        email: 'wazza@mail.com',
        password: 'blessedManWazza'
      }).expect(201)
})

test('should delete user after authorization', async () => {
  await request(app)
      .delete('/api/v1/users/account')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send()
      .expect(200)

      const user = await User.findById(userOneId)
      expect(user).toBeNull()
})

test('should login user with email and password', async () => {
  await request(app)
      .post('/api/v1/users/login')
      .send({
        email: userOne.email,
        password: userOne.password
      })
      .expect(200)
})

test('should login user with username and password', async () => {
  await request(app)
      .post('/api/v1/users/login')
      .send({
        username: userOne.username,
        password: userOne.password
      })
      .expect(200)
})

test('should logout user after authorization', async () => {
  await request(app)
      .post('/api/v1/users/logout')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send()
      .expect(200)
})

test('should get user profile after authorization', async () => {
  await request(app)
      .get('/api/v1/users/account')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send()
      .expect(200)
})

test('should update user profile', async () => {
  await request(app)
      .patch('/api/v1/users/account')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send({
        username: 'creativorgy'
      })
      .expect(200)
})

test('should upload profile picture after authorization', async () => {
  await request(app)
      .post('/api/v1/users/account/avatar')
      .set('Authorization', `Bearer ${userOne.token}`)
      .attach('picture', 'tests/fixtures/files/profile-pic.jpg')
      .expect(200)
})

test('should delete profile picture after authorization', async () => {
  await request(app)
      .delete('/api/v1/users/account/avatar')
      .set('Authorization', `Bearer ${userOne.token}`)
      .send()
      .expect(404)

      const user = await User.findById(userOneId)
      expect(user.profilePicture).toBeFalsy()
    })


