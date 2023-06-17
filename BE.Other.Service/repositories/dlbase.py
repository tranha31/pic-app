from matplotlib.pyplot import connect
import mysql.connector
from mysql.connector import Error
from pymysql import NULL
import json
import os
from dotenv import load_dotenv
import pymongo
from pymongo import MongoClient

load_dotenv()

class DLBase:

    config = {}
    conn = None
    dbMongo = None
    def __init__(self) -> None:
        self.config = {
            'user': os.environ.get("USER"),
            'password': os.environ.get("PASSWORD"),
            'host': os.environ.get("HOST"),
            'database': os.environ.get("DATABASE"),
            'port' : os.environ.get("PORT"),
            'raise_on_warnings': True
        }
        self.conn = mysql.connector.connect(**self.config)
        cluster = MongoClient('122.248.208.192', 27017)
        self.dbMongo = cluster[os.environ.get("REPO")]
