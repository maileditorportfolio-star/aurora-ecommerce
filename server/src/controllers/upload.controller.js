const ApiError = require('../utils/ApiError');

/** POST /api/admin/uploads/product-image — stores an uploaded product photo. */
const productImage = (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose an image to upload');

  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, data: { url } });
};

module.exports = { productImage };
