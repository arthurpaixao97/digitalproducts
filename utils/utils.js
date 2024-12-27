const User = require('../db/schemas/users.js')

class Utils
{
    async uniqueID(n)
    {
        var uid = ''
        for(let i = 0; i < n; i++)
        {
            uid += Math.round(Math.random() * 10)
        }
        uid = parseInt(uid)
        console.log('uid = ', uid)
        const user = await User.findOne({id: uid})
        if(user)
        {
            this.uniqueID(n)
        } else
        {
            return uid
        }
    }
}

module.exports = new Utils()