import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:3000/";

const getUserBoard = () => {
  return axios.get(API_URL + "user", { headers: authHeader() });
};

const getUserPlaylists = (username) => {
  let params = {
		username: username
  }
  return axios.get(API_URL + "user_playlist", {
    headers: authHeader(),
    params: params
  });
}

const getFriendsList = (username) => {
  let params = {
		username: username
  }
  return axios.get(API_URL + "friends", {
    headers: authHeader(),
    params: params
  });
}

const getFollowingList = (username) => {
  let params = {
		username: username
  }
  return axios.get(API_URL + "following", {
    headers: authHeader(),
    params: params
  });
}

const getUserList = (username) => {
  let params = {
		username: username
  }
  return axios.get(API_URL + "users", {
    headers: authHeader(),
    params: params
  });
}

const getArtistList = (artistname) => {
  let params = {
		artistname: artistname
  }
  return axios.get(API_URL + "artists", {
    headers: authHeader(),
    params: params
  });
}

const getUser = (username) => {
  let params = {
		username: username
  }
  return axios.get(API_URL + "user", {
    headers: authHeader(),
    params: params
  }); 
}

const getArtist = (artistID) => {
  let params = {
		artistID: artistID
  }
  return axios.get(API_URL + "artist", {
    headers: authHeader(),
    params: params
  }); 
}

const getFriendStatus = (username, friendName) => {
  let params = {
    username: username,
		friendName: friendName
  }
  return axios.get(API_URL + "friendStatus", {
    headers: authHeader(),
    params: params
  }); 
}

const getFollowingStatus = (username, artistID) => {
  let params = {
    username: username,
		artistID: artistID
  }
  return axios.get(API_URL + "followingStatus", {
    headers: authHeader(),
    params: params
  }); 
}

const updateFriend = (username, friendname, friendStatus) => {
  let data = {
    action: 'update',
    user1: friendStatus.user1,
    user2: friendStatus.user2,
    acceptStatus: friendStatus.acceptStatus,
    requestSentBy: friendStatus.requestSentBy,
    createdAt: friendStatus.createdAt
  }
  if (friendStatus.acceptStatus !== undefined) {
    // unfriend
    if (friendStatus.acceptStatus === 'Accepted') {
      data.action = 'remove'
    } 
    // accept
    else if (friendStatus.acceptStatus === 'Pending' && friendStatus.requestSentBy !== username) {
      data.acceptStatus = 'Accepted'
    } 
  } 
  // add friend
  else {
    data.user1 = username
    data.user2 = friendname
    data.acceptStatus = 'Pending'
    data.requestSentBy = username
  }
  console.log(data)
  return axios.post(API_URL + "updateFriend", data, { 
		headers: authHeader()
	})
}

const updateFollowing = (username, artistID, followingStatus) => {
  let data = {
    action: 'follow',
    username: username,
    artistID: artistID,
  }
  if (followingStatus === true) {
    data.action = 'unfollow'
  }
  return axios.post(API_URL + "updateFollowing", data, { 
		headers: authHeader()
	})
}

const getNotices = (username) => {
  let params = {
    username: username,
  }
  return axios.get(API_URL + "notices", {
    headers: authHeader(),
    params: params
  }); 
}

const UserService = {
  getUserBoard,
  getUserPlaylists,
  getFriendsList,
  getFollowingList,
  getUserList,
  getArtistList,
  getUser,
  getArtist,
  getFriendStatus,
  getFollowingStatus,
  updateFriend,
  updateFollowing,
  getNotices
};

export default UserService;
