module.exports = class UserDto {
  email;
  id;
  isActivated;
  referalCode;
  isAdmin;
  balance;
  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.referalCode = model.referalCode;
    this.isAdmin = model.isAdmin;
    this.balance = model.balance;
  }
};
