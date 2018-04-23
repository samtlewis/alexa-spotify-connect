var alexa = require('alexa-app');
var request = require('request-promise-native');
var express = require('express');
var i18n = require('i18n');

// DEVICE NAME
var deviceNameToUse = 'Living Room';

// MAX VOLUME WHEN TRANSFERRING PLAYBACK (you can still manually set volume higher than this), 0-100
var maxVolumePercent = 60;

// END CONFIGURABLE ITEMS

// Create instance of express
var express_app = express();
// Create instance of alexa-app
var app = new alexa.app('connect');
// Bind alexa-app to express instance
app.express({
    debug: true, // comment this line out for production/distribution
    checkCert: false, // comment this line out for production/distribution
    expressApp: express_app
});

i18n.configure({
    directory: __dirname + '/locales'
});

var pause = function (req, res) {
    // PUT to Spotify REST API
    return request.put("https://api.spotify.com/v1/me/player/pause", {
        resolveWithFullResponse: true
    }).auth(null, null, true, req.getSession().details.user.accessToken)
        .then((r) => {
            req.getSession().set("statusCode", r.statusCode);
            res.say(i18n.__("Paused."));
        }).catch((err) => {
            if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
        });
}

// Run every time the skill is accessed
app.pre = function (req, res, type) {
    const applicationId = require('./package.json').alexa.applicationId;
    i18n.setLocale(req.data.request.locale || "en-GB");
    // Error if the application ID of the request is not for this skill
    if (req.applicationId != applicationId &&
        req.getSession().details.application.applicationId != applicationId) {
        throw "Invalid applicationId";
    }
    // Check that the user has an access token, if they have linked their account
    if (!(req.context.System.user.accessToken || req.getSession().details.user.accessToken)) {
        res.say(i18n.__("Oops, please make sure you've linked your spotify account in the alexa app."));
        res.linkAccount();
    }
};

// Run after every request
app.post = function (req, res, type, exception) {
    if (exception) {
        return res.clear().say(i18n.__("An error occured: ") + exception).send();
    }
};

// Function for when skill is invoked without intent
app.launch(function (req, res) {
    res.say(i18n.__("I can control your spotify connect device called " + deviceNameToUse));
    // Keep session open
    res.shouldEndSession(false);
});

// Handle default Amazon help intent
// No slots or utterances required
app.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
}, function (req, res) {
    res.say(i18n.__("When you have music playing, ask me to play and I'll transfer it to your Spotify connect device called " + deviceNameToUse))
        .reprompt(i18n.__("What would you like to do?"));
    // Keep session open
    res.shouldEndSession(false);
});

// Handle default Amazon stop intent
// No slots or utterances required
app.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
}, 
    pause
);

// Handle default Amazon cancel intent
// No slots or utterances required
app.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
}, function (req, res) {
    return;
});

// Handle resume intent
// No slots required
app.intent('ResumeIntent', {
    "utterances": [
        "resume",
        "continue",
        "unpause"
    ]
},
    function (req, res) {
        // PUT to Spotify REST API
        var statusCode;
        return request.put("https://api.spotify.com/v1/me/player/play", {
            resolveWithFullResponse: true
        }).auth(null, null, true, req.getSession().details.user.accessToken)
            .then((r) => {
                req.getSession().set("statusCode", r.statusCode);
                res.say(i18n.__("Unpaused."));
            }).catch((err) => {
                if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
            });
    }
);

// Handle pause intent
// No slots required
app.intent('PauseIntent', {
    "utterances": [
        "pause"
    ]
},
    pause
);

// Handle skip next intent
// No slots required
app.intent('SkipNextIntent', {
    "utterances": [
        "skip",
        "next",
        "forwards"
    ]
},
    function (req, res) {
        // POST to Spotify REST API
        return request.post("https://api.spotify.com/v1/me/player/next", {
            resolveWithFullResponse: true
        }).auth(null, null, true, req.getSession().details.user.accessToken)
            .then((r) => {
                req.getSession().set("statusCode", r.statusCode);
                res.say(i18n.__("Skipping to the next song."));
            }).catch((err) => {
                if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
            });
    }
);

// Handle skip previous intent
// No slots required
app.intent('SkipPreviousIntent', {
    "utterances": [
        "previous",
        "last",
        "back",
        "backwards"
    ]
},
    function (req, res) {
        // POST to Spotify REST API
        return request.post("https://api.spotify.com/v1/me/player/previous", {
            resolveWithFullResponse: true
        }).auth(null, null, true, req.getSession().details.user.accessToken)
            .then((r) => {
                req.getSession().set("statusCode", r.statusCode);
                res.say(i18n.__("Going back a song."));
            }).catch((err) => {
                if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
            });
    }
);

// Handle volume level intent
// Slot for new volume
app.intent('VolumeLevelIntent', {
    "slots": {
        "VOLUMELEVEL": "AMAZON.NUMBER"
    },
    "utterances": [
        "{set the|set|} volume {level|} {to|} {-|VOLUMELEVEL}"
    ]
},
    function (req, res) {
        // Check that request contains session
        if (req.hasSession()) {
            // Check that the slot has a value
            if (req.slot("VOLUMELEVEL")) {
                // Check if the slot is a number
                if (!isNaN(req.slot("VOLUMELEVEL"))) {
                    var volumeLevel = req.slot("VOLUMELEVEL");
                    // Check that the volume is valid
                    if (volumeLevel >= 0 && volumeLevel <= 10) {
                        // PUT to Spotify REST API
                        res.say(i18n.__("Volume " + volumeLevel));                
                        return request.put({
                            // Send new volume * 10 (convert to percentage)
                            url: "https://api.spotify.com/v1/me/player/volume?volume_percent=" + 10 * volumeLevel,
                            // Send access token as bearer auth
                            auth: {
                                "bearer": req.getSession().details.user.accessToken
                            },
                            // Handle sending as JSON
                            json: true
                        }).catch((err) => {
                            if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
                        });
                    }
                    else {
                        // If not valid volume
                        res.say(i18n.__("You can only set the volume between 0 and 10"));
                        // Keep session open
                        res.shouldEndSession(false);
                    }
                }
                else {
                    // Not a number
                    res.say(i18n.__("Try setting a volume between 0 and 10"))
                        .reprompt(i18n.__("What would you like to do?"));
                    // Keep session open
                    res.shouldEndSession(false);
                }
            }
            else {
                // No slot value
                res.say(i18n.__("I couldn't work out the volume to use."))
                    .say(i18n.__("Try setting a volume between 0 and 10"))
                    .reprompt(i18n.__("What would you like to do?"));
                // Keep session open
                res.shouldEndSession(false);
            }
        }
    }
);

// Handle play intent
// No slots required
app.intent('PlayIntent', {
    "utterances": [
        "play {the music|}",
        "transfer {playback|}"
    ]
},
    function (req, res) {
        // GET from Spotify REST API
        return request.get({
            url: "https://api.spotify.com/v1/me/player/devices",
            // Send access token as bearer auth
            auth: {
                "bearer": req.getSession().details.user.accessToken
            },
            // Parse results as JSON
            json: true
        })
            .then(function (body) {
                var devices = body.devices || [];
                var foundDevice;
                for (var i = 0; i < devices.length; i++) {
                    if (devices[i].name === deviceNameToUse) {
                        foundDevice = devices[i];
                    }
                }
                if (foundDevice) {
                    req.getSession().set("device", foundDevice);

                    var volume = foundDevice.volume_percent;
                    if (!volume) {
                        volume = 40;
                    }
                    volume = Math.max(volume, maxVolumePercent);

                    res.say(i18n.__("OK, volume " + (volume/10)));

                    // PUT to Spotify REST API
                    return request.put({
                        url: "https://api.spotify.com/v1/me/player",
                        // Send access token as bearer auth
                        auth: {
                            "bearer": req.getSession().details.user.accessToken
                        },
                        body: {
                            // Send device ID
                            "device_ids": [
                                foundDevice.id
                            ],
                            // Make sure that music plays
                            "play": true
                        },
                        // Handle sending as JSON
                        json: true
                    }).then((r) => {
                        return request.put({
                            // Set to volume 35%
                            url: "https://api.spotify.com/v1/me/player/volume?volume_percent=" + volume,
                            // Send access token as bearer auth
                            auth: {
                                "bearer": req.getSession().details.user.accessToken
                            },
                            body: {
                                // Send device ID
                                "device_ids": [
                                    foundDevice.id
                                ]
                            },
                            // Handle sending as JSON
                            json: true
                        }).then((r) => {
                            res.say(i18n.__("Status code is " + r.statusCode));
                        }).catch((err) => {
                            if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
                        });
                    }).catch((err) => {
                        if (err.statusCode === 403) res.say(i18n.__("Make sure your Spotify account is premium"));
                    });

                } else { // no foundDevice
                    res.say(i18n.__("I could not find the spotify connect device called " + deviceNameToUse));
                }
            })
            // Handle errors
            .catch(function (err) {
                req.getSession().set("statusCode", err.statusCode);
            });
    }
);

// Handle get track intent
// No slots required
app.intent('GetTrackIntent', {
    "utterances": [
        "{what is|what's} {playing|this song}",
        "what {song|track|} is this"
    ]
},
    function (req, res) {
        // GET from Spotify REST API
        return request.get({
            url: "https://api.spotify.com/v1/me/player/currently-playing",
            // Send access token as bearer auth
            auth: {
                "bearer": req.getSession().details.user.accessToken
            },
            // Parse results as JSON
            json: true
        })
            .then(function (body) {
                if (body.is_playing) {
                    res.say(i18n.__("This is {{name}} by {{artist}}", { name: body.item.name, artist: body.item.artists[0].name }));
                }
                else {
                    if (body.item.name) {
                        // If not playing but last track known
                        res.say(i18n.__("That was {{name}} by {{artist}}", { name: body.item.name, artist: body.item.artists[0].name }));
                    }
                    else {
                        // If unknown
                        res.say(i18n.__("Nothing is playing"));
                    }
                }
            })
            // Handle errors
            .catch(function (err) {
                req.getSession().set("statusCode", err.statusCode);
            });
    }
);

// Set up redirect to project page
express_app.use(express.static(__dirname));
/* istanbul ignore next */
express_app.get('/', function (req, res) {
    res.redirect('https://github.com/xaphod/alexa-spotify-connect');
});

/* istanbul ignore if */
// Only listen if run directly, not if required as a module
if (require.main === module) {
    var port = process.env.PORT || 8888;
    console.log("Listening on port " + port);
    express_app.listen(port);
}

// Export alexa-app instance for skill.js
module.exports = app;
