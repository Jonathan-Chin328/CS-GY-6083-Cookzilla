from fastapi import FastAPI, Request
import uvicorn
import os
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db.main import Database
from dotenv import load_dotenv
import service.authService as authService
import service.recipeService as recipeService
import service.songService as songService
import service.userService as userService
from errors.main import ExtendableError
from errors.internalServerError import InternalServerError
from errors.invalidToken import InvalidJwtError
from errors.userNotFound import UserNotFound


load_dotenv()

app = FastAPI()
app.debug = True  # Enable debug mode for auto-reloading

db = Database()

AuthService = authService.AuthService(db)
RecipeService = recipeService.RecipeService(db)
SongService = songService.SongService(db)
UserService = userService.UserService(db)


# Add allowed origins, methods, and headers
origins = ["http://localhost", "http://localhost:8081"]

# Create the middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup")
async def signupHandler(registrationData: authService.UserRegistration):
    try:
        user = AuthService.registerUser(registrationData)
        return user
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

@app.post("/login")
async def loginHandler(loginData: authService.LoginForm):
    try:
        user = AuthService.login(loginData)
        return user
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get songList according to condition
@app.get("/songs")
async def getSongs(request: Request):
    try:
        songs = SongService.getSongs(request)
        return songs
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get song information from songID
@app.get("/song")
async def getSong(request: Request):
    try:
        song = SongService.getSong(request)
        return song
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get song rating from songID & albumID
@app.get("/rating")
async def getRating(request: Request):
    try:
        ratingType = request.query_params.get('type')
        if ratingType == 'song':
            rating = SongService.getRatingBySongID(request)
        elif ratingType == 'album':
            rating = SongService.getRatingByAlbumID(request)
        return rating
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get song comments from songID
@app.get("/comments")
async def getRating(request: Request):
    try:
        ratingType = request.query_params.get('type')
        if ratingType == 'song':
            comments = SongService.getCommentsBySongID(request)
        elif ratingType == 'album':
            comments = SongService.getCommentsByAlbumID(request)
        return comments
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get song from albumID
@app.get("/album")
async def getAlbum(request: Request):
    try:
        songs = SongService.getAlbum(request)
        return songs
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get user from username
@app.get("/user")
async def getUser(request: Request):
    try:
        user = UserService.getUser(request)
        return user
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get artist from artistID
@app.get("/artist")
async def getArtist(request: Request):
    try:
        artist = UserService.getArtist(request)
        return artist
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

@app.middleware("http")
async def AuthMiddleWare(request: Request, call_next):
    try:
        if(request.url.path not in ['/signup', '/login', '/logout', '/songs', '/song', '/rating', '/comments', '/album', '/user', '/artist', '/rate', '/comment', '/user_playlist', '/playlist', '/addPlaylist', "/addSongToPlaylist", "/friends", "/following", "/users", "/artists", "/friendStatus", "/followingStatus", "/updateFriend", "/updateFollowing", "/uploadSong", "/notices"]):
        # if(request.url.path not in ['/signup', '/login', '/songs', '/song', '/rating', '/comments', '/album', '/user', '/artist']):
            authHeader = request.headers.get('Authorization')
            print('authHeader', authHeader)
            if authHeader is None:
                raise InvalidJwtError()
            tokenizedHeader = authHeader.split(' ')
            if len(tokenizedHeader) != 2:
                raise InvalidJwtError()
            token = tokenizedHeader[1]
            user = AuthService.getUserFromToken(token)
            request.state.user = user
        response = await call_next(request)
        return response
    except Exception as e:
        if not isinstance(e, ExtendableError):
            ex = InternalServerError()
            return JSONResponse(
                status_code=int(ex.code),
                content={'info': ex.info, 'code': int(ex.code), 'name': ex.name}
            )
        return JSONResponse(
            status_code=int(e.code),
            content={'info': e.info, 'code': int(e.code), 'name': e.name}
        )
    
@app.post("/logout")
async def logoutHandler(request: Request):
    try:
        data = await request.json()
        # update lastlogin time of user
        UserService.updateLastLogin(data)
        return {"message": "Log out succeed"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
        
@app.get("/user")
async def getUser(request: Request):
    try:
        if(request.state.user == None):
            raise UserNotFound()
        return request.state.user
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
@app.get("/user_playlist")
async def getUserPlaylist(request: Request):
    try:
        playlist = UserService.getUserPlaylist(request)
        return playlist
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
@app.get("/playlist")
async def getSongsByPlaylist(request: Request):
    try:
        songs = UserService.getSongsByPlaylist(request)
        return songs
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# add or update rating for song & album
@app.post("/rate")
async def updateRating(request: Request):
    try:
        data = await request.json()
        if data['type'] == 'song':
            SongService.updateSongRating(data)
        elif data['type'] == 'album':
            SongService.updateAlbumRating(data)
        return {"message": "Rating update successfully"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# add comment for song & album
@app.post("/comment")
async def updateComment(request: Request):
    try:
        data = await request.json()
        if data['type'] == 'song':
            SongService.updateSongComment(data)
        elif data['type'] == 'album':
            SongService.updateAlbumComment(data)
        return {"message": "Comment add successfully"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# add comment for song & album
@app.post("/addPlaylist")
async def addPlaylist(request: Request):
    try:
        data = await request.json()
        playlist = UserService.getPlaylistID(data)
        if playlist:
            return {"playlistID": None}
        else:
            playlistID = UserService.addPlaylist(data)
            print(playlistID)
            return playlistID
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# add comment for song & album
@app.post("/addSongToPlaylist")
async def addSongToPlaylist(request: Request):
    try:
        data = await request.json()
        UserService.addSongToPlaylist(data)
        return {"message": "addSongToPlaylist success"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get friends by user
@app.get("/friends")
async def getFriendsList(request: Request):
    try:
        friends = UserService.getFriendsList(request)
        print(friends)
        return friends
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get following by user
@app.get("/following")
async def getFollowingList(request: Request):
    try:
        following = UserService.getFollowingList(request)
        return following
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

# get userList by username
@app.get("/users")
async def getUserList(request: Request):
    try:
        users = UserService.getUserList(request)
        return users
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get artistList by username
@app.get("/artists")
async def getArtistList(request: Request):
    try:
        artist = UserService.getArtistList(request)
        return artist
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get friends Status
@app.get("/friendStatus")
async def getFriendStatus(request: Request):
    try:
        status = UserService.getFriendStatus(request)
        return status
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get gollowing Status
@app.get("/followingStatus")
async def getFollowingStatus(request: Request):
    try:
        status = UserService.getFollowingStatus(request)
        return status
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# update Friend
@app.post("/updateFriend")
async def updateFriend(request: Request):
    try:
        data = await request.json()
        if data['action'] == 'update':
            UserService.updateFriend(data)
        elif data['action'] == 'remove':
            UserService.removeFriend(data)
        return {"message": "updateFriend success"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

# update Friend
@app.post("/updateFollowing")
async def updateFriend(request: Request):
    try:
        data = await request.json()
        if data['action'] == 'follow':
            UserService.updateFollowing(data)
        elif data['action'] == 'unfollow':
            UserService.removeFollowing(data)
        return {"message": "updateFollowing success"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# get notices
@app.get("/notices")
async def getNotices(request: Request):
    try:
        # find song comments after lastlogin
        newSong = SongService.getNewSong(request)
        # find album comments after lastlogin
        newAlbumComment = SongService.getNewAlbumComment(request)
        # find new song after lastlogin
        newSongComment = SongService.getNewSongComment(request)
        # find new friend status after lastlogin (not include not accept)
        newFriendStatus = UserService.geNewFriendStatus(request)
        notices = {
            'newSong': newSong,
            'newAlbumComment': newAlbumComment,
            'newSongComment': newSongComment,
            'newFriendStatus': newFriendStatus
        }
        return notices
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e
    
# uploadSong
@app.post("/uploadSong")
async def updateFriend(request: Request):
    try:
        data = await request.json()
        print(data)
        # check artist exist

        # check album exist

        # insert the song
        return {"message": "uploadSong success"}
    except Exception as e:
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

@app.post("/recipe")
async def postRecipe(request: Request, recipeToAdd: recipeService.InsertRecipe):
    try:
        postedBy = request.state.user['userName']
        recipeToAdd.postedBy = postedBy
        postedRecipe = RecipeService.insertRecipe(recipeToAdd)
        return postedRecipe
    except Exception as e:
        print(e)
        if not isinstance(e, ExtendableError):
            raise InternalServerError()
        raise e

@app.exception_handler(ExtendableError)
async def exceptionHandler(request: Request, exc: ExtendableError):
    return JSONResponse(
        status_code=int(exc.code),
        content={'info': exc.info, 'code': int(exc.code), 'name': exc.name}
    )


if __name__ == "__main__":
    # uvicorn.run(app, host="0.0.0.0", port=int(os.environ['PORT']))
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ['PORT']), reload=True, workers=1, loop="asyncio")  # Enable debug mode for auto-reloading