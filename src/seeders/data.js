const initRoles = [
    {
        id: 'C01',
        name: 'User',
    },
    {
        id: 'C02',
        name: 'Censor',
    },
    {
        id: 'C03',
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


const initUsers = [
    {
        id: "3c477ff8-7ad5-4888-b678-f11615bf2e73",
        fullName: "Alice Smith",
        email: "alice@example.com",
        password: "password456",
        phoneNumber: "987654321",
        avatarUrl: "https://example.com/alice_avatar.jpg",
        address: "456 Oak St, Town",
        refreshToken: "refreshToken456",
        roleId: "C02"
    },
    {
        id: "0b7b9ed5-143c-4f3a-9ff7-4a2114f5b79b",
        fullName: "Bob Johnson",
        email: "bob@example.com",
        password: "password789",
        phoneNumber: "555555555",
        avatarUrl: "https://example.com/bob_avatar.jpg",
        address: "789 Pine St, Village",
        refreshToken: "refreshToken789",
        roleId: "C03"
    },
    {
        id: "a4981c49-25e8-4b20-bb21-c57a0c228f09",
        fullName: "Eva Martinez",
        email: "eva@example.com",
        password: "passwordabc",
        phoneNumber: "111111111",
        avatarUrl: "https://example.com/eva_avatar.jpg",
        address: "321 Elm St, County",
        refreshToken: "refreshTokenabc",
        roleId: "C01"
    }
];

const initCensors = [
    {
        id: "cbe7a408-b4f0-4aa5-9409-1af297d59484",
        name: "Censor 1",
        phoneNumber: "123456789",
        avatarUrl: "https://example.com/avatar1.jpg",
        founding: "2023-01-01",
        address: "123 Main St, City 1",
        userId: "3c477ff8-7ad5-4888-b678-f11615bf2e73",
        roleId: "C01"
    },
    {
        id: "0639c5dc-d57d-413a-98c0-1888ad363ab8",
        name: "Censor 2",
        phoneNumber: "987654321",
        avatarUrl: "https://example.com/avatar2.jpg",
        founding: "2023-02-01",
        address: "456 Oak St, Town 2",
        userId: "0b7b9ed5-143c-4f3a-9ff7-4a2114f5b79b",
        roleId: "C02"
    }
];

const initProducts = [
    {
        id: "5293d29c-f7ba-4655-9403-f689d05a18e4",
        productName: "Product 1",
        description: "Description for Product 1",
        startingPrice: 100.00,
        categoryId: "C05",
        ownerProductId: "3c477ff8-7ad5-4888-b678-f11615bf2e73",
        censorId: "cbe7a408-b4f0-4aa5-9409-1af297d59484"
    },
    {
        id: "e791bec8-41e5-4d5b-b07b-38c94ad030d6",
        productName: "Product 2",
        description: "Description for Product 2",
        startingPrice: 150.00,
        categoryId: "C06",
        ownerProductId: "3c477ff8-7ad5-4888-b678-f11615bf2e73",
        censorId: "0639c5dc-d57d-413a-98c0-1888ad363ab8"
    }
];

const initPrdImages = [
    {
        id: "ffccfab7-d27a-4527-89a8-bad5889210fd",
        prdImageURL: "https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg",
        productId: "5293d29c-f7ba-4655-9403-f689d05a18e4"
    },
    {
        id: "fd5c492d-5c16-448f-8784-f8773702afe4",
        prdImageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRojuDkMYmBEf4C96QI7PTJtLqp4VfdiEVC2HAmsCyhxESwC9WLSeFBvBUONw_ff0mrXFA&usqp=CAU",
        productId: "e791bec8-41e5-4d5b-b07b-38c94ad030d6"
    },
    {
        id: "4d346850-be25-42cf-96e2-a9f23ce1f407",
        prdImageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRojuDkMYmBEf4C96QI7PTJtLqp4VfdiEVC2HAmsCyhxESwC9WLSeFBvBUONw_ff0mrXFA&usqp=CAU",
        productId: "e791bec8-41e5-4d5b-b07b-38c94ad030d6"
    }
];

const initProductAuctions = [
    {
        id: "4d346850-be25-42cf-96e2-a9f23ce1f407",
        description: "Auction description for Product 1",
        startTime: new Date(),
        numberOfParticipation: 10,
        productId: "5293d29c-f7ba-4655-9403-f689d05a18e4",
        censorId: "cbe7a408-b4f0-4aa5-9409-1af297d59484"
    },
    {
        id: "cb3914de-4330-4c1f-b589-e8dbb5a623db",
        description: "Auction description for Product 2",
        startTime: new Date(),
        numberOfParticipation: 8,
        productId: "e791bec8-41e5-4d5b-b07b-38c94ad030d6",
        censorId: "cbe7a408-b4f0-4aa5-9409-1af297d59484"
    }
];

module.exports = {
    initRoles,
    initCategories,
    initUsers,
    initCensors,
    initProducts,
    initPrdImages,
    initProductAuctions
}