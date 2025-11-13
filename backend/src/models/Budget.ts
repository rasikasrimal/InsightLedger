import mongoose, { Document, Schema } from 'mongoose';
import { BudgetPeriod } from '../types';

export interface IBudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudgetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    period: {
      type: String,
      required: true,
      enum: Object.values(BudgetPeriod)
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ userId: 1, categoryId: 1, period: 1 });

export default mongoose.model<IBudgetDocument>('Budget', budgetSchema);
