const jwt = require('jsonwebtoken');

function unAuthorized(res, next) {
  const error = new Error('Un-Authorized');
  res.status(401);
  next(error);
}

function checkTokenSendUser(req, res, next) {
  const authHeader = req.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer', '').trim();
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          console.log(err);
        }
        req.user = user;
        next();
      });
    }
  } else {
    next();
  }
}

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    unAuthorized(res, next);
  }
}

function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    unAuthorized();
  }
}

module.exports = {
  checkTokenSendUser,
  isLoggedIn,
  isAdmin,
};
