import * as userService from '../services/users.service.js';
import { logger } from '../middlewares/loggs/logger.js';
import { UserNotFound } from '../utils/custom-exceptions.js';

const registerUser = async (req, res) => {
    try {
        const result = await userService.saveUser({ ...req.body });
        res.sendSuccess(result.payload);
    } catch (error) {
        logger.error(error.message);
        if (error instanceof UserNotFound) res.sendClientError(error.message);
        res.sendServerError(error.message);
    };
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await userService.loginUser(email, password);
        res.sendSuccess(result);
    } catch (error) {
        logger.error(error.message);
        if (error instanceof UserNotFound) res.sendClientError(error.message);
        res.sendServerError(error.message);
    };
};

const current = async (req, res) => {
    try {
        const { user } = req.user;
        res.sendSuccess(user);
    } catch (error) {
        res.sendServerError(error.message);
    };
};

const recoverPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await userService.recoverPassword(email);
        res.sendSuccess(result);
    } catch (error) {
        logger.error(error.message);
        if(error instanceof UserNotFound) res.sendClientError(error.message);
        res.sendServerError(error.message);
    };
};

const newPassword = async (req, res) => {
    const { user } = req.user;
    const { password } = req.body;
    try {
        const result = await userService.newPassword(user, password);
        res.sendSuccess(result);
    } catch (error) {
        logger.error(error.message);
        if(error instanceof UserNotFound) res.sendClientError(error.message);
        res.sendServerError(error.message);
    };
};

export { registerUser, loginUser, current, recoverPassword, newPassword };