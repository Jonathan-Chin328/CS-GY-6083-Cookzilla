import React, { useState, useEffect } from "react";
import SongList from "./SongList";
import SongService from "../services/song.service";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songList, setSongList] = useState([]);
  const [genre, setGenre] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [searchType, setSearchType] = useState("song");

  useEffect(() => {
    // Fetch recommended songs on component mount
    fetchSongList();
  }, []);

  const fetchSongList = () => {
    // Fetch recommended songs from backend API
    const fetchSongs = async () => {
      try {
				let params = {
					searchQuery: searchQuery,
					genre: genre,
					minRating: minRating,
					searchType: searchType
				}
        const response = await SongService.getSongs(params);
        console.log(response.data);
        setSongList(response.data);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };

    fetchSongs();
  };

  const handleSearch = () => {
    // Handle search when search button is clicked
    fetchSongList()
  };

  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Discover New Music</h1>
      <div className="homepage-search-container">
        <input 
          className="form-control mr-sm-2 custom-height" 
          type="search" 
          placeholder="Search" 
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="btn btn-outline-success my-2 my-sm-0 custom-height" type="submit">Search</button>
      </div>
      <div className="homepage-filter-panel">
        <div className="homepage-filter-container">
            <label htmlFor="genreSelect" className="homepage-filter-label">Select Genre:</label>
            <label htmlFor="minRatingSelect" className="homepage-filter-label">Minimum Rating:</label>
            <label htmlFor="searchTypeSelect" className="homepage-filter-label">Search Type:</label>
            <select
            id="genreSelect"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="form-control"
            >
            <option value="">All</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Country">Country</option>
            <option value="Soul">Soul</option>
            </select>
            <select
            id="minRatingSelect"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="form-control"
            >
            <option value="0">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            </select>
            <select
            id="searchTypeSelect"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-control"
            >
            <option value="song">song</option>
            <option value="artist">artist</option>
						<option value="album">album</option>
            </select>
        </div>
      </div>
      <h2 className="homepage-subtitle">Today's Top Hits</h2>
      <SongList songs={songList} />
    </div>
  );
};

export default HomePage;
