from flask import Blueprint, request, make_response
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
import json
from bussiness.copyrightbl import CopyrightBL 


copyright = Blueprint("copyright", __name__)
cors = CORS(copyright, resources={r"/api/*": {"origins": "*"}})

oCopyrightBL = CopyrightBL()


@copyright.route("/copyright/check", methods=['POST'])
@cross_origin()
def checkCopyrightImage():
    _json = request.json
    base64Image = _json["image"]
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }

    result = oCopyrightBL.getSignInImage(base64Image)  
    if type(result) == bool:
        serviceResult["success"] = False
        serviceResult["error"] = "Image cannot be greyscale"
    else:
        serviceResult["data"] = str(result)
        
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")


@copyright.route("/copyright/accept", methods=['POST'])
@cross_origin()
def addCopyrightImage():
    _json = request.json
    base64Image = _json["image"]
    sign = _json["sign"] 
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }

    result = oCopyrightBL.embedWatermarking(base64Image, sign)  
    if result == None:
        serviceResult["success"] = False
        serviceResult["error"] = "Error"
    else:
        serviceResult["data"] = str(result)
        
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")


@copyright.route("/copyright/changesign", methods=['POST'])
@cross_origin()
def updateCopyrightImage():
    _json = request.json
    base64Image = _json["image"]
    sign = _json["sign"] 
    serviceResult = {
        "error" : "",
        "success": True,
        "data" : ""
    }

    result = oCopyrightBL.handleChangeSignInImage(base64Image, sign)  
    if result == None:
        serviceResult["success"] = False
        serviceResult["error"] = "Error"
    else:
        serviceResult["data"] = str(result)
        
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")