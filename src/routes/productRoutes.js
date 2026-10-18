const express = require('express');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All product endpoints require authentication (LO3).
// /api/health, /api/auth/register and /api/auth/login stay public.
router.route('/').get(protect, getProducts);

router.route('/:id').get(protect, getProductById);

router.route('/').post(protect, createProduct);

router.route('/:id').put(protect, updateProduct);

router.route('/:id').delete(protect, deleteProduct);

module.exports = router;
