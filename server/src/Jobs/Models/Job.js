import { DataTypes } from 'sequelize';
import sequelize from '../../Config/db.js';
import User from '../../Auth/Models/User.js';

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'open',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  assignedDoerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
});

// Setup relationships
User.hasMany(Job, { foreignKey: 'customerId', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Job, { foreignKey: 'assignedDoerId', as: 'assignedJobs' });
Job.belongsTo(User, { foreignKey: 'assignedDoerId', as: 'assignedDoer' });

export default Job;
