import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/sequelize";

class Votes extends Model {
  public id!: number;
  public post_id!: string;
  public vote!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Votes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vote: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "Votes",
  }
);

export default Votes;
