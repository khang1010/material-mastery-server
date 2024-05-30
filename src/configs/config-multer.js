const multer = require('multer')
const DatauriParser = require('datauri/parser.js')
const path = require('path')

const fileSize = 2 * 1024 * 1024
const files = 1
const storage = multer.memoryStorage()
const multerUploadSingleImage = multer({
  storage,
  limits: { fileSize, files },
}).single('product_image')
const dUri = new DatauriParser()
const decodeBase64ForMulter = (originalname, buffer) => {
  return dUri.format(path.extname(originalname).toString(), buffer)
}

module.exports = { multerUploadSingleImage, decodeBase64ForMulter }
