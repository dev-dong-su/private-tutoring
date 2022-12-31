const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// helper file to prepare responses.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/UserModel');
const apiResponse = require('../helpers/apiResponse');

/**
 * User registration.
 *
 * @param {string}      userName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [// Validate fields.
  body('userName')
    .isLength({ min: 2 })
    .trim()
    .withMessage('user name must be specified.')
    .isAlphanumeric()
    .withMessage('user name has non-alphanumeric characters.'), body('email')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .custom(value => UserModel.findOne({ email: value }).then(user => {
      if (user) {
        return Promise.reject(new Error('E-mail already in use'));
      }
    })), body('password').isLength({ min: 6 }).trim().withMessage('Password must be 6 characters or greater.'), // Sanitize fields.
  sanitizeBody('userName').escape(), sanitizeBody('email').escape(), sanitizeBody('password').escape(), // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      // hash input password
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        // Create User object with escaped and trimmed data
        const user = new UserModel({
          userName: req.body.userName, email: req.body.email, password: hash,
        });
        user.save((userErr) => {
          if (userErr) {
            return apiResponse.ErrorResponse(res, userErr);
          }
          const userData = {
            _id: user._id, userName: req.body.userName, email: user.email,
          };
          return apiResponse.successResponseWithData(res, 'Registration Success.', userData);
        });
      });

    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [body('email')
  .isLength({ min: 1 })
  .trim()
  .withMessage('Email must be specified.')
  .isEmail()
  .withMessage('Email must be a valid email address.'), body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'), sanitizeBody('email').escape(), sanitizeBody('password').escape(), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
    }
    UserModel.findOne({ email: req.body.email }).then(user => {
      if (user) {
        // Compare given password with db's hash.
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (same) {
            // Check account confirmation.
            if (user.status) {
              const userData = {
                _id: user._id, userName: req.body.userName, email: user.email,
              };
              // Prepare JWT token for authentication
              const jwtPayload = userData;
              const jwtData = {
                expiresIn: process.env.JWT_TIMEOUT_DURATION,
              };
              const secret = process.env.JWT_SECRET;
              // Generated JWT token with Payload and secret.
              userData.token = jwt.sign(jwtPayload, secret, jwtData);
              return apiResponse.successResponseWithData(res, 'Login Success.', userData);
            }
            return apiResponse.unauthorizedResponse(res, 'Account is not active. Please contact admin.');

          }
          return apiResponse.unauthorizedResponse(res, 'Email or Password wrong.');
        });
      } else {
        return apiResponse.unauthorizedResponse(res, 'Email or Password wrong.');
      }
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
}];
