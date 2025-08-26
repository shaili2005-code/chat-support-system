const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.register = async (req, res, next) => {
try {
const { name, email, password, role } = req.body;
const hashed = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, password: hashed, role });
res.status(201).json({ success: true, user: { id: user._id, name, email, role } });
} catch (err) {
next(err);
}
};


exports.login = async (req, res, next) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user || !(await bcrypt.compare(password, user.password))) {
return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
} catch (err) {
next(err);
}
};