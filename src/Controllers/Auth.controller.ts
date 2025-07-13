import { Request, Response } from "express";
import User from "../Models/User";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const AuthController = {
    signup: async (req: Request, res: Response) => {
        try {
            if(!req.body){
                return res.status(400).json({error: 'Bad request.'});
            }

            const { name, email, password } = req.body;

            if(!name || !email || !password) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ error: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS as unknown as string) || 10);

            const newUser = await User.create({ 
                name, 
                email, 
                password: hashedPassword 
            }).then(user => {
                const token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: "90d",
                });
                return res.status(201).json({
                    message: "User created successfully",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        token
                    }
                });
            })
            .catch(error => {
                console.error("Error creating user:", error);
                return res.status(500).json({ error: "Error creating user" });
            });
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal server error" });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            if(!req.body){
                return res.status(400).json({error: 'Bad request.'});
            }
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid password" });
            }

            const token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                expiresIn: "90d",
            });

            return res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token
                }
            });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
}

export default AuthController;