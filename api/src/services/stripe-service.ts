import {UserWithId} from "../persistence/user-model";

const stripe = require('stripe');

require("dotenv").config();

const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: '2020-08-27'});

const findCustomerById = (id: string) => Stripe.customers.retrieve(id);

export const createCustomer = (user: UserWithId) =>
    Stripe.customers.create({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        description: user.id
    });

export const createCheckoutSession = (billingId: string, price: string) =>
    Stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: billingId,
        line_items: [
            {
                price,
                quantity: 1
            }
        ],
        subscription_data: {
            trial_period_days: process.env.TRIAL_DAYS
        },
        success_url: `${process.env.CHECKOUT_SUCCESS_URL}`,
        cancel_url: `${process.env.CHECKOUT_CANCEL_URL}`
    });

export const getSubscriptions = (billingId: string) =>
    Stripe.subscriptions.list({
        customer: billingId
    });

export const getProduct = (productId: string) =>
    Stripe.products.retrieve(productId);