import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense']
    },
    icon: {
      type: String,
      default: '💰'
    },
    color: {
      type: String,
      default: '#4CAF50'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<ICategoryDocument>('Category', categorySchema);
