const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني وكلمة المرور مطلوبة'
            });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني مستخدم بالفعل'
            });
        }

        if (username) {
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'اسم المستخدم مستخدم بالفعل'
                });
            }
        }

        const result = await User.create({ username, email, password, full_name, phone });
        const newUser = await User.findById(result.id);

        res.status(201).json({
            success: true,
            data: newUser,
            message: 'تم التسجيل بنجاح'
        });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني وكلمة المرور مطلوبة'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        if (!User.verifyPassword(user, password)) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        await User.updateLastLogin(user.id);

        const userData = {
            id: user.id,
            username: user.username || user.email,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role || 'user',
            created_at: user.created_at
        };

        res.json({
            success: true,
            data: userData,
            message: 'تم تسجيل الدخول بنجاح'
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, full_name, phone, password, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (full_name) updateData.full_name = full_name;
        if (phone) updateData.phone = phone;
        if (password) updateData.password = password;
        if (role) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لا توجد بيانات للتحديث'
            });
        }

        await User.update(id, updateData);
        const updated = await User.findById(id);
        res.json({ success: true, data: updated, message: 'تم تحديث المستخدم' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        await User.delete(id);
        res.json({ success: true, message: 'تم حذف المستخدم' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
