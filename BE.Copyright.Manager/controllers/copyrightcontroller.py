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

api_key = 'd2c9c54fff0611edbd2a34e6d760b36f'

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

@copyright.route("/copyright/add", methods=['POST'])
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
    if type(result) == dict and result["error"] == "Image has similar":
        serviceResult["error"] = "Image has similar"
        serviceResult["success"] = False
        serviceResult["data"] = result["data"]

    elif result == "Sign invalid" or result == "Image is not size enough" or result == "Image was had sign" or result == "Image cannot be greyscale":
        serviceResult["error"] = result
        serviceResult["success"] = False
    
    else:
        serviceResult["data"] = str(result)
    
    serviceResult = json.dumps(serviceResult, ensure_ascii=False)
    return Response(response=serviceResult, status=200, mimetype="application/json")
