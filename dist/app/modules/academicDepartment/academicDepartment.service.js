"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicDepartmentService = void 0;
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const academicDepartment_constant_1 = require("./academicDepartment.constant");
const academicDepartment_model_1 = require("./academicDepartment.model");
const academicFaculty_model_1 = require("../academicFaculty/academicFaculty.model");
// CREATE ACADEMIC DEPARTMENT
const createAcademicDepartment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (yield academicDepartment_model_1.AcademicDepartment.create(payload)).populate('academicFaculty');
    return result;
});
// GET SINGLE ACADEMIC DEPARTMENT
const getSingleAcademicDepartment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield academicDepartment_model_1.AcademicDepartment.findById(id).populate('academicFaculty');
    return result;
});
// GET ALL ACADEMIC DEPARTMENT
const getAllAcademicDepartments = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    // Extract searchTerm to implement search query
    const { searchTerm } = filters, filtersData = __rest(filters, ["searchTerm"]);
    // search and filters condition
    const andConditions = [];
    // Search needs $or for searching in specified fields
    if (searchTerm) {
        andConditions.push({
            $or: academicDepartment_constant_1.academicDepartmentSearchableFields.map((field) => ({
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
    // Filters needs $and to full fill all the conditions
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }
    // Dynamic  Sort needs  field to  do sorting
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    // If there is no condition , put {} to give all data
    const whereCondition = andConditions.length ? { $and: andConditions } : {};
    // query in database
    const result = yield academicDepartment_model_1.AcademicDepartment.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    // Getting total
    const total = yield academicDepartment_model_1.AcademicDepartment.countDocuments(whereCondition);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
// UPDATE ACADEMIC DEPARTMENT
const updateAcademicDepartment = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield academicDepartment_model_1.AcademicDepartment.findOneAndUpdate({ _id: id }, payload, { new: true }).populate('academicFaculty');
    return result;
});
// DELETE ACADEMIC DEPARTMENT
const deleteAcademicDepartment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield academicDepartment_model_1.AcademicDepartment.findByIdAndDelete(id);
    return result;
});
// CREATE ACADEMIC DEPARTMENT FROM EVENT
const createAcademicDepartmentFromEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const getFaculty = yield academicFaculty_model_1.AcademicFaculty.findOne({
        syncId: event.academicFacultyId,
    });
    yield academicDepartment_model_1.AcademicDepartment.create({
        title: event.title,
        academicFaculty: getFaculty === null || getFaculty === void 0 ? void 0 : getFaculty._id,
        syncId: event.syncId,
    });
});
// UPDATE ACADEMIC DEPARTMENT FROM EVENT
const updateAcademicDepartmentFromEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const getFaculty = yield academicFaculty_model_1.AcademicFaculty.findOne({
        syncId: event.academicFacultyId,
    });
    const getDepartment = yield academicDepartment_model_1.AcademicDepartment.findOne({
        syncId: event.syncId,
    });
    if (!getDepartment) {
        yield academicDepartment_model_1.AcademicDepartment.create({
            title: event.title,
            academicFaculty: getFaculty === null || getFaculty === void 0 ? void 0 : getFaculty._id,
            syncId: event.syncId,
        });
    }
    yield academicDepartment_model_1.AcademicDepartment.findOneAndUpdate({ syncId: event.syncId }, {
        $set: {
            title: event.title,
            academicFaculty: getFaculty === null || getFaculty === void 0 ? void 0 : getFaculty._id,
        },
    }, {
        new: true,
    });
});
// DELETE ACADEMIC DEPARTMENT FROM EVENT
const deleteAcademicDepartmentFromEvent = (syncId) => __awaiter(void 0, void 0, void 0, function* () {
    yield academicDepartment_model_1.AcademicDepartment.findOneAndDelete({ syncId: syncId });
});
// EXPORT SERVICES
exports.AcademicDepartmentService = {
    createAcademicDepartment,
    getAllAcademicDepartments,
    getSingleAcademicDepartment,
    updateAcademicDepartment,
    deleteAcademicDepartment,
    createAcademicDepartmentFromEvent,
    updateAcademicDepartmentFromEvent,
    deleteAcademicDepartmentFromEvent,
};
