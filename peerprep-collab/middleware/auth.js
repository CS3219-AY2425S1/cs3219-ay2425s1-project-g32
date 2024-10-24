import axios from "axios";

export const authenticateToken = async (token) => {
  try {
    // Call peerprep-users service to verify the token
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/auth/verify-token`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Attach user information to the request object
    return response.data.data;
    // Call the next middleware or route handler
  } catch (error) {
    console.log("[authenticateToken] error", error);
    return;
  }
};

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from 'Bearer {token}'

  const user = authenticateToken(token);
  if (!user) {
    return res.status(403).json({
      message: "Forbidden: Invalid token",
    });
  }
  req.user = user;
  next();
};
