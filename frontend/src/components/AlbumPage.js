import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AuthService from "../services/auth.service";
import SongService from "../services/song.service";
import Comments from "./Comments";
import SongList from "./SongList";

const AlbumApge = () => {
	const user = AuthService.getCurrentUser()
  const { albumID } = useParams();
	const [songList, setSongList] = useState([]);
	const [rating, setRating] = useState(0);
	const [avgRating, setAvgRating] = useState(0.0);
	const [comments, setComments] = useState([]);

	useEffect(() => {
    	// Fetch songs on component mount
    	fetchSongList();
		fetchAlbumRating();
		fetchAlbumComments();
  }, []);

	const fetchSongList = async () => {
    try {
			const response = await SongService.getSongsByAlbumID(albumID);
			setSongList(response.data);
		} catch (error) {
			console.error("Failed to fetch songs:", error);
		}
  };

	const fetchAlbumRating = async () => {
		try {
			const response = await SongService.getRatingByID(albumID, "album");
			const data = response.data[0];
			if (data) {
				setAvgRating(parseFloat(data.avg_rating))
			}
		} catch (error) {
			console.error("Failed to fetch song rating:", error);
		}
	}

	const fetchAlbumComments = async () => {
		try {
			const response = await SongService.getCommentsByID(albumID, "album");
			const data = response.data;
			console.log(data)
			setComments(data)
		} catch (error) {
			console.error("Failed to fetch song comments:", error);
		}
	}

	const handleRatingChange = async (event) => {
    // Handle rating change
		if (AuthService.getCurrentUser() !== null) {
			const newRating = parseInt(event.target.value);
			// Update rating
			setRating(newRating);
			// call songService and send to backend
			await SongService.updateRating(user.username, newRating, albumID, "album")
			// refetch songRating
			fetchAlbumRating()
		} else {
			setRating(0);
			alert("login to rate!")
		}
  };

	const handleAddComment = async (comment) => {
		if (AuthService.getCurrentUser() !== null) {
			// Call addComment() and wait for it to complete
			await SongService.addComment(user.username, comment, albumID, "album");
			// After addComment() is completed, call fetchAlbumComments()
			fetchAlbumComments()
			return true;
		} else {
			alert("login to comment!")
			return false
		}
  };

	return (
		<div>
			<h1>Album: {albumID}</h1>
			<div className="rating-container">
				<h4 className="rating-title">Rate this song:</h4>
				<select
					className="rating-select"
					value={rating}
					onChange={handleRatingChange}
					>
					<option value={0}>0</option>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>
				<p className="rating-value">Rating: {avgRating}</p>
			</div>
			<h2>Songs in {albumID}:</h2>
      		<SongList songs={songList} />
			<div className="comments-container">
				<Comments comments={comments} onAddComment={handleAddComment}/>
			</div>
		</div>
	)

}

export default AlbumApge;