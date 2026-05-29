from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
import os

# =========================
# APP INIT
# =========================
app = Flask(__name__)
CORS(app)

# =========================
# CONFIG
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# EXTENSIONS
# =========================
db = SQLAlchemy(app)
jwt = JWTManager(app)

# =========================
# SIMPLE USERS (SAU NÀY NÂNG CẤP DB)
# =========================
users = [
    {"id": 1, "username": "admin", "password": "123456"},
    {"id": 2, "username": "reception1", "password": "123456"}
]

# =========================
# DATABASE MODEL
# =========================
class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    visa_expiry = db.Column(db.String(50))
    branch = db.Column(db.String(100))
    passport_image = db.Column(db.String(200))
    visa_image = db.Column(db.String(200))
    created_by = db.Column(db.String(100))  # 🔥 SAAS FEATURE

# =========================
# CREATE DB
# =========================
with app.app_context():
    db.create_all()

# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user = next(
        (u for u in users
         if u["username"] == data.get("username")
         and u["password"] == data.get("password")),
        None
    )

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=user["username"])

    return jsonify({"token": token, "user": user["username"]})

# =========================
# GET GUESTS
# =========================
@app.route("/guests", methods=["GET"])
@jwt_required()
def get_guests():
    guests = Guest.query.all()

    return jsonify([
        {
            "id": g.id,
            "name": g.name,
            "visa_expiry": g.visa_expiry,
            "branch": g.branch,
            "passport_image": g.passport_image,
            "visa_image": g.visa_image,
            "created_by": g.created_by
        }
        for g in guests
    ])
@app.route("/")
def home():
    return jsonify({
        "message": "Visa SaaS Backend Running"
    })

# =========================
# ADD GUEST
# =========================
@app.route("/guests", methods=["POST"])
@jwt_required()
def add_guest():
    current_user = get_jwt_identity()

    name = request.form.get("name")
    visa_expiry = request.form.get("visa_expiry")
    branch = request.form.get("branch")

    passport_image = request.files.get("passport_image")
    visa_image = request.files.get("visa_image")

    passport_filename = ""
    visa_filename = ""

    # save passport
    if passport_image:
        passport_filename = secure_filename(passport_image.filename)
        passport_image.save(os.path.join(app.config["UPLOAD_FOLDER"], passport_filename))

    # save visa
    if visa_image:
        visa_filename = secure_filename(visa_image.filename)
        visa_image.save(os.path.join(app.config["UPLOAD_FOLDER"], visa_filename))

    new_guest = Guest(
        name=name,
        visa_expiry=visa_expiry,
        branch=branch,
        passport_image=passport_filename,
        visa_image=visa_filename,
        created_by=current_user
    )

    db.session.add(new_guest)
    db.session.commit()

    return jsonify({
        "message": "Guest added successfully",
        "id": new_guest.id
    })

# =========================
# UPDATE GUEST
# =========================
@app.route("/guests/<int:id>", methods=["PUT"])
@jwt_required()
def update_guest(id):
    guest = Guest.query.get(id)

    if not guest:
        return jsonify({"error": "Guest not found"}), 404

    guest.name = request.form.get("name")
    guest.visa_expiry = request.form.get("visa_expiry")
    guest.branch = request.form.get("branch")

    passport_image = request.files.get("passport_image")
    visa_image = request.files.get("visa_image")

    if passport_image:
        filename = secure_filename(passport_image.filename)
        passport_image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        guest.passport_image = filename

    if visa_image:
        filename = secure_filename(visa_image.filename)
        visa_image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        guest.visa_image = filename

    db.session.commit()

    return jsonify({"message": "Updated successfully"})

# =========================
# DELETE GUEST
# =========================
@app.route("/guests/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_guest(id):
    guest = Guest.query.get(id)

    if not guest:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(guest)
    db.session.commit()

    return jsonify({"message": "Deleted successfully"})

# =========================
# UPLOAD FILES
# =========================
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)