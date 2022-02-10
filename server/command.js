import {readFile} from "fs/promises";
import UserModel from "./models/user_model.js";
import bcrypt from "bcryptjs";
import {logCustomRaw, getDate} from "./logger.js";

async function run_command () {
    let data = await readFile("command.txt");
    data = data.split("\n");
    let lines = [];
    for (let i = 0; i < data.length; i ++) {
        if (data[i] !== "") {
            lines.push(data[i]);
        }
    }
    if (lines[0] === "register") {
        if (lines.length > 2) {
            let pwd = await bcrypt.hash(lines[2], 10);
            let user = new UserModel({
                username: lines[1],
                password: pwd,
            });
            await user.save();
            logCustomRaw(`SREGISTER: id="${user._id}" name="${user.username}" date="${getDate()}" time="${new Date().toTimeString()}"`)
        }
    }
}

export {run_command}