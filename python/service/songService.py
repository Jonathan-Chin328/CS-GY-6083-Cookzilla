from db.main import Database
import jwt
import os
import logging as logger
import datetime
from errors import internalServerError

class SongService():

  def __init__(self, db: Database):
    self.Database = db


  def getGenre(self):
      db = self.Database
      try:
          query = ("SELECT distinct genre from songGenre")
          queryResult = db.query(query)
          return queryResult['result']
      except Exception as e:
          logger.error("unable to get genre")
          raise internalServerError()

  def getSongs(self, request):
    db = self.Database
    params = request.query_params
    query = "select song.songID, AVG(rateSong.stars) AS avg_rating\
							from song\
							LEFT JOIN rateSong ON song.songID = rateSong.songID\
							JOIN artistPerformsSong ON song.songID = artistPerformsSong.songID\
							JOIN artist ON artistPerformsSong.artistID = artist.artistID\
							JOIN songGenre ON song.songID = songGenre.songID\
              JOIN songInAlbum ON song.songID = songInAlbum.songID "
    # decide search type (song or artist)
    if params.get("searchType") == 'song':
      query += "WHERE song.title LIKE '%{}%' ".format(params.get('searchQuery'))
    elif params.get("searchType") == 'artist':
      query += "WHERE concat(artist.fname, \" \", artist.lname) LIKE '%{}%' ".format(params.get('searchQuery'))
    elif params.get("searchType") == 'album':
      query += "WHERE songInAlbum.albumID LIKE '%{}%' ".format(params.get('searchQuery'))
    # filter genre
    if params.get('genre'):
      query += "AND songGenre.genre = \"{}\" ".format(params.get('genre'))
    # filter rating
    query += "GROUP BY song.songID "
    if int(params.get('minRating', 0)):
        query += " HAVING AVG(rateSong.stars) >= {} ".format(params.get('minRating', 0))
    # order with Lexicographic
    if params.get('searchQuery') != '':
      if params.get("searchType") == 'song':
        query += "ORDER BY song.title DESC "
      elif params.get("searchType") == 'artist':
        query += "ORDER BY avg_rating DESC "
      elif params.get("searchType") == 'album':
        query += "ORDER BY avg_rating DESC "
      query += "LIMIT 10;"
    # order with rating
    else:
      query += "ORDER BY avg_rating DESC\
                LIMIT 10;"
    try:
      print(query)
      queryResult = db.query((query))
      print(queryResult)
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get songs")
      raise internalServerError()

  def getSong(self, request):
    db = self.Database
    songID = request.query_params.get('songID')
    try:
      # Process queryResult and return the response
      queryResult = db.query(
        ("SELECT song.songID, song.title, song.releaseDate, song.songURL, artist.artistID, artist.fname, artist.lname, songInAlbum.albumID\
            FROM song\
            JOIN artistPerformsSong ON song.songID = artistPerformsSong.songID\
            JOIN songInAlbum ON song.songID = songInAlbum.songID\
            JOIN artist ON artistPerformsSong.artistID = artist.artistID\
            WHERE song.songID = \"" + songID + "\";")
      )
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get song")
      raise internalServerError()

  def getRatingBySongID(self, request):
    db = self.Database
    songID = request.query_params.get('ID')
    try:
      queryResult = db.query(
        ("SELECT songID, AVG(rateSong.stars) AS avg_rating\
          FROM rateSong\
          WHERE songID = \"" + songID + "\"\
          GROUP BY songID")
      )
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get rating")
      raise internalServerError()

  def getCommentsBySongID(self, request):
    db = self.Database
    songID = request.query_params.get('ID')
    try:
      queryResult = db.query(
        ("SELECT * \
          FROM reviewSong\
          WHERE songID = \"" + songID + "\"\
          ORDER BY reviewDate DESC")
      )
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get comments")
      raise internalServerError()

  def updateSongRating(self, data):
    db = self.Database
    try:
      query = ("INSERT INTO rateSong (username, songID, stars, ratingDate)\
              VALUES (%s, %s, %s, CURRENT_TIMESTAMP)\
              ON DUPLICATE KEY UPDATE \
              stars = VALUES(stars), \
              ratingDate = VALUES(ratingDate);")
      values = (data['username'], data['ID'], data['rating'])
      db.query(query, values)
    except Exception as e:
      logger.error("unable to update rating")
      raise internalServerError()

  def updateSongComment(self, data):
    db = self.Database
    try:
      query = ("INSERT INTO reviewSong (username, songID, reviewText, reviewDate)\
              VALUES (%s, %s, %s, CURRENT_TIMESTAMP)\
              ON DUPLICATE KEY UPDATE \
              reviewText = VALUES(reviewText), \
              reviewDate = VALUES(reviewDate);")
      values = (data['username'], data['ID'], data['reviewText'])
      db.query(query, values)
    except Exception as e:
      logger.error("unable to add comment")
      raise internalServerError()

  # album part
  def getAlbum(self, request):
    db = self.Database
    albumID = request.query_params.get('albumID')
    try:
      query = ("SELECT songID\
                FROM songInAlbum\
                WHERE albumID = %s")
      values = (albumID,)
      queryResult = db.query(query, values)
      return queryResult['result']
    except Exception as e:
      logger.error("unable to add comment")
      raise internalServerError()

  def getRatingByAlbumID(self, request):
    db = self.Database
    albumID = request.query_params.get('ID')
    try:
      queryResult = db.query(
        ("SELECT albumID, AVG(rateAlbum.stars) AS avg_rating\
          FROM rateAlbum\
          WHERE albumID = \"" + albumID + "\"\
          GROUP BY albumID")
      )
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get rating")
      raise internalServerError()

  def getCommentsByAlbumID(self, request):
    db = self.Database
    albumID = request.query_params.get('ID')
    try:
      queryResult = db.query(
        ("SELECT * \
          FROM reviewAlbum\
          WHERE albumID = \"" + albumID + "\"\
          ORDER BY reviewDate DESC")
      )
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get comments")
      raise internalServerError()

  def updateAlbumRating(self, data):
    db = self.Database
    try:
      query = ("INSERT INTO rateAlbum (username, albumID, stars, ratingDate)\
              VALUES (%s, %s, %s, CURRENT_TIMESTAMP)\
              ON DUPLICATE KEY UPDATE \
              stars = VALUES(stars), \
              ratingDate = VALUES(ratingDate);")
      values = (data['username'], data['ID'], data['rating'])
      db.query(query, values)
    except Exception as e:
      logger.error("unable to update rating")
      raise internalServerError()

  def updateAlbumComment(self, data):
    db = self.Database
    try:
      query = ("INSERT INTO reviewAlbum (username, albumID, reviewText, reviewDate)\
              VALUES (%s, %s, %s, CURRENT_TIMESTAMP)\
              ON DUPLICATE KEY UPDATE \
              reviewText = VALUES(reviewText), \
              reviewDate = VALUES(reviewDate);")
      values = (data['username'], data['ID'], data['reviewText'])
      db.query(query, values)
    except Exception as e:
      logger.error("unable to add comment")
      raise internalServerError()

  def getNewSong(self, request):
    db = self.Database
    username = request.query_params.get('username')
    try:
      query = ("SELECT *, artist.fname, artist.lname\
                FROM song \
                JOIN artistPerformsSong on artistPerformsSong.songID = song.songID\
                JOIN artist on artist.artistID = artistPerformsSong.artistID\
                WHERE artistPerformsSong.artistID in (\
                    SELECT artistID FROM userFanOfArtist WHERE username = %s\
                )\
                AND releaseDate > (SELECT lastlogin FROM user WHERE username = %s)\
                ORDER BY releaseDate DESC;")
      values = (username, username)
      queryResult = db.query(query, values)
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get new song")
      raise internalServerError()

  def getNewSongComment(self, request):
    db = self.Database
    username = request.query_params.get('username')
    try:
      query = ("SELECT *\
                FROM reviewSong\
                where username in (\
                  select follows from follows where follows.follower = %s \
                  union select user2 from friend where user1 = %s and acceptStatus = 'accepted' \
                  union select user1 from friend where user2 = %s  and acceptStatus = 'accepted'\
                )\
                AND reviewDate > (SELECT lastlogin FROM `user` WHERE username = %s)\
                AND username <> %s\
                ORDER BY reviewDate DESC;")
      values = (username, username, username, username, username)
      queryResult = db.query(query, values)
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get new song comments")
      raise internalServerError()

  def getNewAlbumComment(self,request):
    db = self.Database
    username = request.query_params.get('username')
    try:
      query = ("SELECT *\
                FROM reviewAlbum\
                where username in (\
                  select follows from follows where follows.follower = %s \
                  union select user2 from friend where user1 = %s and acceptStatus = 'accepted' \
                  union select user1 from friend where user2 = %s  and acceptStatus = 'accepted'\
                )\
                AND reviewDate > (SELECT lastlogin FROM `user` WHERE username = %s)\
                AND username <> %s\
                ORDER BY reviewDate DESC;")
      values = (username, username, username, username, username)
      queryResult = db.query(query, values)
      return queryResult['result']
    except Exception as e:
      logger.error("unable to get new album comments")
      raise internalServerError()

