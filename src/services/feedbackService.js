const Feedback = require('../models/feedback');

class FeedbackService {
    async getAllFeedback() {
        return await Feedback.findAll();
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
