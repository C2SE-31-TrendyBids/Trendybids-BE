const Feedback = require('../models/feedback');
const User = require('../models/user');


class FeedbackService {
    async getAllFeedback(productAuctionId) {
        return await Feedback.findAll({ where: {
            productAuctionId: productAuctionId
        }, include: [{
            model: User,
            as: 'user',
            required: true,
            attributes: ['id', 'full_name', 'email', 'avatar_url'] 
        }]});
    }

    async getFeedbackById(id) {
        return await Feedback.findByPk(id);
    }

    async createFeedback(feedbackData) {
        return await Feedback.create(feedbackData);
    }

    async updateFeedback(id, feedbackData) {
        await Feedback.update(feedbackData, { where: { id } });
        return await this.getFeedbackById(id);
    }

    async deleteFeedback(id) {
        await Feedback.destroy({ where: { id } });
    }
}

module.exports = FeedbackService;
