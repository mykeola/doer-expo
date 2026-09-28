import { DataTypes } from 'sequelize';
import sequelize from '../../Config/db.js';
import User from '../../Auth/Models/User.js';
import Job from './Job.js';

const Review = sequelize.define('Review', {
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
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Relationships
Job.hasOne(Review, { foreignKey: 'jobId', as: 'review' });
Review.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(Review, { foreignKey: 'customerId', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Review, { foreignKey: 'doerId', as: 'reviewsReceived' });
Review.belongsTo(User, { foreignKey: 'doerId', as: 'doer' });

export default Review;
