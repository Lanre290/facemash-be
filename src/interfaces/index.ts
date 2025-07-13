import { Request, Response } from "express";

export interface afterVerificationMiddlerwareInterface {
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

type UserActionFn = (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;

export interface userActionsInterface {
  createPost: UserActionFn;
  vote: UserActionFn;
  fetchPost: UserActionFn;
  fetchUserPosts: UserActionFn;
  getUserFeed: UserActionFn;
}