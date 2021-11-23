from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy 
from flask_marshmallow import Marshmallow 
from flask_cors import CORS, cross_origin
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

import os
import json

#Init app
app = Flask(__name__)
cors = CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "dfgi0ujdofgodfgdfgdifghp87y6345urt9urstp9yu7986y"
jwt = JWTManager(app)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Init Database
db = SQLAlchemy(app)
#Init ma
ma = Marshmallow(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    image = db.Column(db.String)
    price = db.Column(db.Float)
    category = db.Column(db.String)
    rating = db.Column(db.Float)

    def __init__(self, name, image, price, category, rating):
        self.name = name
        self.image = image
        self.price = price
        self.category = category
        self.rating = rating

#Product Schema
class ProductSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'price', 'category', 'rating')

#Init Schema
products_schema = ProductSchema()
products_schema = ProductSchema(many=True)

@app.route("/login", methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    if email != "test" or password != "test":
        return json.dumps({"success": False, "message": "Bad Request"})

    access_token = create_access_token(identity=email)
    return json.dumps({"success": True, "access_token": access_token})


@app.route('/product', methods=['POST'])
@jwt_required()
def add_product():
    try:
        name = request.json['name']
        image = request.json['image']
        price = request.json['price']
        category = request.json['category']
        rating = request.json['rating']

        new_product = Product(name, image, price, category, rating)

        db.session.add(new_product)
        db.session.commit()
        return json.dumps({"name": new_product.name, "image": new_product.image, "price": new_product.price, "category": new_product.category, "rating": new_product.rating})
    except Exception:
        return json.dumps({
            'success': False,
            'error': "An error occurred"
        }), 500

@app.route('/', methods=['GET'])
def get_product():
    try:
        all_products = Product.query.all()
        result = products_schema.dump(all_products)
        print(jsonify(result))
        return json.dumps({"success": True, "response": result})
    except Exception:
        return json.dumps({
            'success': False,
            'error': "An error occurred"
        }), 500

@app.route('/search/<key>', methods=['GET'])
def search_product(key):
    try:
        key = "%{}%".format(key)
        all_products = Product.query.filter(Product.name.like(key)).all()
        result = products_schema.dump(all_products)
        return json.dumps({"success": True, "response": result})
    except Exception:
        return json.dumps({
            'success': False,
            'error': "An error occurred"
        }), 500

@app.route('/product/<id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    try:
        product = Product.query.get(id)

        name = request.json['name']
        image = request.json['image']
        price = request.json['price']
        category = request.json['category']
        rating = request.json['rating']

        product.name = name
        product.image = image
        product.price = price
        product.category = category
        product.rating = rating

        db.session.commit()

        return json.dumps({"name": product.name, "image": product.image, "price": product.price, "category": product.category, "rating": product.rating})
    except Exception:
        return json.dumps({
            'success': False,
            'error': "An error occurred"
        }), 500


@app.route('/product/<id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    try:
        product = Product.query.get(id)

        db.session.delete(product)

        db.session.commit()

        return json.dumps({"name": product.name, "image": product.image, "price": product.price, "category": product.category, "rating": product.rating})
    except Exception:
        return json.dumps({
            'success': False,
            'error': "An error occurred"
        }), 500


@app.errorhandler(500)
def servererror(error):
    return jsonify({
                    "success": False,
                    "error": 500,
                    }), 500


@app.errorhandler(400)
def unprocessable(error):

    return jsonify({
        "success": False,
        "error": 400,
        "message": "Check the body request"
    }), 400


@app.errorhandler(401)
def unauthorized(error):

    return jsonify({
        "success": False,
        "error": 401,
        "message": "Unauthorized"
    }), 401

@app.errorhandler(404)
def resource_not_found(error):
    return jsonify({
        "success": False,
        "error": 404,
        "message": "resource not found"
    }), 404

if __name__ == '__main__':
    app.run(debug=True)