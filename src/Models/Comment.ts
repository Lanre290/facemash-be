import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/sequelize";

class Comments extends Model {
    public id!: number;
    public postId!: string;
    public userId!: string;
    public userName!: string;
    public comment!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}


Comments.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        postId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "Comments",
    }
);

export default Comments;
