import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [taskId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/tasks/${taskId}/comments?page=${page}`);
      setComments(response.data.comments);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/tasks/${taskId}/comments`, {
        content: newComment,
      });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/api/tasks/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axiosInstance.put(`/api/tasks/comments/${commentId}/like`);
      fetchComments();
    } catch (error) {
      toast.error('Error liking comment');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {/* Add Comment */}
      <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="3"
        />
        <button
          onClick={handleAddComment}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={comment.author?.profileImageUrl || 'https://via.placeholder.com/40'}
                    alt={comment.author?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">{comment.author?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>

              <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>

              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  👍 {comment.likes?.length || 0}
                </button>
                {comment.replies?.length > 0 && (
                  <span className="text-sm text-gray-500">{comment.replies.length} replies</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 dark:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 dark:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskComments;
