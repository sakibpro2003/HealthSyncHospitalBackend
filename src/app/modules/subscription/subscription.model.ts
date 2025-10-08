// models/subscription.model.ts

import mongoose, { Schema, model, Document } from 'mongoose';

interface ISubscription extends Document {
  patient: mongoose.Types.ObjectId;
  package: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

const SubscriptionSchema = new Schema<ISubscription>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: Schema.Types.ObjectId,
    ref: 'HealthPackage',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
});

export const Subscription = model<ISubscription>('Subscription', SubscriptionSchema);
