import jwt, {JwtPayload} from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

interface TokenPayload extends JwtPayload {
    userId: string; // Define the structure of your token payload
    role: string;
}

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== decoded.role) {
            const newToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '10d' }
            );

            const options = {
                expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            };

            return res.status(403).cookie("token", newToken, options).json({ message: 'Please try once again.' });
        }

        // Attach user to req
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware to restrict access based on roles
const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied. You're not allowed to perform this operation." });
        }

        next();
    };
};

export  { authenticate, authorize};
