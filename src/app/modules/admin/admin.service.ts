/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { User } from '../user/user.model';
import { adminSearchableFields, EVENT_ADMIN_UPDATED } from './admin.constant';
import { IAdmin, IAdminFilters } from './admin.interface';
import { Admin } from './admin.model';
import { paginationHelper } from '../../../helpers/paginationHelper';
import httpStatus from 'http-status';
import { RedisClient } from '../../../shared/redis';

const getAllAdmins = async (
    filters: IAdminFilters,
    paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IAdmin[]>> => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(paginationOptions);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: adminSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }

    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }
    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await Admin.find(whereConditions)
        .populate('managementDepartment')
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);

    const total = await Admin.countDocuments(whereConditions);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

const getSingleAdmin = async (id: string): Promise<IAdmin | null> => {
    const result = await Admin.findOne({ id }).populate('managementDepartment');
    return result;
};

const updateAdmin = async (
    id: string,
    payload: Partial<IAdmin>,
): Promise<IAdmin | null> => {
    // CHECK IF THE ADMIN EXIST
    const isExist = await Admin.findOne({ id });

    if (!isExist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found !');
    }

    const { name, ...adminData } = payload;

    const updatedAdminData: Partial<IAdmin> = { ...adminData };

    if (name && Object.keys(name).length > 0) {
        Object.keys(name).forEach((key) => {
            const nameKey = `name.${key}` as keyof Partial<IAdmin>;
            (updatedAdminData as any)[nameKey] = name[key as keyof typeof name];
        });
    }

    // UPDATE THE ADMIN
    const result = await Admin.findOneAndUpdate({ id }, updatedAdminData, {
        new: true,
    }).populate('managementDepartment');

    // PUBLISH ON REDIS
    if (result) {
        await RedisClient.publish(EVENT_ADMIN_UPDATED, JSON.stringify(result));
    }

    // RETURN THE ADMIN
    return result;
};

const deleteAdmin = async (id: string): Promise<IAdmin | null> => {
    // check if the faculty is exist
    const isExist = await Admin.findOne({ id });

    if (!isExist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found !');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        //delete admin first
        const admin = await Admin.findOneAndDelete({ id }, { session });
        if (!admin) {
            throw new ApiError(404, 'Failed to delete Admin');
        }
        //delete user
        await User.deleteOne({ id });
        session.commitTransaction();
        session.endSession();

        return admin;
    } catch (error) {
        session.abortTransaction();
        throw error;
    }
};

export const AdminService = {
    getAllAdmins,
    getSingleAdmin,
    updateAdmin,
    deleteAdmin,
};
