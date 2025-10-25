import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,

    hash_salt: process.env.HASH_SALT,

    cloudinary: {
        CLOUDINARY_NAME:process.env.CLOUDINARY_NAME,
        CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET
    },

    jwt: {
        JWT_SECRET:process.env.JWT_SECRET,
        JWT_EXPIRES:process.env.JWT_EXPIRES,
        JWT_REFRESHSECRET:process.env.JWT_REFRESHSECRET,
        JWT_REFRESHEXPIRES:process.env.JWT_REFRESHEXPIRES
    },

    RESET_PASS_SECRET: process.env.RESET_PASS_SECRET,
    RESET_PASS_EXPIRY:process.env.RESET_PASS_EXPIRY,
    RESET_PASS_LINK:process.env.RESET_PASS_LINK,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

    EMAILSENDER_EMAIL:process.env.EMAILSENDER_EMAIL,
    EMAILSENDER_PASS:process.env.EMAILSENDER_PASS
}