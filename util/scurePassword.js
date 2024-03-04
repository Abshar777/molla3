const bycrypt = require('bcrypt');
const securePassword = async (pass) => {
    try {
        const passwordHash = await bycrypt.hash(pass, 10);
        return passwordHash;
    }
    catch (err) {
        console.log(err.message);
    }
}

module.exports=securePassword