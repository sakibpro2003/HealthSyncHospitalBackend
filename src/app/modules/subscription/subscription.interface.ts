// interfaces/subscription.interface.ts

import { Types } from 'mongoose';

export interface ISubscription {
  patient: Types.ObjectId;            // User ID
  package: Types.ObjectId;            // HealthPackage ID
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}
