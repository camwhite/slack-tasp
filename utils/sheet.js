'use strict'

const google = require('googleapis')
const { writeFileSync } = require('fs')
const { Observable } = require('rxjs/Rx')
const { OAuth2 } = google.auth

const oauth2Client = new OAuth2(
  '569315794546-q3bms7hpsk1nlg8cvbg0dhdp8hg96g9n.apps.googleusercontent.com',
  'WDRpH1mueAWljbf8mq9CVYJy',
  'http://localhost:3333/oauth/callback'
)
const fileId = '1z_LAyApZ_g1f93iZbsULd9M6M15CnbWtTjHlLtg7Ey8'
const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
]
const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes

  // Optional property that passes state parameters to redirect URI
  // state: 'foo'
})
console.log(`Authorization URL: ${url}`)

class Sheet {

  constructor (auth) {
    const { tokens, code } = auth
    if (code) {
      oauth2Client.getToken(code, (err, tokens) => {
        // Now tokens contains an access_token and an optional refresh_token, to be saved.
        if (err) {
          throw err
        }
        oauth2Client.credentials = tokens
        google.options = {
          auth: oauth2Client
        }
        this.drive = google.drive('v3')
        writeFileSync('./tokens.json', JSON.stringify(tokens))
        this.subscribeToChanges()
      })
    } else {
      oauth2Client.credentials = tokens
      this.drive = google.drive({ version: 'v3', auth: oauth2Client })
      //this.drive.files.list((err, res) => console.log(res))
      this.drive.changes.getStartPageToken((err, res) => {
        this.drive.changes.watch({ pageToken: res.startPageToken }, (err, res) => {
          console.log(err, res)
        })
      })
    }
  }

  subscribeToChanges () {
    this.drive.files.watch({
      fileId,
      resource: {
        name: 'Test',
        mimeType: 'text/plain'
      }
    }, (err, res) => {
      console.log(err, res)
      return Observable.of(res)
    })
    }
  }

  module.exports = Sheet
