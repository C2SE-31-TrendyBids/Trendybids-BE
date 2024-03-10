const Role = require('../models/role');
const Category = require('../models/category');
const User = require('../models/user');
const Censor = require('../models/censor');
const Product = require('../models/product');
const PrdImage = require('../models/prdImage');
const ProductAuction = require('../models/productAuction');
const {
    initRoles,
    initCategories,
    initUsers,
    initCensors,
    initProducts,
    initPrdImages,
    initProductAuctions
} = require('./data');

const run = async () => {
    return Promise.all([
        await Role.bulkCreate(initRoles),
        await Category.bulkCreate(initCategories),
        await User.bulkCreate(initUsers),
        await Censor.bulkCreate(initCensors),
        await Product.bulkCreate(initProducts),
        await PrdImage.bulkCreate(initPrdImages),
        await ProductAuction.bulkCreate(initProductAuctions),
    ]);
}

run().then(() => {
    console.log("Seed data successfully")
}).catch((error) => {
    console.log("Has error when seed data: ", error)
})
