import { Request, RequestHandler, Response } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from './user.interface';
import httpStatus from 'http-status';

const createStudent: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { student, ...userData } = req.body;
        const result = await UserService.createStudent(student, userData);

        sendResponse<IUser>(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Student created successfully!',
            data: result,
        });
    },
);

// Create Faculty
const createFaculty: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { faculty, ...userData } = req.body;
        console.log(req.body);
        const result = await UserService.createFaculty(faculty, userData);

        sendResponse<IUser>(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Faculty created successfully!',
            data: result,
        });
    },
);

const createAdmin: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const { admin, ...userData } = req.body;
        const result = await UserService.createAdmin(admin, userData);

        sendResponse<IUser>(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Admin created successfully!',
            data: result,
        });
    },
);

export const UserController = {
    createStudent,
    createFaculty,
    createAdmin,
};
