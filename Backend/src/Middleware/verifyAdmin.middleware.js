const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token Missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    if (decodedUser.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    req.user = decodedUser;
    // console.log("Verified Admin:", req.user);
    // res.status(200).json({ message: "Admin Verified" });
    next()
  });
};
