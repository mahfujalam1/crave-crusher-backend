import { Request, Response, NextFunction } from 'express';
import { Comment } from './comment.model';

// Middleware to check if the user is the author of the comment or an admin
const checkCommentOwnershipOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const user = req.user; // Assuming userId is passed in the request body or headers
    const { id: userId } = user?.id

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author or an admin
    if (comment.authorId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to edit or delete this comment' });
    }

    // If the user is the author or an admin, proceed to the next middleware/controller
    next();
};

export default checkCommentOwnershipOrAdmin;
