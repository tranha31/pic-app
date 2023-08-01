from flask import Blueprint, request
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
from business.blcopyright import BLCopyright
import json


main = Blueprint("test", __name__)
cors = CORS(main, resources={r"/api/*": {"origins": "*"}})

oBL = BLCopyright()

@main.route("/copyright/check/exist", methods=['POST'])
@cross_origin()
def CheckExistSign():
    param = request.json
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }
    serviceResult["data"] = oBL.checkExistSign(param)
    result = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")

@main.route("/copyright/check", methods=['POST'])
@cross_origin()
def CheckExistSignForCheck():
    param = request.json
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }
    serviceResult["data"] = oBL.checkExistSignForCheck(param)
    result = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")

@main.route("/copyright/images", methods=['GET'])
@cross_origin()
def GetAllImage():
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }
    serviceResult["data"] = oBL.getAllImage()
    result = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")

@main.route("/copyright/image/content", methods=['POST'])
@cross_origin()
def GetImageContent():
    param = request.json
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }
    serviceResult["data"] = oBL.getImageContent(param)
    result = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=result, status=200, mimetype="application/json")