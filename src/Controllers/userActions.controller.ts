import { Request, Response } from "express";
import Face from "../Models/face";
import {
  afterVerificationMiddlerwareInterface,
  userActionsInterface,
} from "../interfaces";
import { uploadPicture } from "../Services/Cloudflare.services";
import Votes from "../Models/Votes";
import { Op, Sequelize } from "sequelize";
import Comments from "../Models/Comment";

const userActionsController: userActionsInterface = {
    createPost: async (
        req: Request & afterVerificationMiddlerwareInterface,
        res: Response
    ) => {
        try {
            const { name_one, name_two, title } = req.body;

            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            if(!name_one || !name_two || !title){
                return res.status(400).json({error: 'Bad request.'});
            }

            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };

            const person1 = files?.["person1"]?.[0];
            const person2 = files?.["person2"]?.[0];

            if (!person1 || !person2) {
                return res
                    .status(400)
                    .json({ error: "Both image files are required." });
            }

            if (!name_one || !name_two) {
                return res.status(400).json({ error: "Both names are required." });
            }

            const userId = req.user.id;

            const bucket = "clarkuser";

            const safeKey = (file: Express.Multer.File) =>
                `${Date.now()}_${file.originalname}`.replace(/[^a-zA-Z0-9.]/g, "_");

            const person1_url = await uploadPicture(
                bucket,
                safeKey(person1),
                person1.buffer,
                person1.mimetype
            );
            const person2_url = await uploadPicture(
                bucket,
                safeKey(person2),
                person2.buffer,
                person2.mimetype
            );

            const post = await Face.create({
                name_one,
                name_two,
                image_url_one: person1_url,
                image_url_two: person2_url,
                userId,
                title
            });

            return res.status(201).json({
                message: "Post created successfully",
                post,
            });
        } catch (error) {
            console.error("Error creating post:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    vote: async (
        req: Request & afterVerificationMiddlerwareInterface,
        res: Response
    ) => {
        try {
            const { postId, votedFor } = req.body;

            const postExists = await Face.findOne({ where: { id: postId } });

            if (!postExists) {
                return res.status(404).json({ error: "Post not found." });
            }

            if (!postId || !votedFor) {
                return res
                    .status(400)
                    .json({ error: "postId and votedFor are required." });
            }

            await Votes.create({
                post_id: postId,
                vote: votedFor,
            });

            return res.status(200).json({
                message: "Vote registered successfully",
            });
        } catch (error) {
            console.error("Error voting:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    fetchPost: async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;

            if (!postId) {
                return res.status(400).json({ error: "postId is required." });
            }

            const post = await Face.findOne({ where: { id: postId } });

            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }

            const person1Votecount = await Votes.count({
                where: {
                    post_id: postId,
                    vote: "one",
                },
            });

            const person2Votecount = await Votes.count({
                where: {
                    post_id: postId,
                    vote: "two",
                },
            });

            return res.status(200).json({ post, person1Votecount, person2Votecount });
        } catch (error) {
            console.error("Error fetching post:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    fetchUserPosts: async (
        req: Request & afterVerificationMiddlerwareInterface,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            const userId = req.user.id;

            const posts = await Face.findAll({ where: { userId } });

            return res.status(200).json({ posts });
        } catch (error) {
            console.error("Error fetching user posts:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getUserFeed: async (req: Request, res: Response) => {
        try {
            const { viewedPosts } = req.body;

            const whereClause: any = {};
            if (Array.isArray(viewedPosts) && viewedPosts.length > 0) {
            whereClause.id = { [Op.notIn]: viewedPosts };
            }

            const posts = await Face.findAll({
            where: whereClause,
            order: Sequelize.literal(process.env.NODE_ENV === 'dev' ? 'RAND()' : 'RANDOM()' ),
            limit: 1,
            });

            const post = posts.length > 0 ? posts[0] : null;
            const person1Votecount = await Votes.count({
                where: {
                    post_id: post ? post.id : null,
                    vote: "one",
                },
            });

            const person2Votecount = await Votes.count({
                where: {
                    post_id: post ? post.id : null,
                    vote: "two",
                },
            });

            return res.status(200).json({ post, person1Votecount, person2Votecount });
        } catch (error) {
            console.error("Error fetching user feed:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    createComment: async (
        req: Request & afterVerificationMiddlerwareInterface,
        res: Response
    ) => {
        try {
            const { postId, comment } = req.body;

            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            if (!postId || !comment) {
                return res.status(400).json({ error: "postId and comment are required." });
            }

            const post = await Face.findOne({ where: { id: postId } });

            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }

            await Comments.create({
                postId,
                userId: req.user.id,
                userName: req.user.name,
                comment,
            });

            return res.status(201).json({
                message: "Comment created successfully",
                postId,
                comment,
            });
        } catch (error) {
            console.error("Error creating comment:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getComments: async (req: Request, res: Response) => {   
        try {
            const { postId } = req.params;
            console.log(postId);

            if (!postId) {
                return res.status(400).json({ error: "postId is required." });
            }

            const comments = await Comments.findAll({
                where: { postId },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ comments });
        } catch (error) {
            console.error("Error fetching comments:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};

export default userActionsController;
