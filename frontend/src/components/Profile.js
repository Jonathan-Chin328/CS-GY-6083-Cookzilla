import React, { useState, useEffect } from "react";
import { Navigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import SongService from "../services/song.service";
import SongList from "./SongList";
import { UserModal, ArtistModal } from "./Modal";

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songList, setSongList] = useState([]);
  const [selectComponent, setSelectComponent] = useState(window.location.hash)
  // friend
  const [friendsList, setFriendsList] = useState([])
  const [followingList, setFollowingList] = useState([])
  // friends
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [userList, setUserList] = useState([])
  const [selectUser, setSelectUser] = useState("")
  // following
  const [searchArtistQuery, setSearchArtistQuery] = useState('')
  const [artistList, setArtistList] = useState([])
  const [selectArtist, setSelectArtist] = useState("")
  // upload
  const [newTitle, setNewTitle] = useState('')
  const [newfname, setNewfname] = useState('')
  const [newlname, setNewlname] = useState('')
  const [newAlbum, setNewAlbum] = useState('')
  const [newURL, setNewURL] = useState('')

  useEffect(() => {
    if (selectComponent === "#playlist" || selectComponent === "") {
      fetchPlaylists();
    }
    if (selectComponent === "#friends") {
      fetchFriendsList();
    } else if (selectComponent === "#following") {
      fetchFollowingList()
    }
  }, [selectComponent])

  useEffect(() => {
    if (selectedPlaylist) {
      fetchSongsByPlaylistID();
    }
  }, [selectedPlaylist])

  // playlist
  const fetchPlaylists = () => {
    // Fetch user playlists when the component mounts
    UserService.getUserPlaylists(currentUser.username)
      .then(response => {
        setPlaylists(response.data);
        if (response.data.length > 0) {
          setSelectedPlaylist(response.data[0]);
        }
      })
      .catch(error => {
        // Handle error
        console.log(error);
      });
  }

  const fetchSongsByPlaylistID = () => {
    SongService.getSongByPlaylistID(selectedPlaylist.playlistID)
    .then(response => {
      setSongList(response.data);
    })
    .catch(error => {
      // Handle error
      console.log(error);
    });
  }

  const handlePlaylistChange = (event) => {
    // Update selected playlist and fetch songs for the selected playlist
    const playlistID = parseInt(event.target.value);
    const selectedPlaylist = playlists.find(playlist => playlist.playlistID === playlistID);
    setSelectedPlaylist(selectedPlaylist);
  }

  // friends
  const fetchFriendsList = () => {
    UserService.getFriendsList(currentUser.username)
    .then(response => {
      setFriendsList(response.data)
    })
    .catch(error => {
      console.log(error);
    })
  }
  
  const fetchUserList = () => {
    UserService.getUserList(searchUserQuery)
    .then(response => {
      setUserList(response.data)
    })
    .catch(error => {
      console.log(error);
    })
  }
  
  // following
  const fetchFollowingList = () => {
    UserService.getFollowingList(currentUser.username)
    .then(response => {
      setFollowingList(response.data)
    })
    .catch(error => {
      console.log(error);
    })
  }

  const fetchArtistList = () => {
    UserService.getArtistList(searchArtistQuery)
    .then(response => {
      setArtistList(response.data)
    })
    .catch(error => {
      console.log(error);
    })
  }

  // upload
  const handleUploadSong = () => {
    console.log('upload')
    console.log(newTitle, newfname, newlname, newAlbum, newURL)
    SongService.uploadSong(newTitle, newfname, newlname, newAlbum, newURL)
  }
  
  if(!currentUser) {
    return <Navigate to="/login" replace={true} />
  }

  // render part
  const renderPlaylistContent = () => {
    return (
      <div>
        <div className="mt-1 mb-4">
          <h4>Playlists</h4>
          {playlists.length === 0 ? (
            <p className="no-list">No playlist yet</p>
          ) : (
            <select className="form-control w-25" value={selectedPlaylist ? selectedPlaylist.playlistID : ''} onChange={handlePlaylistChange}>
              {playlists.map(playlist => (
                <option key={playlist.playlistID} value={playlist.playlistID}>
                  {playlist.playlistName}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          {selectedPlaylist && (
            <div>
              <h4>Songs in {selectedPlaylist.playlistName}</h4>
              <SongList songs={songList}/>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFriendsContent = () => {
    return (
      <div>
        <h4>Friends</h4>
        <div className="row mt-3">
          <div className="col-md-6">
            {friendsList.length === 0 ? (
              <p className="no-list">Get some new friends!</p>
            ) : (
              <ul className="list-group list-group-flush">
                {friendsList.map(friend => (
                  <li key={friend.username} className="list-group-item" onClick={() => {setSelectUser(friend.username)}}>
                    {friend.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-md-6 justify-content-end">
            <form className="form-inline">
              <input 
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)} 
                className="form-control mr-sm-3 flex-grow-1" 
                type="search" 
                placeholder="Search User" 
                aria-label="Search"/>
              <button onClick={fetchUserList} className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
            <div className="row mt-3"></div>
            {userList.length !== 0 ? (
              <button type="button" className="close" aria-label="Close" onClick={() => {setUserList([])}}>
                  <span aria-hidden="true">&times;</span>
              </button>
            ) : (<div></div>)}
            <ul className="list-group list-group-flush">
              {userList.map(user => (
                <li key={user.username} className="list-group-item" onClick={() => {setSelectUser(user.username)}}>
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {selectUser && (
          <>
            <div className="modal-backdrop fade show"></div>
            <UserModal
              username={selectUser}
              onClose={() => {setSelectUser("")}}
              fetchFriendsList={fetchFriendsList}
            />
          </>
        )}
      </div>
    );
  }

  const renderFollowingContent = () => {
    return (
      <div>
        <h4>Following</h4>
        <div className="row mt-3">
          <div className="col-md-6">
            {followingList.length === 0 ? (
              <p className="no-list">No following artist</p>
            ) : (
              <ul className="list-group">
                {followingList.map(following => (
                  <li key={following.artistID} className="list-group-item" onClick={() => {setSelectArtist(following.artistID)}}>
                    {following.fname + " " + following.lname}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-md-6 justify-content-end">
            <form className="form-inline">
              <input 
                value={searchArtistQuery}
                onChange={(e) => setSearchArtistQuery(e.target.value)} 
                className="form-control mr-sm-3 flex-grow-1" 
                type="search" 
                placeholder="Search Artist" 
                aria-label="Search"/>
              <button onClick={fetchArtistList} className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
            <div className="row mt-3"></div>
            {artistList.length !== 0 ? (
              <button type="button" className="close" aria-label="Close" onClick={() => {setArtistList([])}}>
                  <span aria-hidden="true">&times;</span>
              </button>
            ) : (<div></div>)}
            <ul className="list-group list-group-flush">
              {artistList.map(artist => (
                <li key={artist.artistID} className="list-group-item" onClick={() => {setSelectArtist(artist.artistID)}}>
                  {artist.fname + " " + artist.lname}
                </li>
              ))}
            </ul>
            {selectArtist && (
              <>
                <div className="modal-backdrop fade show"></div>
                <ArtistModal
                  artistID={selectArtist}
                  onClose={() => {setSelectArtist("")}}
                  fetchFollowingList={fetchFollowingList}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderNoticesContent = () => {
    return (
      <div>
        <h4>Notices</h4>
        <div className="list-group mt-3">
          <a className="list-group-item list-group-item-action flex-column align-items-start">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">New Review</h5>
              <small className="text-muted">3 days ago</small>
            </div>
            <p className="mb-1">User review for the song title.</p>
            <small className="text-muted">Donec id elit non mi porta.</small>
          </a>
          <a className="list-group-item list-group-item-action flex-column align-items-start">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">New Song</h5>
              <small className="text-muted">3 days ago</small>
            </div>
            <p className="mb-1">Artist released new song.</p>
            <small className="text-muted">Donec id elit non mi porta.</small>
          </a>
          <a className="list-group-item list-group-item-action flex-column align-items-start">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">Friend request </h5>
              <small className="text-muted">3 days ago</small>
            </div>
            <div className="row">
              <div className="col">
                <p className="mb-1">User send you a friend request.</p>
                <small className="text-muted">Donec id elit non mi porta.</small>
              </div>
              <div className="col d-flex justify-content-end">
                <button type="button" className="btn btn-outline-danger mt-1 mb-2 mr-2">Refuse</button>
                <button type="button" className="btn btn-outline-primary mt-1 mb-2 mr-2">Accept</button>
              </div>
            </div>
          </a>
        </div>
        <div className="form-row mt-5"></div>
      </div>
    );
  }

  const renderUploadContent = () => {
    return (
      <div>
        <h4>Upload</h4>
        <form className="mt-3">
          <div className="form-group">
            <label>Title:</label>
            <input type="text" className="form-control" placeholder="Title" value={newTitle} onChange={(event) => {setNewTitle(event.target.value)}}/>
          </div>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Artist:</label>
              <input type="text" className="form-control" placeholder="fname" value={newfname} onChange={(event) => {setNewfname(event.target.value)}}/>
            </div>
            <div className="form-group col-md-4">
              <label>&nbsp;</label>
              <input type="text" className="form-control" placeholder="lname" value={newlname} onChange={(event) => {setNewlname(event.target.value)}}/>
            </div>
            <div className="form-group col-md-4">
              <label>Album:</label>
              <input type="text" className="form-control" placeholder="Album" value={newAlbum} onChange={(event) => {setNewAlbum(event.target.value)}}/>
            </div>
          </div>
          <div className="form-group">
            <label>Song URL:</label>
            <input type="text" className="form-control" placeholder="URL" value={newURL} onChange={(event) => {setNewURL(event.target.value)}}/>
          </div>
          <div className="form-group">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="gridCheck"/>
              <label className="form-check-label">
                Schedule upload time
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" onClick={handleUploadSong}>Upload</button>
          <div className="form-row mt-5"></div>
        </form>
      </div>
    );
  }

  const renderHerfContent = () => {
    switch (selectComponent) {
      case "#playlist":
        return renderPlaylistContent();
      case "#friends":
        return renderFriendsContent();
      case "#following":
        return renderFollowingContent();
      case "#notices":
        return renderNoticesContent();
      case "#upload":
        return renderUploadContent();
      default:
        return renderPlaylistContent();
    }
  }

  return (
    <div className="container">
      {/* Region 1 */}
      <div >
        <header className="jumbotron">
          <h3>
            <strong>{currentUser.username}</strong> Profile
          </h3>
        </header>
        <p>
          <strong>Token:</strong> {currentUser.token.substring(0, 20)} ...{" "}
          {currentUser.token.substr(currentUser.token.length - 20)}
        </p>
        <p>
          <strong>userName: </strong> {currentUser.username}
        </p>
        <hr className="custom-hr"></hr>
      </div>
      <div className="row mt-3">
        {/* sidebar part */}
        <div className="col-md-2">
          <div className="bg-light sidebar">
            <nav className="nav flex-column">
              <a className="nav-link nav-link-custom" href="#playlist" onClick={() => {setSelectComponent("#playlist")}}>
                Playlists
              </a>
              <a className="nav-link nav-link-custom" href="#friends" onClick={() => {setSelectComponent("#friends")}}>
                Friends
              </a>
              <a className="nav-link nav-link-custom" href="#following" onClick={() => {setSelectComponent("#following")}}>
                Following
              </a>
              <a className="nav-link nav-link-custom d-flex justify-content-between align-items-center" href="#notices" onClick={() => {setSelectComponent("#notices")}}>
                Notices
                <span className="badge badge-primary badge-pill">3</span>
              </a>
              <a className="nav-link nav-link-custom" href="#upload" onClick={() => {setSelectComponent("#upload")}}>
                Upload
              </a>
            </nav>
          </div>
        </div>
        {/* sidebar item part */}
        <div className="col-md-10">
          {renderHerfContent()}
        </div>
      </div>
    </div>
  );
  
};

export default Profile;
