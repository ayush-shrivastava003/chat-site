import {readFile, truncate} from "fs/promises";
import UserModel from "./models/user_model.js";
import bcrypt from "bcryptjs";
import {logCustomRaw, getDate, logCommand} from "./logger.js";
import {userExists} from "./routes/account_router.js";

async function confirmCommand () {
    let v;
    try {
        v = await readFile("confirm.check", "utf-8");
    } catch (err) {
        return false;
    }
    truncate("confirm.check", 0);
    return v === process.env.CONFIRMVALUE;
}

async function run_command () {
    let data = await readFile("command.txt", "utf-8");
    data = data.split("\n");
    let lines = [];
    for (let i = 0; i < data.length; i ++) {
        if (data[i] !== "") {
            lines.push(data[i]);
        }
    }
    if (lines[0] === "register") {
        if (lines.length > 2) {
            if (await userExists(lines[1])) {
                logCommand("COMMAND - REGISTER - FAILED: username is already registered");
                return;
            }
            let pwd = await bcrypt.hash(lines[2], 10);
            let user = new UserModel({
                username: lines[1],
                password: pwd,
            });
            await user.save();
            logCustomRaw(`SREGISTER: id="${user._id}" name="${user.username}" date="${getDate()}" time="${new Date().toTimeString()}"`);
            logCommand(`COMMAND - REGISTER: id="${user._id}" name="${user.username}"`);
        } else {
            logCommand("COMMAND - REGISTER - FAILED: not enough args");
        }
    } else if (lines[0] === "exists") {
        if (lines.length > 1) {
            logCommand(`COMMAND - EXISTS: name="${lines[1]}" output="${await userExists(lines[1])}"`);
        } else {
            logCommand("COMMAND - EXISTS - FAILED: no username given");
        }
    } else if (lines[0] === "modify") {
        if (!await confirmCommand()) {
            logCommand("COMMAND - MODIFY - FAILED: invalid confirmation value");
            return;
        }
        // logCommand("COMMAND - MODIFY: NULLDEF");
        // valid options for data type to modify
        if (!lines[1].match("user|room") || lines.length < 5) {
            logCommand("COMMAND - MODIFY - FAILED: " + lines.length < 5 ? "not enough args" : "invalid option given");
            return;
        }
        // process user modifications
        if (lines[1] === "user") {
            // check user exists
            if (!await userExists(lines[2])) {
                logCommand(`COMMAND - MODIFY - USER - FAILED: user ${lines[2]} does not exist`);
                return;
            }
            let user = await UserModel.findOne({username:lines[2]});
            // valid modify - user options
            switch (lines[3]) {
                case "about":
                    user.about = lines.slice(4).join("\n");
                    logCommand("COMMAND - MODIFY - USER - ABOUT: success");
                    break;
                case "bio":
                    user.bio = lines.slice(4).join("\n");
                    logCommand("COMMAND - MODIFY - USER - BIO: success");
                    break;
                case "usrname":
                    if (await userExists(lines[4])) {
                        logCommand("COMMAND - MODIFY - USER - USRNAME - FAILED: target name already registered");
                    }
                    user.username = lines[4];
                    logCommand(`COMMAND - MODIFY - USER - USRNAME: success, user: "${lines[2]}" now named "${lines[4]}"`);
                    break;
                case "status":
                    user.account_status = lines[4];
                    logCommand(`COMMAND - MODIFY - USER - STATUS: success, user: "${lines[2]}" has account status: "${lines[4]}"`);
                    break;
                case "avatar":
                    user.avatar = lines[4];
                    logCommand("COMMAND - MODIFY - USER - AVATAR: success");
                    break;
                default:
                    logCommand("COMMAND - MODIFY - FAILED: invalid option for user modification");
                    return;
            }
            await user.save();
            return;
        }
        //
    }
}

export {run_command}