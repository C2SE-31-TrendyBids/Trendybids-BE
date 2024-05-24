const FeedbackService = require('../services/feedbackService');

const feedbackService = new FeedbackService();

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await feedbackService.getAllFeedback();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFeedbackById = async (req, res) => {
    const { id } = req.params;
    try {
        const feedback = await feedbackService.getFeedbackById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFeedback = async (req, res) => {
    const feedbackData = req.body;
    try {
        const feedback = await feedbackService.createFeedback(feedbackData);
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateFeedback = async (req, res) => {
    const { id } = req.params;
    const feedbackData = req.body;
    try {
        const updatedFeedback = await feedbackService.updateFeedback(id, feedbackData);
        res.json(updatedFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    const { id } = req.params;
    try {
        await feedbackService.deleteFeedback(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};