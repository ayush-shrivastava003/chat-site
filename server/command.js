import {readFile} from "fs/promises";
import UserModel from "./models/user_model.js";
import bcrypt from "bcryptjs";
import {logCustomRaw, getDate, logCommand} from "./logger.js";
import {userExists} from "./routes/account_router.js";

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
                return;
            }
            let pwd = await bcrypt.hash(lines[2], 10);
            let user = new UserModel({
                username: lines[1],
                password: pwd,
            });
            await user.save();
            logCustomRaw(`SREGISTER: id="${user._id}" name="${user.username}" date="${getDate()}" time="${new Date().toTimeString()}"`);
        }
    } else if (lines[0] === "exists") {
        if (lines.length > 1) {
            logCommand(`COMMAND - EXISTS: name="${lines[1]}" output="${await userExists(lines[1])}"`);
        }
    } else if (lines[0] === "modify") {
        logCommand("COMMAND - MODIFY: NULLDEF");
    }
}

export {run_command}