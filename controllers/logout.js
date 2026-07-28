const logoutRouter = require("express").Router();

const handleLogout = (req, res) => {
  const tokenName = "access_token";
  const hasToken = req.cookies?.[tokenName];

  if (!hasToken) {
    return res.sendStatus(401);
  }

  res.clearCookie(tokenName, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  return res.sendStatus(204);
};

logoutRouter.get("/", handleLogout);
logoutRouter.post("/", handleLogout);

module.exports = logoutRouter;