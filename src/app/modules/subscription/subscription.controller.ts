// controllers/subscription/subscription.controller.ts

// import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { subscriptionService } from './subscription.service';

const createSubscription = catchAsync(async (req, res) => {
  const { patientId, packageId, autoRenew } = req.body;
  const result = await subscriptionService.createSubscription(patientId, packageId, autoRenew);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const getSubscriptionsByPatient = catchAsync(async (req, res) => {
  const { patientId } = req.params;
  const result = await subscriptionService.getSubscriptionsByPatient(patientId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionService.cancelSubscription(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription cancelled successfully',
    data: result,
  });
});

export const subscriptionController = {
  createSubscription,
  getSubscriptionsByPatient,
  cancelSubscription,
};
