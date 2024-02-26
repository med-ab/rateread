import { model, Schema, ObjectId } from 'mongoose'
export var hash = password => createHash('sha256').update(password).digest('hex')
export var user = model('user', new Schema({
  id: { type: String, unique: true, required: true },
  pass: { type: String, required: true },
}).pre('save', function (next) {
  this.password = hash(this.password)
  next()
}))
export var book = model('book', new Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  followers: [{ type: ObjectId, ref: 'user' }],
  recommendations: [{
    user: { type: ObjectId, ref: 'user' },
    rating: { type: Number, min: 1, max: 10, required: true },
    text: { type: String },
    likes: { type: Number },
    comments: [{
      user: { type: ObjectId, ref: 'user' },
      text: { type: String, required: true },
      likes: { type: Number },
    }],
  }],
  rating: { type: Number, min: 1, max: 10 },
}).pre('save', function (next) {
  this.rating = this.recommendations.reduce((a, c) => a + c.rating, 0) / this.recommendations.length || undefined
  next()
}))