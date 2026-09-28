import { DataTypes } from 'sequelize';
import sequelize from '../../Config/db.js';
import User from '../../Auth/Models/User.js';

const DoerProfile = sequelize.define('DoerProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    }
  },
  profilePhoto: {
    type: DataTypes.STRING,
  },
  primarySkill: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  additionalSkills: {
    type: DataTypes.JSON, // Using JSON for arrays in MySQL
    defaultValue: [],
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  biography: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  servicesOffered: {
    type: DataTypes.JSON, // Stores array of objects { name, startingPrice }
    defaultValue: [],
  },
  availabilitySchedule: {
    type: DataTypes.STRING,
  },
  serviceRadius: {
    type: DataTypes.INTEGER,
  },
  portfolio: {
    type: DataTypes.JSON, // Array of image URLs
    defaultValue: [],
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalJobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

// Relationships
User.hasOne(DoerProfile, { foreignKey: 'userId', as: 'doerProfile' });
DoerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default DoerProfile;
