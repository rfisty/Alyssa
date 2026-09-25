// =======================================
// FIREBASE IMPORTS
// =======================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction,
    push,
    query,
    orderByChild,
    limitToLast
} from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";


// =======================================
// FIREBASE CONFIG
// =======================================


const firebaseConfig = {
    apiKey: "AIzaSyDPId8yKJTArlc_rbWfrvoaBDPNdgMc_PA",
    authDomain: "alyssa-eaf66.firebaseapp.com",
    projectId: "alyssa-eaf66",
    storageBucket: "alyssa-eaf66.firebasestorage.app",
    messagingSenderId: "78636237025",
    appId: "1:78636237025:web:9978bc7d39cd55f19d77a0"
};


// Start Firebase

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// This is the shared heart count in Firebase

const heartCountRef =
    ref(database, "heartCount");



// =======================================
// COUNT-UP TIMER
// =======================================

const startDate =
    new Date("2026-06-18T08:00:00");


const monthsElement =
    document.getElementById("months");

const daysElement =
    document.getElementById("days");

const hoursElement =
    document.getElementById("hours");

const minutesElement =
    document.getElementById("minutes");

const secondsElement =
    document.getElementById("seconds");



function updateTimer() {

    const now = new Date();


    if (now < startDate) {

        monthsElement.textContent = "0";

        daysElement.textContent = "0";

        hoursElement.textContent = "00";

        minutesElement.textContent = "00";

        secondsElement.textContent = "00";

        return;

    }


    let months =
        (now.getFullYear() - startDate.getFullYear()) * 12
        +
        (now.getMonth() - startDate.getMonth());


    let monthMarker =
        new Date(startDate);


    monthMarker.setMonth(
        monthMarker.getMonth() + months
    );


    if (monthMarker > now) {

        months--;

        monthMarker =
            new Date(startDate);

        monthMarker.setMonth(
            monthMarker.getMonth() + months
        );

    }


    let difference =
        now - monthMarker;


    const days =
        Math.floor(
            difference / 86400000
        );


    difference %=
        86400000;


    const hours =
        Math.floor(
            difference / 3600000
        );


    difference %=
        3600000;


    const minutes =
        Math.floor(
            difference / 60000
        );


    difference %=
        60000;


    const seconds =
        Math.floor(
            difference / 1000
        );


    monthsElement.textContent =
        months;


    daysElement.textContent =
        days;


    hoursElement.textContent =
        String(hours).padStart(
            2,
            "0"
        );


    minutesElement.textContent =
        String(minutes).padStart(
            2,
            "0"
        );


    secondsElement.textContent =
        String(seconds).padStart(
            2,
            "0"
        );

}


updateTimer();

setInterval(
    updateTimer,
    1000
);



// =======================================
// GLOBAL HEART COUNTER
// =======================================

const heartButton =
    document.getElementById("heartButton");

const heartCountElement =
    document.getElementById("heartCount");

const heartParticles =
    document.getElementById("heartParticles");



// =======================================
// LISTEN FOR COUNT CHANGES
// =======================================

// This runs whenever ANY device changes the count.

onValue(
    heartCountRef,
    function (snapshot) {

        const value =
            snapshot.val();

        heartCountElement.textContent =
            value ?? 0;

    }
);



// =======================================
// HEART CLICK
// =======================================

heartButton.addEventListener(
    "click",
    async function () {

        /*
          Atomically increase the shared
          Firebase counter.
    
          Using a transaction prevents
          simultaneous clicks from different
          devices from overwriting each other.
        */

        await runTransaction(
            heartCountRef,
            function (currentCount) {

                if (currentCount === null) {
                    return 1;
                }

                return currentCount + 1;

            }
        );


        // Restart heart animation

        heartButton.classList.remove(
            "clicked"
        );


        void heartButton.offsetWidth;


        heartButton.classList.add(
            "clicked"
        );


        // Floating hearts

        createHeartBurst();


        // Counter pop

        heartCountElement.animate(
            [
                {
                    transform: "scale(1)"
                },

                {
                    transform: "scale(1.25)"
                },

                {
                    transform: "scale(1)"
                }
            ],
            {
                duration: 300,

                easing: "ease-out"
            }
        );

    }
);



// =======================================
// REMOVE CLICK CLASS
// =======================================

heartButton.addEventListener(
    "animationend",
    function () {

        heartButton.classList.remove(
            "clicked"
        );

    }
);



// =======================================
// FLOATING HEART BURST
// =======================================

function createHeartBurst() {

    const amount = 10;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.classList.add(
            "particle"
        );


        particle.textContent =
            "♥";


        const x =
            Math.random() * 220 - 110;


        const y =
            -(
                Math.random() * 150
                +
                60
            );


        const rotation =
            Math.random() * 100 - 50;


        const delay =
            Math.random() * 0.08;


        particle.style.setProperty(
            "--x",
            `${x}px`
        );


        particle.style.setProperty(
            "--y",
            `${y}px`
        );


        particle.style.setProperty(
            "--rotation",
            `${rotation}deg`
        );


        particle.style.animationDelay =
            `${delay}s`;


        particle.style.fontSize =
            `${0.8
            +
            Math.random() * 1.3
            }rem`;


        heartParticles.appendChild(
            particle
        );


        setTimeout(
            function () {

                particle.remove();

            },
            1200
        );

    }

}

// =======================================
// SPOTIFY CURRENTLY PLAYING
// =======================================

const spotifyWorkerUrl =
    "https://aly-spotify.r1borisoff.workers.dev";


const spotifyCover =
    document.getElementById("spotifyCover");

const spotifyStatus =
    document.getElementById("spotifyStatus");

const spotifyTitle =
    document.getElementById("spotifyTitle");

const spotifyArtist =
    document.getElementById("spotifyArtist");



async function updateSpotify() {

    try {

        const currentSpotifyUrl =
            new URL("/current", spotifyWorkerUrl);

        currentSpotifyUrl.searchParams.set(
            "t",
            Date.now()
        );


        const response =
            await fetch(
                currentSpotifyUrl,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Spotify response:",
            data
        );


        // =====================================
        // NOT CONNECTED
        // =====================================

        if (data.connected !== true) {

            spotifyStatus.textContent =
                "Spotify not connected";

            spotifyTitle.textContent =
                "";

            spotifyArtist.textContent =
                "";

            spotifyCover.style.display =
                "none";

            return;
        }


        // =====================================
        // CONNECTED BUT NOTHING PLAYING
        // =====================================

        if (data.playing !== true) {

            spotifyStatus.textContent =
                "Not listening right now";

            spotifyTitle.textContent =
                "";

            spotifyArtist.textContent =
                "";

            spotifyCover.style.display =
                "none";

            return;
        }


        // =====================================
        // NOW PLAYING
        // =====================================

        spotifyStatus.textContent =
            "Now playing";


        spotifyTitle.textContent =
            data.title || "Unknown song";


        spotifyArtist.textContent =
            data.artist || "Unknown artist";


        // Album cover

        if (data.image) {

            spotifyCover.src =
                data.image;

            spotifyCover.alt =
                `${data.title || "Album"} cover`;

            spotifyCover.style.display =
                "block";

        } else {

            spotifyCover.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "Spotify error:",
            error
        );


        spotifyStatus.textContent =
            "Couldn't load Spotify";

        spotifyTitle.textContent =
            "";

        spotifyArtist.textContent =
            "";

        spotifyCover.style.display =
            "none";

    }

}



// Load immediately

updateSpotify();


// Refresh every 10 seconds

setInterval(
    updateSpotify,
    10000
);

// =======================================
// SHARED NOTE WALL
// =======================================

const noteForm =
  document.getElementById("noteForm");

const noteName =
  document.getElementById("noteName");

const noteText =
  document.getElementById("noteText");

const noteCharacters =
  document.getElementById("noteCharacters");

const notesList =
  document.getElementById("notesList");


// Firebase notes location

const notesRef =
  ref(database, "notes");


// Only load the latest 20 notes

const recentNotesQuery =
  query(
    notesRef,
    orderByChild("createdAt"),
    limitToLast(20)
  );



// =======================================
// REMEMBER NAME
// =======================================

const savedNoteName =
  localStorage.getItem("noteName");


if (savedNoteName) {
  noteName.value =
    savedNoteName;
}



noteName.addEventListener(
  "input",
  function () {

    localStorage.setItem(
      "noteName",
      noteName.value.trim()
    );

  }
);



// =======================================
// CHARACTER COUNTER
// =======================================

noteText.addEventListener(
  "input",
  function () {

    noteCharacters.textContent =
      `${noteText.value.length} / 200`;

  }
);



// =======================================
// SEND NOTE
// =======================================

noteForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const name =
      noteName.value.trim();

    const text =
      noteText.value.trim();


    if (!name || !text) {
      return;
    }


    if (
      name.length > 30 ||
      text.length > 200
    ) {
      return;
    }


    const button =
      noteForm.querySelector(
        ".note-button"
      );


    button.disabled = true;

    button.textContent =
      "Sending...";


    try {

      await push(
        notesRef,
        {
          name,
          text,
          createdAt:
            Date.now()
        }
      );


      // Keep the name,
      // clear only the message

      noteText.value =
        "";

      noteCharacters.textContent =
        "0 / 200";


    } catch (error) {

      console.error(
        "Could not send note:",
        error
      );

      button.textContent =
        "Try again";

      setTimeout(
        function () {

          button.textContent =
            "Leave note ♡";

        },
        1500
      );

      button.disabled = false;

      return;

    }


    button.textContent =
      "Sent ♡";


    setTimeout(
      function () {

        button.textContent =
          "Leave note ♡";

        button.disabled =
          false;

      },
      700
    );

  }
);



// =======================================
// LOAD NOTES LIVE
// =======================================

onValue(
  recentNotesQuery,
  function (snapshot) {

    const notes = [];


    snapshot.forEach(
      function (childSnapshot) {

        const note =
          childSnapshot.val();


        notes.push({
          id:
            childSnapshot.key,

          ...note
        });

      }
    );


    // Newest first

    notes.reverse();


    notesList.innerHTML =
      "";


    if (
      notes.length === 0
    ) {

      const empty =
        document.createElement(
          "p"
        );


      empty.className =
        "notes-empty";


      empty.textContent =
        "No notes yet ♡";


      notesList.appendChild(
        empty
      );


      return;

    }


    notes.forEach(
      function (note) {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "note-card";


        const top =
          document.createElement(
            "div"
          );


        top.className =
          "note-card-top";


        const author =
          document.createElement(
            "span"
          );


        author.className =
          "note-author";


        author.textContent =
          note.name;


        const date =
          document.createElement(
            "span"
          );


        date.className =
          "note-date";


        date.textContent =
          formatNoteDate(
            note.createdAt
          );


        const message =
          document.createElement(
            "p"
          );


        message.className =
          "note-message";


        /*
          textContent is intentional.

          Don't use innerHTML here because
          notes come from users.
        */

        message.textContent =
          note.text;


        top.appendChild(
          author
        );


        top.appendChild(
          date
        );


        card.appendChild(
          top
        );


        card.appendChild(
          message
        );


        notesList.appendChild(
          card
        );

      }
    );

  }
);



// =======================================
// DATE FORMATTER
// =======================================

function formatNoteDate(
  timestamp
) {

  if (!timestamp) {
    return "";
  }


  const date =
    new Date(timestamp);


  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric"
    }
  );

}