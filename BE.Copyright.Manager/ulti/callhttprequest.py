import requests
import os
from dotenv import load_dotenv
import ast

load_dotenv()

class CallHttpRequest:

    API = None

    def __init__(self) -> None:
        self.API = os.environ.get("APICONNECTDB")

    def CallHTTPGet(self, url, params):
        url = str(self.API) + str(url)
        r = requests.get(url = url, params = params)
        return r.json()

    def CallHTTPPost(self, url, data):
        url = str(self.API) + str(url)
        r = requests.post(url=url, json=data, headers={"Content-Type": 'application/json-patch+json'})
        result = r.text
        result = result.replace("true", "True").replace("false", "False")
        result = ast.literal_eval(result)
        return result