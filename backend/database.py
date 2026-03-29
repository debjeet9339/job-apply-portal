from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

user_collection = db['users']
job_collection = db['jobs']
application_collection = db['applications']
