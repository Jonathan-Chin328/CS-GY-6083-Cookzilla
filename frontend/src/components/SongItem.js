import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SongService from "../services/song.service";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";
import { ArtistModal } from "./Modal";

const SongItem = ({ songItem }) => {
  const currentUser = AuthService.getCurrentUser();
  const [song, setSong] = useState(null)
  const [songID, setSongID] = useState(0);
  const [songTitle, setsongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [albumID, setalbumID] = useState("");
  const [releaseDate, setReleaseDate] = useState("")
  const [showModal, setShowModal] = useState(false);
  // for modal
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylist, setNewPlaylist] = useState('')
  // for artist modal
  const [selectArtist, setSelectArtist] = useState("")

  useEffect(() => {
    getSong(songItem.songID);
  }, [songItem])

  useEffect(() => {
    fetchPlaylists();
  }, [showModal]);

  const getSong = (songID) => {
    // Fetch song from backend API
    const fetchSong = async () => {
      try {
        const response = await SongService.getSongByID(songID);
        let data = response.data[0]
        if (data) {
          setSong(data)
          setSongID(data.songID)
          setsongTitle(data.title)
          setArtist(data.fname + " " +  data.lname)
          setalbumID(data.albumID)
          setReleaseDate(data.releaseDate)
        }
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSong();
  }

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

  const handlePlaylistChange = (event) => {
    const playlistID = parseInt(event.target.value);
    if (playlistID) {
      const selectedPlaylist = playlists.find(playlist => playlist.playlistID === playlistID);
      setSelectedPlaylist(selectedPlaylist);
    } else {
      setSelectedPlaylist('');
    }
  }

  const addToPlaylist = (event) => {
    console.log('add to playlist')
    if (selectedPlaylist !== '') {
      SongService.addSongToPlaylist(selectedPlaylist.playlistID, songID)
      setShowModal(!showModal);
    } else {
      // check newPlaylistName
      if (newPlaylist !== '') {
        // add new playlist
        SongService.addPlaylist(currentUser.username, newPlaylist)
          .then(response => {
            // add to playlist if succeed
            const data = response.data
            if (data.playlistID === null) {
              alert("The playlist already exist!")
            } else {
              SongService.addSongToPlaylist(data.playlistID, songID)
              setShowModal(!showModal);
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    }
  }

  const randomImage = () => {
    if (artist === 'Ed Sheeran') {
      return "song_pictures/song_3.jpeg";
    }
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    return "song_pictures/song_" + randomNumber + ".jpeg";
  }

  return (
    <div className="song-item">
      <img src={randomImage()} alt={""} />
      <div className="title-artist-container">
        <Link to={`/song/${songID}`}>
          <h3>{songTitle}</h3>
        </Link>
        <p onClick={() => {setSelectArtist(song.artistID)}} className="artist-name">{artist}</p>
      </div>
      <Link to={`/album/${albumID}`} className="album-link">
        <p>{albumID}</p>
      </Link>
      <p>{releaseDate ? releaseDate.split('T')[0] : ''}</p>
      <button onClick={() => {setShowModal(!showModal);}} className="song-item-add-btn">+</button>

      {/* Modal part*/}
      <div
        className={`modal fade${showModal ? " show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add 
                <span className="song-title">{" " + songTitle + " "}</span>
              To Playlists</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {setShowModal(!showModal);}}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
            <label htmlFor="playlistSelect">Choose a playlist:</label>
            <select id="playlistSelect" className="form-control" value={selectedPlaylist ? selectedPlaylist.playlistID : ''} onChange={handlePlaylistChange}>
              {playlists.map(playlist => (
                <option key={playlist.playlistID} value={playlist.playlistID}>
                  {playlist.playlistName}
                </option>
              ))}
              <option key={'add new playlist'} value={''}>
                Add new playlist
              </option>
            </select>
            <div className="mt-3"></div>
            {/* Render input field for new playlist name */}
            {selectedPlaylist === ''
              ? showModal && (
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Enter playlist name"
                value={newPlaylist}
                style={{ display: showModal ? "block" : "none" }}
                onChange={(e) => setNewPlaylist(e.target.value)}
              />)
              : <div></div>
            }
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-dismiss="modal" 
                onClick={() => {setShowModal(!showModal);}}>
                  Close
              </button>
              <button type="button" className="btn btn-primary" onClick={addToPlaylist}>Add</button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div
          className="modal-backdrop fade show"
          style={{ display: showModal ? "block" : "none" }}
        ></div>
      )}
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

export default SongItem;