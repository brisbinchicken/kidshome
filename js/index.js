document.addEventListener("DOMContentLoaded", function (event) {
    startTime()
    prepSpeechRecognition()
    prepSearchHandling();
});

// The default config the user starts with, also the config used when a user resets the config
const defaultConfig = `{
    "bookmarks": [
        {
            "category": "Streaming",
            "bookmarks": [
                { "label": "YouTube",               "url": "https://www.youtube.com" },
                { "label": "Netflix",               "url": "https://www.netflix.com" },
                { "label": "Stan",                  "url": "https://www.stan.com.au" },
                { "label": "Kayo Sports",           "url": "https://kayosports.com.au/" }
            ]
        },
        {
            "category": "Pirate Streaming",
            "bookmarks": [
                { "label": "Movies/TV HQ",              "url": "https://www3.musichq.net/" },
                { "label": "Flixtor",                   "url": "https://flixtor.video/home" },
                { "label": "Watch Cartoons",            "url": "https://www.wco.tv/" },
                { "label": "Sports Urge",            "url": "https://sportsurge.net/#/groups/0" }
            ]
        },
        {
            "category": "Utilities",
            "bookmarks": [
                { "label": "Proton Mail",               "url": "https://mail.protonmail.com/u/0/inbox" },
                { "label": "Photopea",                  "url": "https://www.photopea.com/" },
                { "label": "The Pirate Bay",            "url": "https://thepiratebay.org/index.html" },
                { "label": "Spotify",                   "url": "https://open.spotify.com/" }
            ]
        },
        {
            "category": "Other",
            "bookmarks": [
                { "label": "ABC News",                  "url": "https://www.abc.net.au/news/" },
                { "label": "r/piracy",                  "url": "https://www.reddit.com/r/Piracy/" },
                { "label": "Freeview TV",               "url": "https://www.freeview.com.au/watch-tv" },
                { "label": "Bureau of Meteorology",     "url": "https://bit.ly/3y7hFKk" }
            ]
        }
    ],

    "bookmarkOptions": {
        "alwaysOpenInNewTab": true,
        "useFaviconKit": false
    },

    "voiceReg": {
        "enabled": true,
        "language": "en-US"
    },

    "glass": {
        "background": "rgba(47, 43, 48, 0.568)",
        "backgroundHover": "rgba(47, 43, 48, 0.568)",
        "editorBackground": "rgba(0,0,0, 0.868)",
        "blur": 12
    },

    "background": {
        "url": "https://wallpaper.dog/large/10714944.jpg",
        "snow": {
            "enabled": false,
            "count": 200
        },
        "mist": {
            "enabled": false,
            "opacity": 5
        },
        "css": "filter: blur(0px) saturate(150%); transform: scale(1.1); opacity: 1"
    }
}`;


// The user config is merged with this one to make sure some important bits aren't missing
const baseConfig = `{
    "bookmarks": [
        
    ],

    "bookmarkOptions": {
        "alwaysOpenInNewTab": true,
        "useFaviconKit": false
    },


    "voiceReg": {
        "enabled": true,
        "language": "en-US"
    },

    "glass": {
        "background": "rgba(47, 43, 48, 0.568)",
        "backgroundHover": "rgba(47, 43, 48, 0.568)",
        "editorBackground": "rgba(0,0,0, 0.868)",
        "blur": 12
    },

    "background": {
        "url": "https://wallpaperaccess.com/full/203514.jpg",
        "snow": {
            "enabled": false,
            "count": 200
        },
        "mist": {
            "enabled": false,
            "opacity": 5
        },
        "css": ""
    }
}`;


const configLoad = JSON.parse(localStorage.getItem('saferoom_config') ?? defaultConfig);
const config = Object.assign(JSON.parse(baseConfig), configLoad)
console.log(config);


// -------------------------------------------------------------------------
//  Clockwork
// -------------------------------------------------------------------------

function startTime() {

    var today = new Date();

    let elem = document.getElementById('Clock');
    let elemDate = document.getElementById('Date');

    if (elem) {
        elem.innerHTML =  today.toLocaleTimeString();
    }

    if (elemDate) {
        elemDate.innerHTML = today.toLocaleTimeString();
        elemDate.innerHTML = today.toUTCString().split(' ').slice(0, 4).join(' ')
    }
    
    var t = setTimeout(startTime, 500);
}

// -------------------------------------------------------------------------
//  Google search
// -------------------------------------------------------------------------

const searchElem = document.getElementById('Search_Input'); 

function searchForPhrase(phrase, replace = false) {
    // if(replace) document.getElementById('Search_Input').value = phrase;
    window.open(`https://www.google.com/search?q=${phrase}`, '_blank');
}


function prepSearchHandling(e) {
    const searchElem = document.getElementById('Search_Input'); 

    searchElem.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            searchForPhrase(searchElem.value);
        }
    });
}


// -------------------------------------------------------------------------
//  Speech recognition for google search
// -------------------------------------------------------------------------

var activeSpeech = false;
var recognitionHandle;

let toggleVoiceRecognition = () => {

    if(!config.voiceReg.enabled) return;

    let elem = document.getElementById('Search_VoiceRecognition');

    if(activeSpeech) {
        recognitionHandle.stop();
        elem.innerHTML = '<i class="bi bi-mic"></i>';
        activeSpeech = false;
    } else {
        recognitionHandle.start();
        elem.innerHTML = '<i class="bi bi-mic-mute"></i>';
        activeSpeech = true;
    }

}

// TODO: Fixed buggy toggling on the button
function prepSpeechRecognition() {

    // Don't init anything if voiceReg is disabled
    if(!config.voiceReg.enabled) return;

    try {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new SpeechRecognition();
        recognition.lang = config.voiceReg.language ?? 'en-US';

        recognitionHandle = recognition;
    }
    catch (e) {
        console.error(e);
        return;
    }

    recognition.onstart = function () {
        let elem = document.getElementById('Search_VoiceRecognition');
        elem.innerHTML = '<i class="bi bi-mic-mute"></i>';
    }

    recognition.onspeechend = function () {
        let elem = document.getElementById('Search_VoiceRecognition');
        elem.innerHTML = '<i class="bi bi-mic"></i>';
        activeSpeech = false;
    }

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            console.log('No speech was detected. Try again.');
        };

        let elem = document.getElementById('Search_VoiceRecognition');
        elem.innerHTML = '<i class="bi bi-mic"></i>';
        activeSpeech = false;
    }

    recognition.onresult = function (event) {
        activeSpeech = false;
        var transcript = event.results[event.resultIndex][0].transcript;
        console.log(transcript)
        searchForPhrase(transcript, false);
    }

    let elem = document.getElementById('Search_VoiceRecognition');
    elem.onclick = () => toggleVoiceRecognition();
}

// -------------------------------------------------------------------------
//  Focus on the search input when pressing anykey if not already focused
// -------------------------------------------------------------------------

let allowKeyboard = false;

document.addEventListener("keydown", (e) => {

    if(allowKeyboard) return;

    if( e.keyCode === 18 ) {
        e.preventDefault();
        toggleVoiceRecognition();   
    } else document.getElementById('Search_Input')?.focus();
}, false);

