from flask import Blueprint, request
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
import json
from bussiness.testbl import TestBL

test = Blueprint("test", __name__)
cors = CORS(test, resources={r"/api/*": {"origins": "*"}})

oBL = TestBL()

@test.route("/test", methods=['GET'])
@cross_origin()
def testDB():
    result = json.dumps("Connected", ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")

@test.route("/test/image/getall", methods=['GET'])
@cross_origin()
def testGetAllImage():
    result = oBL.getAllImage()
    result = json.dumps(result, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")


@test.route("/test/check/sign/exist", methods=['POST'])
@cross_origin()
def CheckExistSign():
    param = request.json
    result = oBL.checkExistSign(param["lstSign"])
    result = json.dumps(result, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")