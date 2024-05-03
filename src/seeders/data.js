const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('sequelize');
const initRoles = [
    {
        id: 'R01',
        name: 'User',
    },
    {
        id: 'R02',
        name: 'Censor',
    },
    {
        id: 'R03',
        name: 'Admin',
    },
];

const initCategories = [
    {
        id: 'C01',
        name: 'Electronics',
    },
    {
        id: 'C02',
        name: 'Household Appliances',
    },
    {
        id: 'C03',
        name: 'Fashion',
    },
    {
        id: 'C04',
        name: 'Furniture',
    },
    {
        id: 'C05',
        name: 'Vehicles',
    },
    {
        id: 'C06',
        name: 'Cosmetics and beauty',
    },
    {
        id: 'C07',
        name: 'Art and collectibles',
    },
    {
        id: 'C08',
        name: 'Books and discs',
    },
];


const initUsers = [];
const initCensors = [];
const initProducts = [];
const initPrdImages = [];
const initProductAuctions = [];
const quantity = 15;

for (let i = 0; i < quantity + Math.floor(Math.random() * 6); i++) {
    const newUser = {
        id: faker.string.uuid(),
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phoneNumber: faker.number.int(10, 11),
        avatarUrl: faker.image.avatar(),
        address: faker.location.streetAddress(),
        refreshToken: faker.string.uuid(),
        roleId: 'R' + (Math.floor(Math.random() * initRoles.length) + 1).toString().padStart(2, '0')
    };
    initUsers.push(newUser);
}

for (let i = 0; i < quantity + Math.floor(Math.random() * 6); i++) {
    const newCensor = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        phoneNumber: faker.number.int(10, 11),
        avatarUrl: faker.image.avatar(),
        founding: faker.date.past().toISOString().slice(0, 10),
        address: faker.location.streetAddress(),
        userId: initUsers[Math.floor(Math.random() * initUsers.length)].id,
        // roleId: 'R' + (Math.floor(Math.random() * initRoles.length) + 1).toString().padStart(2, '0')
    };
    initCensors.push(newCensor);
}

for (let i = 0; i < quantity + Math.floor(Math.random() * 6); i++) {
    const newProduct = {
        id: faker.string.uuid(),
        productName: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        startingPrice: parseFloat((Math.random() * 1000).toFixed(2)),
        categoryId: 'C' + (Math.floor(Math.random() * initCategories.length) + 1).toString().padStart(2, '0'),
        ownerProductId: initUsers[Math.floor(Math.random() * initUsers.length)].id,
        censorId: initCensors[Math.floor(Math.random() * initCensors.length)].id
    };
    initProducts.push(newProduct);
}

for (let i = 0; i < quantity + Math.floor(Math.random() * 6); i++) {
    const newPrdImage = {
        id: faker.string.uuid(),
        prdImageURL: faker.image.url(),
        productId: initProducts[Math.floor(Math.random() * initProducts.length)].id
    };
    initPrdImages.push(newPrdImage);
}

for (let i = 0; i < quantity + Math.floor(Math.random() * 6); i++) {
    const newProductAuction = {
        id: faker.string.uuid(),
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
        startTime: faker.date.past(),
        numberOfParticipation: Math.floor(Math.random() * 20),
        productId: initProducts[Math.floor(Math.random() * initProducts.length)].id,
        censorId: initCensors[Math.floor(Math.random() * initCensors.length)].id
    };
    initProductAuctions.push(newProductAuction);
}

// Generate random transaction data
const initTransactions = [];
for (let i = 0; i < quantity; i++) {
    const transactionType = Math.random() > 0.5 ? 'Posting_fee' : 'Auction_fee';
    const amount = parseFloat((Math.random() * 100).toFixed(2));
    const userId = initUsers[Math.floor(Math.random() * initUsers.length)].id;

    let receiverId;

    // Assign random receiver (different from sender)
    do {
        receiverId = initUsers[Math.floor(Math.random() * initUsers.length)].id;
    } while (receiverId === userId); // Ensure receiver is not the sender

    initTransactions.push({
        money: amount,
        transactionType,
        userId,
        receiverId,
    });
}


module.exports = {
    initRoles,
    initCategories,
    initUsers,
    initCensors,
    initProducts,
    initPrdImages,
    initProductAuctions,
    initTransactions
}