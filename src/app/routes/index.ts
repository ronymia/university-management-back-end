import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.route';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.route';
import { StudentRoutes } from '../modules/student/student.route';
import { FacultyRoutes } from '../modules/faculty/faculty.route';
import { ManagementDepartmentRoutes } from '../modules/managementDepartment/managementDepartment.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { AuthRoutes } from '../modules/auth/auth.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/users/',
        route: UserRoutes,
    },
    {
        path: '/auth/',
        route: AuthRoutes,
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
        path: '/management-departments/',
        route: ManagementDepartmentRoutes,
    },
    {
        path: '/students/',
        route: StudentRoutes,
    },
    {
        path: '/faculties/',
        route: FacultyRoutes,
    },
    {
        path: '/admins/',
        route: AdminRoutes,
    },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const Routes = router;
