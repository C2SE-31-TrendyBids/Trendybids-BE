const User = require("./user");
const Conversation = require("./conversation");
const ConverParticipant = require("./converParticipant");
const Message = require("./message");
const Wallet = require("./wallet");
const Role = require("./role");
const Product = require("./product");
const AuctionNotification = require("./auctionNotifications");
const Censor = require("./censor");
const ProductAuction = require("./productAuction");
const MemberOrganization = require("./memberOrganization");
const Payment = require("./payment");
const PrdImage = require("./prdImage");
const Category = require("./category");
const UserParticipant = require("./userParticipant");
const Feedback = require("./feedback");
const AuctionHistory = require("./auctionHistory")
const TransactionHistory = require("./transactionHistory")

// Define associations

Wallet.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' })

User.belongsTo(Role, { foreignKey: 'roleId', targetKey: 'id', as: 'role' })
User.belongsToMany(Conversation, { through: ConverParticipant, foreignKey: "userId" });

Censor.hasMany(ProductAuction, { foreignKey: 'censorId', as: 'productAuctions' });
Censor.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' });
Censor.belongsTo(Role, { foreignKey: 'roleId', targetKey: 'id', as: 'role' });


Product.hasMany(PrdImage, { foreignKey: 'productId', as: 'prdImages' })
Product.belongsTo(Category, { foreignKey: 'categoryId', targetKey: 'id', as: 'category' })
Product.belongsTo(User, { foreignKey: 'ownerProductId', targetKey: 'id', as: 'owner', onDelete: 'CASCADE' })
Product.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor', onDelete: 'CASCADE' })

ProductAuction.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id', as: 'product', onDelete: 'CASCADE' });
ProductAuction.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' });

UserParticipant.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' })
UserParticipant.belongsTo(ProductAuction, { foreignKey: 'productAuctionId', targetKey: 'id', as: 'productAuction' })

Conversation.belongsToMany(User, { through: ConverParticipant, foreignKey: "conversationId", onDelete: 'CASCADE' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' })

ConverParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' })

Message.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' })
Message.belongsTo(Conversation, { foreignKey: 'conversationId', targetKey: 'id', as: 'conversation' })

AuctionNotification.belongsTo(User, { foreignKey: 'ownerProductId', targetKey: 'id', onDelete: 'CASCADE' })
AuctionNotification.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' })

MemberOrganization.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' })
MemberOrganization.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' })

Payment.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' })
Feedback.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user', onDelete: 'CASCADE' })

AuctionHistory.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'userAuctionHistory', onDelete: 'CASCADE' })

TransactionHistory.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'userTransaction', onDelete: 'CASCADE' })
TransactionHistory.belongsTo(User, { foreignKey: 'receiverId', targetKey: 'id', as: 'receiverTransaction', onDelete: 'CASCADE' })

