from flask import Blueprint
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
import json


test = Blueprint("test", __name__)
cors = CORS(test, resources={r"/api/*": {"origins": "*"}})

@test.route("/test", methods=['GET'])
@cross_origin()
def testDB():
    result = json.dumps("Connected", ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")