const { v2: cloudinary, uploader } = require('cloudinary')

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_SECRET ?? '',
})

const cloudinaryUploader = uploader

module.exports = {
  cloudinaryConfig,
  cloudinaryUploader,
}
