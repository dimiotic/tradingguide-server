const { validationResult } = require('express-validator');
const userService = require('../service/user-service');
const ApiError = require('../exceptions/api-error');

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Password is too short', errors.array())
        );
      }
      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async createPurchase(req, res, next) {
    try {
      const { email, date, paypalOrderId, refId, cash, item } = req.body;
      const purchaseData = await userService.createPurchase(
        email,
        date,
        paypalOrderId,
        refId,
        cash,
        item
      );

      return res.json(purchaseData);
    } catch (e) {
      next(e);
    }
  }
  async checkCode(req, res, next) {
    try {
      const referalCode = req.params.code;
      console.log(req.params.code);
      const refId = await userService.checkCode(referalCode);
      return res.json(refId);
    } catch (e) {
      next(e);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }
  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
  async getMyReferals(req, res, next) {
    const id = req.params.code;
    try {
      const referals = await userService.getReferals(id);
      res.json(referals);
    } catch (e) {
      next(e);
    }
  }
  async createWithdraw(req, res, next) {
    const { refreshToken } = req.cookies;
    try {
      const { email, card, cash } = req.body;
      const withdrawData = await userService.createWithdraw(
        email,
        card,
        cash,
        refreshToken
      );

      return res.json(withdrawData);
    } catch (e) {
      next(e);
    }
  }
  async changePassword(req, res, next) {
    const userId = req.params.id;
    try {
      const { oldPassword, newPassword } = req.body;
      const userData = await userService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async changeRefCode(req, res, next) {
    const userId = req.params.id;
    try {
      const { referalCode } = req.body;
      const userData = await userService.changeRefCode(userId, referalCode);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async getWithdraws(req, res, next) {
    const userId = req.params.id;
    try {
      const withdraws = await userService.getWithdraws(userId ? userId : '');
      res.json(withdraws);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
