import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SongService from "../services/song.service";
import AuthService from "../services/auth.service";
import Comments from "./Comments";
import { ArtistModal } from "./Modal";
import "./SongPage.css";

// SongPage component
const SongPage = () => {
	const user = AuthService.getCurrentUser()
  const { songID } = useParams();
  const [song, setSong] = useState(null);
  const [artist, setArtist] = useState("");
  const [albumID, setAlbumID] = useState("");
  const [rating, setRating] = useState(0);
	const [avgRating, setAvgRating] = useState(0);
  const [comments, setComments] = useState([]);
	// for modal
	const [selectArtist, setSelectArtist] = useState("")

  useEffect(() => {
    fetchSong();
	fetchSongRating()
	fetchSongComments()
  }, [songID]);

	// Fetch song details from backend API
	const fetchSong = async () => {
		try {
			const response = await SongService.getSongByID(songID);
			const songData = response.data[0];
			console.log(songData)
			if (songData) {
				setSong(songData);
				setArtist(`${songData.fname} ${songData.lname}`);
				setAlbumID(songData.albumID);
			}
		} catch (error) {
			console.error("Failed to fetch song details:", error);
		}
	};

	const fetchSongRating = async () => {
		try {
			const response = await SongService.getRatingByID(songID, "song");
			const data = response.data[0];
			console.log(data)
			if (data) {
				setAvgRating(parseFloat(data.avg_rating))
			}
		} catch (error) {
			console.error("Failed to fetch song rating:", error);
		}
	}

	const fetchSongComments = async () => {
		try {
			const response = await SongService.getCommentsByID(songID, "song");
			const data = response.data;
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
			await SongService.updateRating(user.username, newRating, songID, "song")
			// refetch songRating
			fetchSongRating()
		} else {
			setRating(0);
			alert("login to rate!")
		}
  };

  const handleAddComment = async (comment) => {
		if (AuthService.getCurrentUser() !== null) {
			await SongService.addComment(user.username, comment, songID,  "song")
			// refetch songComments
			fetchSongComments()
			return true
		} else {
			alert("login to comment!")
			return false
		}
  };

  return (
    <div className="song-page-container">
      {song ? (
        <div className="song-details">
          <div className="song-info-container">
            <h1 className="song-title">{song.title}</h1>
            <h3 className="artist" onClick={() => {setSelectArtist(song.artistID)}}>{artist}</h3>
            <p className="album">Album:
				<Link to={`/album/${albumID}`} className="album-link">
					{" " + albumID}
				</Link>
			</p>
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
            <div className="comments-container">
              <Comments comments={comments} onAddComment={handleAddComment}/>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
      <Link to="/homepage" className="back-button">
        Back to Songs
      </Link>
			{selectArtist && (
        <>
          <div className="modal-backdrop fade show"></div>
          <ArtistModal
            artistID={selectArtist}
            onClose={() => {setSelectArtist("")}}
            fetchFollowingList={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default SongPage;

