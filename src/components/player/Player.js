import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import api from "../../api";
import "./player.css";
function openFullscreen() {
  let elem = document.querySelector(".player-wrapper").parentElement;
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.requestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

export default () => {
  const [url, setUrl] = useState("");
  const [songs, setSongs] = useState([]);
  const [isPlayed, setIsPlayed] = useState(false);
  const songIdxPlayed = useRef(-1);
  const justOne = useRef(false);
  const [pending, setPending] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  const nextSong = force => {
    if (pending.length === 0) {
      if (songs.length > 0) {
        songIdxPlayed.current++;
        if (songIdxPlayed.current >= songs.length) {
          songIdxPlayed.current = 0;
        }
        console.log("nextSong-song", songs[songIdxPlayed.current].id);
        setPlayingId(songs[songIdxPlayed.current].id);
      }
    } else {
      const id = pending[0].id;
      console.log("nextSong-pending", id);
      fetch(api.playedSong(id))
        .then(response => response.json())
        .then(({ data }) => {
          setPlayingId(data.playedSong.id);
        });
    }
  };
  const AllSongs = () => {
    fetch(api.allSongs())
      .then(response => response.json())
      .then(({ data }) => {
        setSongs(data.Songs.filter(s => s.enable));
      });
  };
  const refreshPending = () => {
    console.log("refreshPending");
    fetch(api.requestedSongs())
      .then(response => response.json())
      .then(({ data }) => {
        setPending(data.Pending);
        setTimeout(_ => {
          refreshPending();
        }, 10000);
      });
  };
  const onEnded = _ => {
    console.log("onEnded", playingId);
    setIsPlayed(true);
  };
  const onError = _ => {
    console.log("onError", playingId);
    setIsPlayed(true);
  };

  useEffect(
    _ => {
      if (playingId) {
        const url = `https://www.youtube.com/watch?v=${playingId}`;
        console.log(url);
        setUrl(url);
      }
    },
    [playingId]
  );
  useEffect(
    _ => {
      nextSong();
    },
    [songs]
  );
  useEffect(
    _ => {
      if (isPlayed) {
        setIsPlayed(false);
        nextSong();
      }
    },
    [isPlayed, pending]
  );

  if (!justOne.current) {
    justOne.current = true;
    refreshPending();
    setTimeout(AllSongs, 3000);
  }
  return (
    <>
      <button onClick={openFullscreen}>Pantalla completa</button>
    <div>
      <div className="player-wrapper">
        <ReactPlayer
          className="react-player"
          width="80%"
          height="90%"
          url={url}
          onEnded={onEnded}
          onError={onError}
          controls={true}
          playing
        />
      </div>
      <div className="pending">
        {pending.map(s => (
          <h4 key={s.id}>{s.title}</h4>
        ))}
      </div>
    </div>
    </>
  );
};
