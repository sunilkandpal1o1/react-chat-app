import jwt from "jsonwebtoken";

const jwtKey = "kdfjaskfj";

const auth = async (req, res, next) => {
  // console.log("res ", req.headers);
  try {
    const token = req.headers.authorization.split("Bearer")[1];
    // console.log(req.headers.authorization)
    if(token) {
    // console.log("token", token);

      const verify = await jwt.verify(token, jwtKey);
      // console.log("verify", verify);
      if (verify) {
        const user = await jwt.decode(token);
        req.user = user;

        next();
      } else {
        res.json({ status: 1, msg: "Invalid token provided" });
      }
    } else {
      res.json({ status: 1, msg: "Token not provided" });
    }
  } catch (err) {
    console.log("catch error");
    console.log("error", err);
    res.status(500).json({ status: 1, msg: err.msg });
  }
};
export default auth;
