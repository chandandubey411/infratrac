const User = require('../Models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;   // 👈 add only this

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",                               // 👈 default remains user
      department: role === "worker" ? department : ""     // 👈 worker support
    });

    await user.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { 
      userId: user._id, 
      role: user.role,
      department: user.department          // 👈 added only this
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department        // 👈 added only this
      },
      message: "sign in successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
