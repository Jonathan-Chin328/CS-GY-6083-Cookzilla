import mysql.connector
import logging as logger
import os
import traceback

class Database:
  __instance : mysql.connector.MySQLConnection = None

  RecipeTable = "Recipe"
  UserTable = "user"
  RateSongTable = "rateSong"

  def __init__(self):
      if self.__instance is None or self.__instance.is_connected() == False:
        self.__instance = mysql.connector.connect(
                port='8889',
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER_ID', "root"),
                password=os.getenv('DB_USER_PASSWORD', "root"),
                database=os.getenv('DB_NAME', "FlaskDemo"),
            )

  def query(self, queryString="", params=()):
    try:
      cursor = self.__instance.cursor()
      cursor.execute(queryString, params)
      rows = cursor.fetchall()
      operation = cursor.lastrowid
      description = cursor.description
      fields = []
      if description is not None:
        fields = [field_md[0] for field_md in cursor.description]
      cursor.close()
      result = [dict(zip(fields, row)) for row in rows]
      return { "result": result, "insertId": None if operation is 0 else operation }
    except Exception as e:
      logger.error("Error in DB Query: %s\n %s", e, traceback.format_exception(e))
      raise e
    finally:
      self.__instance.commit()
