import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { openSnackbar } from '../snackbar';
import { AppThunk } from '../types';
import api from './api';
import { UsersData, UsersItemData, UsersState } from './types';

const initialState: UsersState = {
    asyncLoading: false,
};

const {
    actions: {
        asyncStart,
        asyncSuccess,
        asyncMoreSuccess,
        asyncError,
        resetUsers,
    },
    reducer,
} = createSlice({
    name: 'users',
    initialState,
    reducers: {
        asyncStart: (state): UsersState => ({
            ...state,
            asyncLoading: true,
        }),
        asyncSuccess: (
            state,
            { payload }: PayloadAction<UsersData>
        ): UsersState => ({
            ...state,
            asyncLoading: false,
            asyncData: payload,
        }),
        asyncMoreSuccess: (
            state,
            { payload }: PayloadAction<UsersData>
        ): UsersState => {
            return {
                ...state,
                asyncLoading: false,
                asyncData: {
                    ...payload,
                    data: [
                        ...(state.asyncData?.data as UsersItemData[]),
                        ...payload.data,
                    ],
                },
            };
        },
        asyncError: (
            state,
            { payload }: PayloadAction<string>
        ): UsersState => ({
            ...state,
            asyncLoading: false,
            asyncError: true,
            error: payload,
        }),
        resetUsers: (): UsersState => ({
            ...initialState,
        }),
    },
});

const getUsers = (): AppThunk<ReturnType<typeof api.getUsers>> => dispatch => {
    dispatch(asyncStart());

    const promise = api
        .getUsers()
        .then(response => {
            dispatch(asyncSuccess(response.data));
            return response;
        })
        .catch(error => {
            const errorMessage = error.toString();
            dispatch(asyncError(errorMessage));
            dispatch(openSnackbar(errorMessage));
            throw error;
        });

    return promise;
};

const getMoreUsers = (
    nextPage?: number
): AppThunk<ReturnType<typeof api.getUsers>> => dispatch => {
    dispatch(asyncStart());

    const promise = api
        .getUsers(nextPage)
        .then(response => {
            dispatch(asyncMoreSuccess(response.data));
            return response;
        })
        .catch(error => {
            const errorMessage = error.toString();
            dispatch(asyncError(errorMessage));
            dispatch(openSnackbar(errorMessage));
            throw error;
        });

    return promise;
};

export {
    asyncStart,
    asyncSuccess,
    asyncError,
    getUsers,
    getMoreUsers,
    resetUsers,
};
export default reducer;
