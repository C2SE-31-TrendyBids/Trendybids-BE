const ProductAuction = require("../models/productAuction");
const User = require("../models/user");
const UserParticipant = require("../models/userParticipant");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

class UserServices {
  getCurrentUser(user, res) {
    return res.status(200).json({
      ...user,
    });
  }

  async joinAuctionSession(userId, sessionId, res) {
    try {
      const participant = await UserParticipant.findOne({
        where: { userId, productAuctionId: sessionId },
      });
      if (participant) {
        return res.status(400).json({
          message: "The user has participated in this auction",
        });
      }

      await Promise.all([
        UserParticipant.create({
          userId,
          productAuctionId: sessionId,
        }),
        ProductAuction.update(
          {
            numberOfParticipation: Sequelize.literal(
              "number_of_participation + 1"
            ),
          },
          {
            where: { id: sessionId },
          }
        ),
      ]);

      return res.status(200).json({
        message: "Join to auction session successfully",
      });
    } catch (error) {
      throw new Error(error);
    }
  }
  async editUser(id, newData, res) {
    try {
      const user = await User.findOne({
        where: { id: id },
      });

      if (!user) {
        res.status(404).json({
          message: "User is not found",
        });
      }
      // Upload image into Firebase and save url in database
      // if (user && fileImages.length > 0) {
      //     const imageURLs = await uploadMultipleFile(fileImages, 'user')
      //     const prdImageModels = imageURLs.map(item => {
      //         return {
      //             id: item.id,
      //             prdImageURL: item.url,
      //             productId: product.id
      //         };
      //     });
      //     await prdImage.bulkCreate(prdImageModels)
      // }

      await user.update({
        ...newData,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async changePassword(id, oldPassword, newPassword, res) {
    try {
      const user = await User.findOne({ where: { id: id } });
      console.log("chay roi");
      if (!user) {
        console.log("User not found");
      }
      // const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      const hashPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8));
      await user.update({ password: hashPassword });
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = new UserServices();
