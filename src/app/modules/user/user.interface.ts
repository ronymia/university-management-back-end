/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { IStudent } from '../student/student.interface';
import { IFaculty } from '../faculty/faculty.interface';
import { IAdmin } from '../admin/admin.interface';

export type IUser = {
    id: string;
    role: string;
    password: string;
    needsChangePassword: true | false;
    student?: Types.ObjectId | IStudent;
    faculty?: Types.ObjectId | IFaculty;
    admin?: Types.ObjectId | IAdmin;
};

export type IUserMethods = {
    isUserExist(id: string): Promise<Partial<IUser> | null>;
    isPasswordMatch(
        givenPasswords: string,
        savedPassword: string,
    ): Promise<boolean>;
};

// Create a new Model type that knows about IUserMethods
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;
