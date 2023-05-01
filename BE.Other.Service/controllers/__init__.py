from flask import Flask
from .copyrightcontroller import copyright

def create_app():
    app = Flask(__name__)
    app.register_blueprint(copyright)
    
    return app