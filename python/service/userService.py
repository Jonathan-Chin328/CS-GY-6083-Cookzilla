from db.main import Database
import jwt
import os
import logging as logger
import datetime
from errors import internalServerError

class UserService():
    def __init__(self, db: Database):
       self.Database = db

    def updateLastLogin(self, data):
        db = self.Database
        try:
            query = ("UPDATE user\
                      SET lastlogin = CURRENT_TIMESTAMP\
                      WHERE username = %s;")
            values = (data.userName,)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to update lastlogin")
            raise internalServerError()
		
    def getUserPlaylist(self, request):
        db = self.Database
        username = request.query_params.get('username')
        try:
            query = ("SELECT * \
                      FROM userPlaylist\
                      WHERE username = %s")
            values = (username,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to add comment")
            raise internalServerError()
    
    def getSongsByPlaylist(self, request):
        db = self.Database
        playlistID = request.query_params.get('playlistID')
        try:
            query = ("SELECT * \
                      FROM songInPlaylist\
                      WHERE playlistID = %s")
            values = (playlistID,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to add comment")
            raise internalServerError()
    
    def getPlaylistID(self, data):
        db = self.Database
        try:
            query = ("SELECT playlistID\
                      FROM userPlaylist\
                      WHERE username = %s AND playlistName = %s")
            values = (data['username'], data['playlistName'],)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get playlistID")
            raise internalServerError()
    
    def addPlaylist(self, data):
        db = self.Database
        try:
            # add playlist
            query = ("INSERT INTO userPlaylist (username, playlistName)\
                      VALUES (%s, %s);")
            values = (data['username'], data['playlistName'],)
            db.query(query, values)
            # Retrieve the last inserted ID
            query = "SELECT LAST_INSERT_ID() AS playlistID"
            queryResult = db.query(query)
            return queryResult['result'][0]
        except Exception as e:
            logger.error("unable to add user playlist")
            raise internalServerError()
    
    def addSongToPlaylist(self, data):
        db = self.Database
        try:
            query = ("INSERT INTO songInPlaylist (playlistID, songID)\
                      VALUES (%s, %s)\
                      ON DUPLICATE KEY UPDATE \
                      playlistID = VALUES(playlistID),\
                      songID = VALUES(songID);")
            values = (data['playlistID'], data['songID'],)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to ad song to play list")
            raise internalServerError()
        
    def getFriendsList(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            query = ("select user2 AS username from friend\
                      where user1 = %s and acceptStatus = 'Accepted'\
                      union\
                      select user1 from friend\
                      where user2 = %s and acceptStatus = 'Accepted';")
            values = (username, username,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get user friend list")
            raise internalServerError()
        
    def getFollowingList(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            query = ("SELECT artist.artistID, artist.fname, artist.lname\
                      FROM userFanOfArtist\
                      JOIN artist ON userFanOfArtist.artistID = artist.artistID\
                      WHERE username = %s;")
            values = (username,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to add get user following list")
            raise internalServerError()
        
    def getUserList(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            query = ("SELECT username\
                      FROM user \
                      WHERE username LIKE %s\
                      ORDER BY username ASC\
                      LIMIT 10;")
            values = ('%' + username + '%',)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get query user list")
            raise internalServerError()
        
    def getArtistList(self, request):
        db = self.Database
        try:
            artistname = request.query_params.get('artistname')
            query = ("SELECT artistID, fname, lname\
                      FROM artist\
                      WHERE concat(artist.fname, ' ', artist.lname) LIKE %s\
                      ORDER BY concat(artist.fname, ' ', artist.lname) ASC\
                      LIMIT 10;")
            values = ('%' + artistname + '%',)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get query artist list")
            raise internalServerError()
        
    def getUser(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            query = ("SELECT username, fname, lname, lastlogin, nickname\
                      FROM user \
                      WHERE username = %s;")
            values = (username,)
            queryResult = db.query(query, values)
            return queryResult['result'][0]
        except Exception as e:
            logger.error("unable to get user by username")
            raise internalServerError()
        
    def getArtist(self, request):
        db = self.Database
        try:
            artistID = request.query_params.get('artistID')
            query = ("SELECT *\
                      FROM artist\
                      WHERE artistID = %s;")
            values = (artistID,)
            queryResult = db.query(query, values)
            return queryResult['result'][0]
        except Exception as e:
            logger.error("unable to get artist by artistID")
            raise internalServerError()
        
    def getFriendStatus(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            friendName = request.query_params.get('friendName')
            query = ("SELECT *\
                      FROM Friend\
                      WHERE (user1 = %s AND user2 = %s)\
                      OR (user1 = %s AND user2 = %s);")
            values = (username, friendName, friendName, username,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get friend status")
            raise internalServerError()
        
    def getFollowingStatus(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            artistID = request.query_params.get('artistID')
            query = ("SELECT *\
                      FROM userFanOfArtist\
                      WHERE username =%s AND artistID = %s;")
            values = (username, artistID,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get following status")
            raise internalServerError()
        
    def removeFriend(self, data):
        db = self.Database
        try:
            query = ("DELETE FROM friend WHERE user1 = %s and user2 = %s")
            values = (data['user1'], data['user2'],)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to add remove friend")
            raise internalServerError()
    
    def updateFriend(self, data):
        db = self.Database
        try:
            createdAt = "'{}'".format(data['createdAt']) if 'createdAt' in data.keys() else "CURRENT_TIMESTAMP"
            query = ("INSERT INTO friend (user1, user2, acceptStatus, requestSentBy, createdAt, updatedAt)\
                      VALUES (%s, %s, %s, %s, {}, CURRENT_TIMESTAMP)\
                      ON DUPLICATE KEY UPDATE \
                      acceptStatus = VALUES(acceptStatus), \
                      requestSentBy = VALUES(requestSentBy), \
                      createdAt = VALUES(createdAt), \
                      updatedAt = VALUES(updatedAt);".format(createdAt))
            values = (data['user1'], data['user2'], data['acceptStatus'], data['requestSentBy'],)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to update friend")
            raise internalServerError()
    
    def removeFollowing(self, data):
        db = self.Database
        try:
            query = ("DELETE FROM userFanOfArtist WHERE username = %s and artistID = %s")
            values = (data['username'], data['artistID'],)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to add remove following")
            raise internalServerError()
    
    def updateFollowing(self, data):
        db = self.Database
        try:
            query = ("INSERT INTO userFanOfArtist (username, artistID)\
                      VALUES (%s, %s)")
            values = (data['username'], data['artistID'],)
            db.query(query, values)
        except Exception as e:
            logger.error("unable to update following")
            raise internalServerError()
        
    def geNewFriendStatus(self, request):
        db = self.Database
        try:
            username = request.query_params.get('username')
            query = ("SELECT * FROM friend\
                      WHERE (user1 = %s OR user2 = %s)\
                      AND acceptStatus <> 'Not accepted'\
                      AND updatedAt > (SELECT lastlogin FROM user WHERE username = %s)")
            values = (username, username, username,)
            queryResult = db.query(query, values)
            return queryResult['result']
        except Exception as e:
            logger.error("unable to get new friend status")
            raise internalServerError()