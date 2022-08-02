const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
let password_param = process.argv[2];

async function main(password){
  let crypter_password = await bcrypt.hash(password, 10);
  let access_token = crypto.randomBytes(64).toString("hex");
  let env_content =`ACCESS_TOKEN=${access_token}
PASSWORD=${crypter_password}`;
  try {
    fs.writeFileSync(path.resolve(".env"), env_content);
  } catch (err) {
    console.error(err);
  }
  console.log("Password set");
}

main(password_param);
