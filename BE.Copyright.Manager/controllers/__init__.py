from flask import Flask
from .testcontroller import test

def create_app():
    app = Flask(__name__)
    app.register_blueprint(test)

    return app