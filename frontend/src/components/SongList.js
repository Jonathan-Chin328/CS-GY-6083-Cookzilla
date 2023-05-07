import React from "react";
import SongItem from "./SongItem";

// Redirect to search results page with search query as URL parameter
// window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
const SongList = ({ songs, title }) => {
  return (
    <div className="song-list">
      {songs.length === 0 ? (
        <p>No songs found</p>
      ) : (
        <ul>
          <span>{title}</span>
          {songs.map((song) => (
						<li key={song.songID}>
							<SongItem songItem={song} />
						</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongList;
