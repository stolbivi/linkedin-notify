import {Profile} from "passport";
import {createCustomer} from "../services/stripe-service";

const dynamoose = require("dynamoose");

require("dotenv").config();

export interface Feature {
    type: string
    authors?: string[]
    theme?: string
}

export interface FeatureRequest {
    author?: string
    theme?: string
    type: string
    action: string
}

export interface User {
    firstName: string
    lastName: string
    email: string
    features?: Feature[]
    createdAt?: string
    updatedAt?: string
    billingId?: string
    plan?: string
    expiration?: Date
}

export interface UserWithId extends User {
    id: string
}

const userSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    features: {
        type: Array,
        schema: [{
            type: Object,
            schema: {
                type: String,
                authors: {
                    type: Array,
                    schema: [String],
                    required: false
                }
            }
        }],
        required: false
    },
}, {
    "saveUnknown": true,
    "timestamps": true
});

export const UserModel = dynamoose.model(process.env.TABLE_USERS, userSchema);

export class UserService {

    public toUserModel(profile: Profile): UserWithId {
        const {value: email} = profile.emails?.slice(0, 1).shift();
        return {
            id: profile.id,
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName
        };
    }

    public async findOrCreate(profile: Profile): Promise<User> {
        const result = await UserModel.query("id").eq(profile.id).exec();
        if (result && result.length > 0) {
            return result[0];
        } else {
            const user = this.toUserModel(profile);
            const customer = await this.createCustomer(user);
            const result = await UserModel.create(customer);
            return result.toJSON();
        }
    }

    public async findById(id: string): Promise<User> {
        const result = await UserModel.query("id").eq(id).exec();
        if (result && result.length > 0) {
            return result[0].toJSON();
        }
    }

    public async createCustomer(user: UserWithId): Promise<UserWithId> {
        const customer = await createCustomer(user);
        user.billingId = customer.id;
        return user;
    }

}