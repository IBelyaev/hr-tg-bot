import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
    id: string;
    surname: string;
    name: string;
    phoneNumber: string;
    currentQuestion: number;
    isPassedScreening: boolean;
    userGoals: number;
};

export const UserSchema = new mongoose.Schema({
    id: String,
    surname: String,
    name: String,
    phoneNumber: String,
    currentQuestion: Number,
    isPassedScreening: Boolean,
    userGoals: Number,
});

const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;
