const mongoose = require("mongoose");
const generate = require("../../../helpers/generate");


const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        token: {
            type: String,
            default: generate.generateRandomString(20)
        },
        deletedAt: Date,
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema, "users");

module.exports = User;