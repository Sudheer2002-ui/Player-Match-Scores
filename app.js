const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
let db = null
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const inializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost3000')
    })
  } catch (e) {
    console.log(`DB Eroor:${e.message}`)
  }
}
inializeDBAndServer()
app.get('/players/', async (request, response) => {
  const query = `select player_id as playerId,player_name as playerName from player_details`
  const playerList = await db.all(query)
  response.send(playerList)
})
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `select player_id as playerId ,player_name as playerName from player_details where player_id=${playerId}`
  const player = await db.get(query)
  response.send(player)
})
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const query = `update player_details set player_name ='${playerName}' where player_id=${playerId}`
  await db.run(query)
  response.send('Player Details Updated')
})
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `select match_id as matchId,match,year from match_details where match_id= ${matchId}`
  const matchDetails = await db.get(query)
  response.send(matchDetails)
})
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const query = `select match_id as matchId,match,year from player_match_score natural join match_details where player_id=${playerId}`
  const playerMatches = await db.all(query)
  response.send(playerMatches)
})
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const query = `select player_details.player_id as playerId,player_details.player_name as playerName from player_details join player_match_score on player_details.player_id=player_match_score.player_id where player_match_score.match_id=${matchId}`
  const specificMatch = await db.all(query)
  response.send(specificMatch)
})
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const query = `select player_details.player_id as playerId,player_name as playerName,sum(score) as totalScore,sum(fours)as totalFours,sum(sixes) as totalSixes from player_match_score join player_details on player_match_score.player_id=player_details.player_id where player_details.player_id=${playerId} group by playerId`
  const stats = await db.get(query)
  response.send(stats)
})
module.exports = app
