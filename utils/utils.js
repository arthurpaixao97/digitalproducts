// Load environment variables from a .env file for configuration
require('dotenv').config();
// Import the User and Role models from the database schemas
const User = require('../db/schemas/users.js');
const Product = require('../db/schemas/products.js');
const Offer = require('../db/schemas/offers.js');
const Role = require('../db/schemas/roles.js');

// Utility class with various helper methods for managing users, roles, and permissions
class Utils {

    // Checks if a user or their role has a specific permission
    async checkPermission(req, permission) {
        let ret = true;

        // If the user's role is 'CUSTOM', validate individual user permissions
        if (req.headers['x-role'] == 'CUSTOM') {
            const user = await User.findOne({ id: req.headers['x-user'] });
            this.toArray(permission).forEach(p => {
                if (!user.permissions.find(perm => perm == p)) {
                    ret = false; // Return false if any required permission is missing
                }
            });
        } else {
            // For non-CUSTOM roles, validate against the role's permissions
            const role = await Role.findOne({ name: req.headers['x-role'] });
            const arrPermissions = this.toArray(permission);
            arrPermissions.forEach(p => {
                if (!role.permissions.find(perm => perm == p)) {
                    ret = false; // Return false if any required permission is missing
                }
            });
        }
        return ret;
    }

    // Generates a unique numeric ID of a specified length
    async uniqueID(n) {
        let uid = '';
        // Generate a random numeric ID of length 'n'
        for (let i = 0; i < n; i++) {
            uid += Math.round(Math.random() * 10);
        }
        uid = parseInt(uid);

        // Check if the generated ID already exists in the database
        const user = await User.findOne({ id: uid });
        if (user) {
            // Recursively generate a new ID if the current one is not unique
            return this.uniqueID(n);
        } else {
            return uid; // Return the unique ID
        }
    }

    async uniqueProductID(n) {
        let pid = '';
        // Generate a random numeric ID of length 'n'
        for (let i = 0; i < n; i++) {
            pid += Math.round(Math.random() * 10);
        }
        pid = parseInt(pid);

        // Check if the generated ID already exists in the database
        const product = await Product.findOne({ id: uid });
        if (product) {
            // Recursively generate a new ID if the current one is not unique
            return this.uniqueProductID(n);
        } else {
            return pid; // Return the unique ID
        }
    }

    async uniqueKey(n) {
        let k = '';
        // Generate a random numeric Key of length 'n'
        for (let i = 0; i < n; i++) {
            k += Math.round(Math.random() * 10);
        }
        k = parseInt(k);

        // Check if the generated Key already exists in the database
        const offer = await Offer.findOne({ key: k });
        if (offer) {
            // Recursively generate a new Key if the current one is not unique
            return this.uniqueKey(n);
        } else {
            return k; // Return the unique Key
        }
    }

    // Converts data to an array, ensuring the input is consistent
    toArray(data) {
        let newData = data;

        if (newData == undefined) {
            newData = []; // If data is undefined, return an empty array
        } else if (!Array.isArray(newData)) {
            newData = [newData]; // If data is not an array, wrap it in an array
        }

        return newData;
    }

    // Assigns a role to a user based on their permissions
    async setRole(user) {
        // Ensure the user's permissions are in array format
        user.permissions = this.toArray(user.permissions);

        if (user.role == 'CUSTOM' || user.role == undefined) {
            if (user.permissions.length == 0) {
                user.role = 'CLIENT'; // Default to CLIENT if no permissions
            } else {
                user.role = 'CUSTOM'; // Otherwise, assign CUSTOM
            }
        } else {
            // If the user has a predefined role, ignore permissions
            if (user.permissions.length > 0) {
                user.permissions = []; // Clear permissions
            }
        }

        if (user.role != 'CLIENT') {
            // Verify the role exists, or default to CLIENT if invalid
            const role = await Role.find({ name: user.role });
            if (role.length == 0 && user.role != undefined && user.role != 'CUSTOM') {
                user.role = 'CLIENT';
            }
        }
    }

    // Updates a user's role based on their permissions
    async updateRole(user) {
        if (user.permissions.length == 0) {
            return 'CLIENT'; // Assign CLIENT if no permissions
        } else {
            // Find roles matching the user's permissions
            const roles = await Role.find({ permissions: user.permissions });

            let role = undefined;

            if (roles.length > 0) {
                // Randomly select one of the matching roles
                role = roles[Math.round(Math.random() * (roles.length - 1))].name;
            } else {
                role = 'CUSTOM'; // Default to CUSTOM if no roles match
            }

            return role;
        }
    }

    // Parses a boolean value from either a string or boolean input
    parseBool(b) {
        if (b === 'true' || b == true) {
            return true; // Return true for valid boolean or "true" string
        } else {
            return false; // Return false otherwise
        }
    }

    // Merges two arrays, ensuring unique values (no duplicates)
    mergeArrays(arr1, arr2) {
        let ret = [];

        // If one of the inputs is not an array, add it if unique
        if (Array.isArray(arr1) && !Array.isArray(arr2)) {
            ret = arr1;
            if (!arr1.find(a => a === arr2)) {
                ret.push(arr2);
            }
        }

        if (Array.isArray(arr2) && !Array.isArray(arr1)) {
            ret = arr2;
            if (!arr2.find(a => a === arr1)) {
                ret.push(arr1);
            }
        }

        // If neither input is an array, add both if unique
        if (!Array.isArray(arr1) && !Array.isArray(arr2)) {
            ret.push(arr1);
            if (arr1 !== arr2) {
                ret.push(arr2);
            }
        }

        // Merge both arrays and ensure unique values
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            ret = arr1;
            arr2.forEach(i => {
                if (!ret.find(j => i === j)) {
                    ret.push(i);
                }
            });
        }

        return ret;
    }

    // Computes the difference between two arrays (elements in arr1 but not in arr2)
    diffArrays(arr1, arr2) {
        let ret = {
            result1:[],
            result2:[],
            common:[]
        };

        // For each element in arr1, check if it's not in arr2
        arr1.forEach(i => {
            if (!(arr2.find(j => j == i))) {
                ret.result1.push(i); // Add unique elements to the result
            } else if(!(ret.common.find(k => k == i)))
            {
                ret.common.push(i)
            }
        })

        // For each element in arr2, check if it's not in arr2
        arr2.forEach(i => {
            if (!(arr1.find(j => j == i))) {
                ret.result2.push(i); // Add unique elements to the result
            } else if(!(ret.common.find(k => k == i)))
            {
                ret.common.push(i)
            }
        })

        return ret;
    }

    restrictFields(obj, fields)
    {
        var validObj = {}
        for (const key in obj) {
            if(!fields.find(f => f == key))
            {
                validObj[key] = obj[key]
            }
        }

        return validObj
    }
}

// Export an instance of the Utils class for use in other modules
module.exports = new Utils();