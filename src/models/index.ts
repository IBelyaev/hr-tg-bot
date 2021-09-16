import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
    surname: string;
    name: string;
    currentQuestion: number;
    isPassedScreening: boolean;
    goals: number;
};

export const UserSchema = new mongoose.Schema({
    surname: String,
    name: String,
    currentQuestion: Number,
    isPassedScreening: Boolean,
    goals: Number,
});

const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;
