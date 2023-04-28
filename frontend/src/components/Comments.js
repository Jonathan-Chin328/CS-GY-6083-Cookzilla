import React, { useState } from "react";
import moment from 'moment';
import "./SongPage.css";
import { UserModal } from "./Modal";

const Comments = ({ comments, onAddComment }) => {
  const [commentText, setCommentText] = useState("");
  const [selectUser, setSelectUser] = useState("")

  const handleCommentChange = (event) => {
    // Handle comment text change
    setCommentText(event.target.value);
  };

  const handleAddComment = async () => {
    // Handle adding a new comment
    if (commentText) {
			const isSuccess = await onAddComment(commentText);
      if (isSuccess) {
        setCommentText("");
      }
    }
  };

  return (
    <div className="comments-container">
      <h4 className="comments-title">Comments:</h4>
      <div className="comment-form">
        <textarea
          className="comment-input"
          value={commentText}
          onChange={handleCommentChange}
          placeholder="Enter your comment..."
        />
        <button className="comment-button" onClick={handleAddComment}>
          Add Comment
        </button>
      </div>
      {comments.length > 0 ? (
        <div className="comment-list">
          {comments.map((comment, index) => (
            <div className="comment" key={index}>
              <div className="comment-user" onClick={() => {setSelectUser(comment.username)}}>{comment.username}</div>
              <div className="comment-text">{comment.reviewText}</div> 
              <div className="comment-date">{moment(comment.reviewDate).fromNow()}</div> 
            </div>
          ))}
        </div>
      ) : (
        <p>No comments yet.</p>
      )}
      {selectUser && (
        <>
          <div className="modal-backdrop fade show"></div>
          <UserModal
            username={selectUser}
            onClose={() => {setSelectUser("")}}
            fetchFriendsList={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default Comments;
