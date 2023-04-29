import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:3000/";

const getHitSong = () => {
	const params = {}
	return getSongs(params)
}

const getSongs = (params) => {
  return axios.get(API_URL + "songs", { 
    headers: authHeader(),
    params: params
  });
};

const getSongByID = (songID) => {
  let params = {
    songID: songID
  }
  return axios.get(API_URL + "song", { 
    headers: authHeader(),
    params: params
  });
}

const getRatingByID = (ID, type) => {
	let params = {
		type: type,
    ID: ID
  }
  return axios.get(API_URL + "rating", { 
    headers: authHeader(),
    params: params
  });
}

const getCommentsByID = (ID, type) => {
	let params = {
		type: type,
    ID: ID
  }
  return axios.get(API_URL + "comments", {
    headers: authHeader(),
    params: params
  });
}

const updateRating = (username, rating, ID, type) => {
	const data = {
    username: username,
    rating: rating,
    type: type,
    ID: ID
  };
	axios.post(API_URL + "rate", data, { 
		headers: authHeader()
	})
}

const addComment = (username, comment, ID, type) => {
	const data = {
    username: username,
    reviewText: comment,
    type: type,
    ID: ID
  };
	const response = axios.post(API_URL + "comment", data, { 
		headers: authHeader()
	})
	return response
}

// for album
const getSongsByAlbumID = (albumID) => {
	const params = {
		albumID: albumID
	}
  return axios.get(API_URL + "album", { 
    headers: authHeader(),
    params: params
  });
};

// for profile
const getSongByPlaylistID = (playlistID) => {
	const params = {
		playlistID: playlistID
	}
  return axios.get(API_URL + "playlist", { 
    headers: authHeader(),
    params: params
  });
}

// for playlist
const addPlaylist = (username, playlistName) => {
	const data = {
    username: username,
    playlistName: playlistName
  };
	return axios.post(API_URL + "addPlaylist", data, { 
		headers: authHeader()
	})
}

const addSongToPlaylist = (playlistID, songID) => {
	const data = {
    playlistID: playlistID,
    songID: songID
  };
	return axios.post(API_URL + "addSongToPlaylist", data, { 
		headers: authHeader()
	})
}

// for upload
const uploadSong = (title, fname, lname, album, url) => {
  const data = {
    title: title,
    fname: fname,
    lname: lname,
    album: album,
    url: url
  }
  return axios.post(API_URL + "uploadSong", data, { 
		headers: authHeader()
	})
}



const SongService = {
	getHitSong,
  getSongs,
  getSongByID,
	getRatingByID,
	getCommentsByID,
	updateRating,
	addComment,
	getSongsByAlbumID,
	getSongByPlaylistID,
	addPlaylist,
	addSongToPlaylist,
  uploadSong
};

export default SongService;