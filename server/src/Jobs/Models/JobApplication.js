import { DataTypes } from 'sequelize';
import sequelize from '../../Config/db.js';
import User from '../../Auth/Models/User.js';
import Job from './Job.js';

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Job,
      key: 'id'
    }
  },
  doerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  proposedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
});

// Relationships
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(JobApplication, { foreignKey: 'doerId', as: 'applications' });
JobApplication.belongsTo(User, { foreignKey: 'doerId', as: 'doer' });

export default JobApplication;
