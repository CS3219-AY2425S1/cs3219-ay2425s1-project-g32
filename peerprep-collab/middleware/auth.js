import axios from "axios";

const authenticateToken = async (token) => {
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

export default authenticateToken;
