import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/sequelize";

class Face extends Model {
    public id!: number;
    public name_one!: string;
    public image_url_one!: string;
    public name_two!: string;
    public image_url_two!: string;
    public userId!: number;
    public title!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Face.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name_one: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_url_one: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name_two: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_url_two: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Make your pick'
        }
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "Faces",
    }
);

export default Face;
