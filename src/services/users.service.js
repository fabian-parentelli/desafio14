import UserRepository from "../repsitories/users.repository.js";
import CartRepository from '../repsitories/carts.repository.js';
import { isValidPassword, generateToken, createHash, tokenPassword } from '../utils/utils.js';
import { sendEmail } from './mail.service.js';
import { recoverPassword_HTML } from '../utils/html/recoverPassword.js';
import { UserNotFound } from "../utils/custom-exceptions.js";

const userManager = new UserRepository();
const cartManager = new CartRepository();

const saveUser = async (user) => {
    const { first_name, last_name, age, role, email, password } = user;

    if (!first_name || !last_name || !role || !email || !password || !age) {
        throw new UserNotFound('Incomplete Value');
    };

    const exists = await userManager.getByEmail(email);
    if (exists) throw new UserNotFound('User already exists');

    const hashedPassword = createHash(password);
    const newUser = { ...user };

    const addCart = await cartManager.save();
    newUser.cart = addCart._id;

    newUser.password = hashedPassword;

    const result = await userManager.save(newUser);
    if (!result) throw new UserNotFound('User not save');

    return { status: 'success', payload: result };
};

const loginUser = async (email, password) => {
    const user = await userManager.getByEmail(email);
    if (!user) throw new UserNotFound('Incorrect credentials');

    const comparePassword = isValidPassword(user, password);
    if (!comparePassword) throw new UserNotFound('Incorrect credentials');

    delete user.password;
    const accesToken = generateToken(user);
    return { accesToken };
};

const recoverPassword = async (email) => {
    const user = await userManager.getByEmail(email);
    if (!user) throw new UserNotFound('User not found');

    user.recoverPassword = `http://localhost:8080/password/${user._id}`;
    const passwordToken = tokenPassword(user);

    const emailTo = {
        to: user.email,
        subject: 'Recuperar contraseña',
        html: await recoverPassword_HTML(user.recoverPassword)
    };
    await sendEmail(emailTo);
    return passwordToken;
};

const getById = async (id) => {
    const user = await userManager.getById(id);
    return user;
};

const newPassword = async (user, newPass) => {

    const userBd = await userManager.getByEmail(user.email);
    if (!userBd) throw new UserNotFound('Incorrect credentials')

    const comparePassword = isValidPassword(userBd, newPass);
    if (comparePassword) throw new UserNotFound('Change your password');

    const hashedPassword = createHash(newPass);
    user.password = hashedPassword;

    delete user.recoverPassword;
    const result = await userManager.update(user._id, user.password);
    if(!result) throw new UserNotFound('The password was not saved');
    delete user.password;

    return { status: 'success', payload: user };
};

export { saveUser, loginUser, recoverPassword, getById, newPassword };