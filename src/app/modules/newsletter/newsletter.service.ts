import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { Newsletter } from "./newsletter.model";

interface IEmail {
  email: string;
}

const subscribe = async (emailObj: IEmail) => {
  const email = emailObj.email;
  const findEmail = await Newsletter.findOne({ email });
  if (findEmail) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already subscribed");
  }
  const res = await Newsletter.create({ email });
  return res;
};

export const NewsletterServices = {
  subscribe,
};
