const UserModel = require('../models/user-model');
const PurchaseModel = require('../models/purchase-model');
const WithdrawModel = require('../models/withdraw-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const tokenService = require('./token-service');
const mailService = require('./mail-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest('User with current email is already exists');
    }
    const hashPassword = await bcrypt.hash(password.toString(), 3);
    const activationLink = uuid.v4();
    const temporalCode = Math.random()
      .toString(36)
      .substring(2, 7 + 2);
    const referalCode = (await UserModel.findOne({ referalCode: temporalCode }))
      ? Math.random()
          .toString(36)
          .substring(2, 7 + 2)
      : temporalCode;
    const user = await UserModel.create({
      email,
      password: hashPassword,
      referalCode,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Incorrect activation link');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('User do not found');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect password');
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnathorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnathorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }

  async getReferals(refId) {
    const referals = await PurchaseModel.find({ refId });
    return referals;
  }

  async createWithdraw(email, card, cash, refreshToken) {
    const date = Date.now();
    const userData = tokenService.validateRefreshToken(refreshToken);
    const user = await UserModel.findById(userData.id);

    if (user.balance < cash) {
      throw ApiError.BadRequest('Not enought money on balance');
    }
    const balanceLeft = user.balance - cash;
    const withdrawInfo = await WithdrawModel.create({
      email,
      card,
      date,
      cash,
      user: user.id,
      balanceLeft,
    });
    await UserModel.findByIdAndUpdate(user.id, { balance: balanceLeft });
    return { withdrawInfo };
  }
  async createPurchase(email, date, paypalOrderId, refId, cash, item) {
    const purchaseInfo = await PurchaseModel.create({
      email,
      paypalOrderId,
      date,
      cash,
      refId,
      item,
    });
    if (refId) {
      const user = await UserModel.findById(refId);

      const newBalance = user.balance + cash / 2;
      await UserModel.findByIdAndUpdate(user.id, { balance: newBalance });
    }
    await mailService.sendInfoToOrder(email, item);
    return { purchaseInfo };
  }
  async changePassword(userId, oldPassword, newPassword) {
    const newHashPassword = await bcrypt.hash(newPassword.toString(), 3);
    const user = await UserModel.findById(userId);
    const isPassEquals = await bcrypt.compare(oldPassword, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect password');
    }
    const userData = await UserModel.findByIdAndUpdate(userId, {
      password: newHashPassword,
    });
    return userData;
  }
  async changeRefCode(userId, referalCode) {
    const candidate = await UserModel.findOne({ referalCode });
    if (candidate) {
      throw ApiError.BadRequest('Current referal code is already exists');
    }
    const userData = await UserModel.findByIdAndUpdate(userId, {
      referalCode,
    });

    return userData;
  }
  async getWithdraws(userId) {
    let withdraws;
    if (userId) {
      withdraws = await WithdrawModel.find({ user: userId });
    } else {
      withdraws = await WithdrawModel.find();
    }
    return withdraws;
  }
  async checkCode(referalCode) {
    const candidate = await UserModel.findOne({ referalCode });

    if (!candidate) {
      throw ApiError.BadRequest('Incorrect referal code');
    }

    return candidate._id;
  }
  async setWithdraw(withdrawId, status) {
    const withdraw = await WithdrawModel.findByIdAndUpdate(withdrawId, {
      status,
    });

    if (!withdraw) {
      throw ApiError.BadRequest('Incorrect withdraw id');
    }

    return withdraw;
  }
}

module.exports = new UserService();
