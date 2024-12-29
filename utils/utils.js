require('dotenv').config()
const User = require('../db/schemas/users.js')
const Role = require('../db/schemas/roles.js')

class Utils
{
    async checkPermission(req, permission)
    {
        if(req.headers['x-role'] == 'CUSTOM')
        {
            const user = await User.findOne({id: req.headers['x-user']})

            if(Array.isArray(user.permissions))
            {
                for(let i = 0; i < user.permissions.length; i++)
                {
                    if(!user.permissions.find(p => p == permission))
                    {
                        return false
                    }
                }

                return true
            }

            if(!user.permissions.find(p => p == permission))
            {
                return false
            }

            return true
        } else
        {
            const role = await Role.findOne({name: req.headers['x-role']})

            if(Array.isArray(role.permissions))
            {
                for(let i = 0; i < role.permissions.length; i++)
                {
                    if(!role.permissions.find(p => p == permission))
                    {
                        return false
                    }
                }

                return true
            }

            if(!role.permissions.find(p => p == permission))
            {
                return false
            }
        }
    }
    
    async uniqueID(n)
    {
        var uid = ''
        for(let i = 0; i < n; i++)
        {
            uid += Math.round(Math.random() * 10)
        }
        uid = parseInt(uid)
        const user = await User.findOne({id: uid})
        if(user)
        {
            this.uniqueID(n)
        } else
        {
            return uid
        }
    }

    toArray(data)
    {
        var newData = data

        if(newData == undefined)
        {
            newData = []
        } else if(!Array.isArray(newData))
        {
            newData = [newData]
        }

        return newData
    }

    async setRole(user)
    {
        user.permissions = this.toArray(user.permissions) //Permissions will always be array

        if(user.role == 'CUSTOM' || user.role == undefined)
        {
            if(user.permissions.length == 0)
            {
                user.role = 'CLIENT'
            } else
            {
                user.role = 'CUSTOM'
            }
        } else //Some role different than CUSTOM or undefined, might be CLIENT
        {
            if(user.permissions.length > 0)
            {
                user.permissions = [] //If other roles informed, ignore permissions and keep role
            }
        }

        if(user.role != 'CLIENT')
        {
            const role = await Role.find({name: user.role})
            if(role.length == 0 && user.role != undefined && user.role != 'CUSTOM')
            {
                user.role = 'CLIENT'
            }
        }
    }

    async updateRole(user)
    {
        if(user.permissions.length == 0)
        {
            return 'CLIENT'
        } else
        {
            const roles = await Role.find({permissions: user.permissions})
            
            var role = undefined

            if(roles.length > 0)
            {
                role = roles[Math.round(Math.random() * (roles.length -1))].name
            } else
            {
                role = 'CUSTOM'
            }

            return role
        }
    }

    parseBool(b)
    {
        if(b === 'true' || b == true)
        {
            return true
        } else
        {
            return false
        }
    }

    mergeArrays(arr1, arr2)
    {
        var ret = []

        if(Array.isArray(arr1) && !Array.isArray(arr2))
        {
            ret = arr1
            if(!arr1.find(a => a === arr2))
            {
                ret.push(arr2)
            }
        }
        if(Array.isArray(arr2) && !Array.isArray(arr1))
        {
            ret = arr2
            if(!arr2.find(a => a === arr1))
            {
                ret.push(arr1)
            }
        }
        if(!Array.isArray(arr1) && !Array.isArray(arr2))
        {
            ret.push(arr1)
            if(arr1 !== arr2)
            {
                ret.push(arr2)
            }
        }
        if(Array.isArray(arr1) && Array.isArray(arr2))
        {
            ret = arr1
            arr2.forEach(i => {
                if(!ret.find(j => i === j))
                {
                    ret.push(i)
                }
            })
        }

        return ret
    }

    diffArrays(arr1, arr2)
    {
        var ret = []

        arr1.forEach(i => {
            if(!(arr2.find(j => j == i)))
            {
                ret.push(i)
            }
        })

        return ret
    }
}

module.exports = new Utils()