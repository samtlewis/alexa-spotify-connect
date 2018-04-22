# alexa-spotify-connect (Connect Control for Spotify)

## FORKED FROM https://github.com/thorpelawrence/alexa-spotify-connect 
The purpose of this fork is to limit the devices controller to a single device, specified at the top of `connect.js`.
This means that the user doesn't have to list devices, specify a device etc - whenever a song is played, it is played to this device.

## Dev / deployment details
1. Make a Spotify developer app at developer.spotify.com, get a client ID and client secret
2. Make a new Amazon Alexa skill, custom. Lots of details omitted here, but: once you get to the part in the Alexa developer console where you can upload/paste in JSON, then check out `skill/skill.json`
3. Account linking on Alexa skill: turn it on, choose "Auth Code Grant", set Authorization URI to "https://accounts.spotify.com/authorize", set "Access Token URI" to "https://accounts.spotify.com/api/token", set client ID and secret, add scopes "user-read-playback-state" and "user-modify-playback-state", add three redirect URIs:
https://alexa.amazon.co.jp/api/skill/link/M1OP8C9N8NBYP7
https://pitangui.amazon.com/api/skill/link/M1OP8C9N8NBYP7
https://layla.amazon.com/api/skill/link/M1OP8C9N8NBYP7
4. Deploy this webapp to somewhere that supports https, ie. heroku

## License
[MIT](LICENSE)

## Disclaimer
This product is not endorsed, certified or otherwise approved in any way by Spotify. Spotify is the registered trade mark of the Spotify Group.
