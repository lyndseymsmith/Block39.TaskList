import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '#db/client';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'superdupersecret';

router.post('/register', async (requestAnimationFrame, res) => {
    const { username, password } = requestAnimationFrame.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const userExists = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        const result = await db.query(
            `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`,
            [username, hashedPassword]
        );

        const user = result.rows[0];

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET);

        res.json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET);

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

export default router;
