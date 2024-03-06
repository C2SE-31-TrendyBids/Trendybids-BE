const Role = require('../models/role');
const Category = require('../models/category');
const {initRoles, initCategories} = require('./data');

const run = () => {
    return Promise.all([
        Role.bulkCreate(initRoles),
        Category.bulkCreate(initCategories)
    ]);
}

run().then(() => {
    console.log("Seed data successfully")
}).catch((error) => {
    console.log("Has error when seed data: ", error)
})
