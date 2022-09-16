import { model, Schema } from 'mongoose';

interface User {
	password: string;
	transactions?: string;
}

const userSchema = new Schema<User>(
	{
		password: {
			type: String,
			required: 'Name is required',
			max: 200,
			trim: true,
		},
		transactions: {
			type: String,
			required: false,
			max: 255,
		},
	},
	{ timestamps: true }
);

export const UserModel = model<User>('Users', userSchema);
