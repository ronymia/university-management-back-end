/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import {
    IChangePassword,
    ILoginUser,
    ILoginUserResponse,
    IRefreshTokenResponse,
} from './auth.interface';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
    const user = new User();
    const { id, password } = payload;
    const isUserExist = await user.isUserExist(id);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, ' User not found');
    }

    // check password
    const isPasswordMatch =
        isUserExist.password &&
        (await user.isPasswordMatch(password, isUserExist.password));

    if (!isPasswordMatch) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, ' Password incorrect');
    }

    // create JWT token and refresh token
    const { id: userId, role, needsChangePassword } = isUserExist;
    const accessToken = jwtHelpers.createToken(
        { userId, role },
        config.jwt.secret as Secret,
        config.jwt.expires_in as string,
    );
    const refreshToken = jwtHelpers.createToken(
        { userId, role },
        config.jwt.refresh_secret as Secret,
        config.jwt.refresh_expires_in as string,
    );

    return {
        accessToken,
        refreshToken,
        needsChangePassword,
    };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
    // Invalid token - synchronous
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers.verifyToken(
            token,
            config.jwt.refresh_secret as Secret,
        );
    } catch (err: any) {
        // Log the error for debugging purposes
        console.error('JWT verification error:', err);

        // Differentiate between token expiration and other errors
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                'JWT token has expired',
            );
        } else if (err.name === 'JsonWebTokenError') {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid JWT token');
        } else {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Could not verify JWT token',
            );
        }
    }

    const { userId } = verifiedToken;

    const user = new User();
    const isUserExist = await user.isUserExist(userId);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, ' User not found');
    }
    //generate new token

    const newAccessToken = jwtHelpers.createToken(
        {
            id: isUserExist.id,
            role: isUserExist.role,
        },
        config.jwt.secret as Secret,
        config.jwt.expires_in as string,
    );

    return {
        accessToken: newAccessToken,
    };
};

const changePassword = async (
    user: JwtPayload | null,
    payload: IChangePassword,
): Promise<void> => {
    const { oldPassword, newPassword } = payload;

    // // checking is user exist
    // const isUserExist = await User.isUserExist(user?.userId);

    //alternative way
    const isUserExist = await User.findOne({ id: user?.userId }).select(
        '+password',
    );

    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User does not exist');
    }

    // checking old password
    const userExist = new User();
    if (
        isUserExist.password &&
        !(await userExist.isPasswordMatch(oldPassword, isUserExist.password))
    ) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            'Old Password is incorrect',
        );
    }

    // // hash password before saving
    // const newHashedPassword = await bcrypt.hash(
    //   newPassword,
    //   Number(config.bycrypt_salt_rounds)
    // );

    // const query = { id: user?.userId };
    // const updatedData = {
    //   password: newHashedPassword,  //
    //   needsPasswordChange: false,
    //   passwordChangedAt: new Date(), //
    // };

    // await User.findOneAndUpdate(query, updatedData);
    // data update
    isUserExist.password = newPassword;
    isUserExist.needsChangePassword = false;

    // updating using save()
    isUserExist.save();
};

export const AuthService = {
    loginUser,
    refreshToken,
    changePassword,
};
