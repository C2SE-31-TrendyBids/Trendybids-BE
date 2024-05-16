const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/verifyToken");
const multer = require("multer");
const { uploadFile } = require("../config/firebase.config");
const User = require("../models/user");

router.post("/send-contact", userController.sendContact);

router.use(verifyToken);

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
    const user = req.user?.get();

    if (!req.file)
        return res
            .status(400)
            .json({ error: true, message: "File do not exists!" });

    const uploadAvatar = await uploadFile(req.file, "avatar");

    if (!uploadAvatar.url)
        return res
            .status(400)
            .json({ error: true, message: "Upload file error!" });

    await User.update(
        { avatarUrl: uploadAvatar.url },
        { where: { id: user.id } }
    );

    return res.json({ url: uploadAvatar.url });
});
router.get("/me", verifyToken, userController.getCurrentUser);
router.put("/edit-user", verifyToken, userController.editUser);
router.put("/change-password", userController.changePassword);
router.post("/join-auction-session", userController.joinAuctionSession);
router.get(
    "/get-all-auction-price/:sessionId",
    userController.getAllAuctionPriceInSession
);
router.get(
    "/get-summary-auction-price/:sessionId",
    userController.getTheNecessaryDataInSession
);
router.get("/search", userController.searchUser);

module.exports = router;
