import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.route';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.route';
import { StudentRoutes } from '../modules/student/student.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/users/',
        route: UserRoutes,
    },
    {
        path: '/academic-semesters/',
        route: AcademicSemesterRoutes,
    },
    {
        path: '/academic-faculties/',
        route: AcademicFacultyRoutes,
    },
    {
        path: '/academic-departments/',
        route: AcademicDepartmentRoutes,
    },
    {
        path: '/students/',
        route: StudentRoutes,
    },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const Routes = router;
