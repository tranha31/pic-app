from functools import wraps
from flask import Blueprint, jsonify, request, make_response
from flask.wrappers import Response
from flask_cors import CORS
from flask_cors.decorator import cross_origin
import json
from bussiness.copyrightbl import CopyrightBL 


copyright = Blueprint("copyright", __name__)
cors = CORS(copyright, resources={r"/api/*": {"origins": "*"}})

oCopyrightBL = CopyrightBL()

api_key = 'cc99c900ff0711edbd2a34e6d760b36f'

def secret_key_require(f):
    @wraps(f)
    def check_secret_key(*args, **kwargs):
        try:
            key = request.headers['x-api-key']

            if key != api_key:
                return jsonify({'message': 'Invalid Api Key'})
        except:
            return jsonify({'message': 'Api Key is missing'})
        
        return f(*args, **kwargs)
    
    return check_secret_key

@copyright.route("/copyright/check", methods=['POST'])
@cross_origin()
@secret_key_require
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
@secret_key_require
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
@secret_key_require
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