import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';

const UserModal = ({username, onClose, fetchFriendsList}) => {
	const currentUser = AuthService.getCurrentUser();
	const [user, setUser] = useState({})
	const [friendStatus, setFriendStatus] = useState({})

	useEffect(() => {
		if (username) {	
			fetchUser()
			fetchFriendStatus()
		}
	}, [username])

	const fetchUser = () => {
		UserService.getUser(username)
		.then(response => {
			setUser(response.data)
		})
		.catch(error => {
			console.log(error)
		})
	}

	const fetchFriendStatus = () => {
		UserService.getFriendStatus(currentUser.username, username)
		.then(response => {
			if (response.data.length !== 0) {
				setFriendStatus(response.data[0])
			}
		})
	}

	const handleAddFriend = () => {
		UserService.updateFriend(currentUser.username, username, friendStatus)
		.then(response => {
			fetchFriendsList()
		})
		.catch(error => {
			console.log(error)
		})
		onClose()
	}

	return (
		<div 
			className="modal fade show"
			style={{ display: "block"}}
		>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title" id="exampleModalLabel">{ username }</h4>
						<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<h5>
							{user.fname + " " + user.lname}
						</h5>
						<p>{ user.nickname }</p>
						<p>{ user.lastlogin ? user.lastlogin.split('T')[0] : '' }</p>
						{friendStatus.acceptStatus === 'Accepted'?  (
							<p>Status: Friend</p>
						): (
							friendStatus.acceptStatus === 'Pending' ? (
								<p>Status: Pending</p>
							) : (
								<p></p>
							)
						)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={onClose}>Close</button>
						<button onClick={handleAddFriend} type="button" className="btn btn-primary"
										disabled={currentUser.username === username ? true : false}>
							{friendStatus.acceptStatus === 'Accepted'? "Unfriend" : 
								friendStatus.acceptStatus === 'Pending' && friendStatus.requestSentBy !== currentUser.username
									? "Accept" : "Add friend"
							}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}



const FollowModal = ({username, onClose, fetchFriendsList}) => {
	const currentUser = AuthService.getCurrentUser();
	const [user, setUser] = useState({})
	const [followStatus, setFollowStatus] = useState(0)

	useEffect(() => {
		if (username) {	
			fetchUser()
			fetchFollowStatus()
		}
	}, [username])

	const fetchUser = () => {
		UserService.getUser(username)
		.then(response => {
			setUser(response.data)
		})
		.catch(error => {
			console.log(error)
		})
	}

	const fetchFollowStatus = () => {
		UserService.getMyFollowStatus(currentUser.username, username)
		.then(response => {
			if (response.data.length !== 0) {
				setFollowStatus(response.data)
			}
		})
	}

	const handleAddFollow = () => {
		UserService.updateMyFollowStatus(currentUser.username, username, followStatus ? 0: 1)
		.then(response => {
			fetchFriendsList()
		})
		.catch(error => {
			console.log(error)
		})
		onClose()
	}

	return (
		<div 
			className="modal fade show"
			style={{ display: "block"}}
		>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title" id="exampleModalLabel">{ username }</h4>
						<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<h5>
							{user.fname + " " + user.lname}
						</h5>
						<p>{ user.nickname }</p>
						<p>{ user.lastlogin ? user.lastlogin.split('T')[0] : '' }</p>
						{followStatus === 1 ?  (
							<p>Status: Follow</p>
						): (
							followStatus === 0 ? (
								<p>Status: unFollow</p>
							) : (
								<p></p>
							)
						)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={onClose}>Close</button>
						<button onClick={handleAddFollow} type="button" className="btn btn-primary"
										disabled={currentUser.username === username ? true : false}>
							{followStatus === 1? "UnFollow" : "Follow"}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

const ArtistModal = ({artistID, onClose, fetchFollowingList}) => {
	const currentUser = AuthService.getCurrentUser();
	const [artist, setArtist] = useState({})
	const [followingStatus, setFollowingStatus] = useState(false)

	useEffect(() => {
		if (artistID) {	
			fetchArtist()
			fetchFollowingStatus()
		}
	}, [artistID])

	const fetchArtist = () => {
		UserService.getArtist(artistID)
		.then(response => {
			setArtist(response.data)
		})
		.catch(error => {
			console.log(error)
		})
	}

	const fetchFollowingStatus = () => {
		UserService.getFollowingStatus(currentUser.username, artistID)
		.then(response => {
			if (response.data.length !== 0) {
				setFollowingStatus(true)
			}
		})
	}

	const handleFollowing = () => {
		UserService.updateFollowing(currentUser.username, artistID, followingStatus)
		.then(response => {
			fetchFollowingList()
		})
		.catch(error => {
			console.log(error)
		})
		onClose()
	}

	return (
		<div 
			className="modal fade show"
			style={{ display: "block"}}
		>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" id="exampleModalLabel">{ artist.fname + " " + artist.lname }</h5>
						<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<p>{ "Bio: " +  (artist.artistBio? artist.artistBio: "") }</p>
						<p>{ "URL: " + artist.artistURL }</p>
						{followingStatus? (
							<p>Status: following</p>
						): (
							<p></p>
						)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={onClose}>Close</button>
						<button onClick={handleFollowing} type="button" className="btn btn-primary">{followingStatus? "Unfollow" : "Follow"}</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export {UserModal, ArtistModal, FollowModal};