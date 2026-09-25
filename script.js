// =======================================
// FIREBASE IMPORTS
// =======================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction
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

// CHANGE THIS TO YOUR CLOUDFLARE WORKER URL
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

const spotifyLink =
  document.getElementById("spotifyLink");



async function updateSpotify() {

  try {

    const response = await fetch(
      `${spotifyWorkerUrl}/current?t=${Date.now()}`,
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


    // Debug — check browser console
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

      spotifyLink.style.display =
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

      spotifyLink.style.display =
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


    // Album artwork

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


    // Spotify link

    if (data.spotifyUrl) {

      spotifyLink.href =
        data.spotifyUrl;

      spotifyLink.style.display =
        "inline-block";

    } else {

      spotifyLink.style.display =
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

    spotifyLink.style.display =
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