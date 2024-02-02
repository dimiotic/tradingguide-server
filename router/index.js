const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/referals/:code', userController.getMyReferals);
router.post('/withdraw', userController.createWithdraw);
router.get('/withdraw/', userController.getWithdraws);
router.get('/withdraw/:id', userController.getWithdraws);
router.put('/user-password/:id', userController.changePassword);
router.put('/user-code/:id', userController.changeRefCode);
router.post('/purchase', userController.createPurchase);
router.get('/checkref/:code', userController.checkCode);

module.exports = router;
