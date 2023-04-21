from flask import Blueprint, request, make_response
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
import json
from bussiness.copyrightbl import CopyrightBL 


copyright = Blueprint("copyright", __name__)
cors = CORS(copyright, resources={r"/api/*": {"origins": "*"}})

oCopyrightBL = CopyrightBL()

@copyright.route("/copyright/add", methods=['POST'])
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
    if result == "Sign invalid" or result == "Image is not size enough" or result == "Image was had sign" or result == "Image has similar":
        serviceResult["error"] = result
        serviceResult["success"] = False
    
    else:
        serviceResult["data"] = result
    
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")


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
    serviceResult["data"] = result
        
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")