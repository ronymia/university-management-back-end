import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import {
    academicSemesterSearchableFields,
    academicSemesterTitleCodeMapper,
} from './academicSemester.constant';
import {
    IAcademicSemester,
    IAcademicSemesterFilters,
} from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';
import httpStatus from 'http-status';

const createAcademicSemester = async (
    payload: IAcademicSemester,
): Promise<IAcademicSemester | null> => {
    if (academicSemesterTitleCodeMapper[payload.title] !== payload.code) {
        throw new ApiError(
            httpStatus.UNPROCESSABLE_ENTITY,
            'Invalid academic semester code',
        );
    }
    const result = await AcademicSemester.create(payload);
    return result;
};

const getSingleAcademicSemester = async (
    id: string,
): Promise<IAcademicSemester | null> => {
    const result = await AcademicSemester.findById(id);
    return result;
};

const getAllAcademicSemesters = async (
    filters: IAcademicSemesterFilters,
    paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IAcademicSemester[]>> => {
    const { searchTerm, ...filtersData } = filters;

    // search and filters condition
    const andConditions = [];

    // search condition $or
    if (searchTerm) {
        andConditions.push({
            $or: academicSemesterSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    // const andConditions = [
    //     {
    //         $or: [
    //             {
    //                 title: {
    //                     $regex: searchTerm,
    //                     $options: 'i',
    //                 },
    //             },
    //             {
    //                 code: {
    //                     $regex: searchTerm,
    //                     $options: 'i',
    //                 },
    //             },
    //             {
    //                 year: {
    //                     $regex: searchTerm,
    //                     $options: 'i',
    //                 },
    //             },
    //         ],
    //     },
    // ];

    // filters condition $and
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }

    const whereCondition = andConditions.length ? { $and: andConditions } : {};

    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(paginationOptions);

    const sortCondition: { [keyof: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const result = await AcademicSemester.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);

    //
    const total = await AcademicSemester.countDocuments();

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

const updateAcademicSemester = async (
    id: string,
    payload: Partial<IAcademicSemester>,
): Promise<IAcademicSemester | null> => {
    if (
        payload.title &&
        payload.code &&
        academicSemesterTitleCodeMapper[payload.title] !== payload.code
    ) {
        throw new ApiError(
            httpStatus.UNPROCESSABLE_ENTITY,
            'Invalid academic semester code',
        );
    }

    const result = await AcademicSemester.findOneAndUpdate(
        { _id: id },
        payload,
        {
            new: true,
        },
    );
    return result;
};

const deleteAcademicSemester = async (
    id: string,
): Promise<IAcademicSemester | null> => {
    const result = await AcademicSemester.findByIdAndDelete(id);
    return result;
};

export const AcademicSemesterService = {
    createAcademicSemester,
    getAllAcademicSemesters,
    getSingleAcademicSemester,
    updateAcademicSemester,
    deleteAcademicSemester,
};
