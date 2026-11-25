const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");

// ========================================
// GENERATE UNIQUE WALLET ID
// ========================================
const generateWalletId = () => {
  return "SP-" + crypto.randomBytes(6).toString("hex").toUpperCase();
};

// ========================================
// GENERATE BLOCKCHAIN KEY PAIR
// ========================================
const generateWalletKeys = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "secp256k1",

    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },

    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKey,
    privateKey,
  };
};

// ========================================
// ENCRYPT PRIVATE KEY
// ========================================
const encryptPrivateKey = (privateKey) => {
  const encryptionKey = crypto
    .createHash("sha256")
    .update(process.env.WALLET_ENCRYPTION_KEY)
    .digest();

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    encryptionKey,
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");

  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

// ========================================
// DECRYPT PRIVATE KEY
// ========================================
const decryptPrivateKey = (encryptedPrivateKey) => {
  const encryptionKey = crypto
    .createHash("sha256")
    .update(process.env.WALLET_ENCRYPTION_KEY)
    .digest();

  const [ivHex, encrypted] = encryptedPrivateKey.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    iv
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
};

// ========================================
// REGISTER USER
// ========================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ========================================
    // GENERATE WALLET
    // ========================================

    const { publicKey, privateKey } = generateWalletKeys();

    // Encrypt private key before storing
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Generate wallet ID
    const walletId = generateWalletId();

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      walletId,
      publicKey,
      encryptedPrivateKey,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletId: user.walletId,
        publicKey: user.publicKey,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ========================================
// LOGIN USER
// ========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Response
    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletId: user.walletId,
        publicKey: user.publicKey,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
};