// This File stores all server action, server type validation
"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";
import prisma from "./lib/db";
import { type CategoryTypes } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

// Type is same as Interface
export type State = {
  status: "error" | "success" | undefined;
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
};

// Zod Schema Here
const productSchema = z.object({
  name: z.string().min(3, { message: "min 5 character" }),
  category: z.string().min(1, { message: "Category is required" }),
  price: z.number().min(1, { message: "Price has to be bigger than 1" }),
  smallDescription: z
    .string()
    .min(10, { message: "Please include a small summary" }),
  description: z.string().min(10, { message: "Description required" }),
  images: z.array(z.string(), { message: "Images are required" }),
  productFile: z
    .string()
    .min(1, { message: "Please upload a zip file of product" }),
});

const userSettingsSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "min 3 character" })
    .or(z.literal(""))
    .optional(),
  lastName: z
    .string()
    .min(3, { message: "min 3 character" })
    .or(z.literal(""))
    .optional(),
});

// CREATE PRODUCT FOR SELLING
export async function SellProduct(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    throw new Error("Something went wrong");
  }
  const validateFields = productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    smallDescription: formData.get("smallDescription"),
    description: formData.get("description"),
    images: JSON.parse(formData.get("images") as string),
    productFile: formData.get("productFile"),
  });
  // If validation not successful
  if (!validateFields.success) {
    const state: State = {
      status: "error",
      errors: validateFields.error.flatten().fieldErrors,
      message: "oops, there is a mistake with your input",
    };
    return state;
  }
  const data = await prisma.product.create({
    data: {
      name: validateFields.data.name,
      category: validateFields.data.category as CategoryTypes,
      smallDescription: validateFields.data.smallDescription,
      price: validateFields.data.price,
      images: validateFields.data.images,
      productFile: validateFields.data.productFile,
      userId: user.id,
      description: JSON.parse(validateFields.data.description),
    },
  });
  return redirect(`/product/${data.id}`);
}

// UPDATE USER SETTINGS
export async function UpdateUserSettings(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    throw new Error("Not authenticated, pls sign in!");
  }

  const validateFields = userSettingsSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (!validateFields.success) {
    const state: State = {
      status: "error",
      errors: validateFields.error.flatten().fieldErrors,
      message: "invalid firstname or lastname",
    };
    return state;
  }
  const data = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName: validateFields.data.firstName,
      lastName: validateFields.data.lastName,
    },
  });
  const state: State = {
    status: "success",
    message: "Your Settings have been updated",
  };
  return state;
}

// BUY PRODUCT, fetch data from prisma, invoke stripe.checkout.session.create,
export async function BuyProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const data = await prisma.product.findUnique({
    where: {
      id: id,
    },
    select: {
      name: true,
      smallDescription: true,
      price: true,
      images: true,
      User: {
        select: {
          connectedAccountId: true,
        },
      },
    },
  });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "sgd",
          unit_amount: (data?.price as number) * 100,
          product_data: {
            name: data?.name as string,
            description: data?.smallDescription,
            images: data?.images,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: (data?.price as number) * 10,
      transfer_data: {
        destination: data?.User?.connectedAccountId as string,
      },
    },
    success_url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/payment/success"
        : "https://digital-marketplace-chi.vercel.app/payment/success",
    cancel_url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/payment/cancel"
        : "https://digital-marketplace-chi.vercel.app/payment/cancel",
  });
  return redirect(session.url as string);
}

// CREATE STRIPE ACCOUNT
export async function CreateStripeAccountLink() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  });
  const accountLink = await stripe.accountLinks.create({
    account: data?.connectedAccountId as string,
    refresh_url:
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/billing`
        : "https://digital-marketplace-chi.vercel.app/billing",
    return_url:
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/return/${data?.connectedAccountId}`
        : `https://digital-marketplace-chi.vercel.app/payment/return/${data?.connectedAccountId}`,
    type: "account_onboarding",
  });
  return redirect(accountLink.url);
}

// GET STRIPE DASHBOARD
export async function GetStripeDashboardLink() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      connectedAccountId: true,
    },
  });
  const loginLink = await stripe.accounts.createLoginLink(
    data?.connectedAccountId as string
  );
  return redirect(loginLink.url);
}
