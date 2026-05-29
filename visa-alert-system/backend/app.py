from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
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

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# DB
# =========================
db = SQLAlchemy(app)

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
    created_by = db.Column(db.String(100))

# =========================
# CREATE DB
# =========================
with app.app_context():
    db.drop_all()


    # =========================
# DEBUG ERROR HANDLER
# =========================
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        "error": str(e)
    }), 500

# =========================
# HOME
# =========================
@app.route("/")
def home():
    return jsonify({
        "message": "Visa SaaS Backend Running"
    })

# =========================
# GET GUESTS
# =========================
@app.route("/guests", methods=["GET"])
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

# =========================
# ADD GUEST
# =========================
@app.route("/guests", methods=["POST"])
def add_guest():

    name = request.form.get("name")
    visa_expiry = request.form.get("visa_expiry")
    branch = request.form.get("branch")

    passport_image = request.files.get("passport_image")
    visa_image = request.files.get("visa_image")

    passport_filename = ""
    visa_filename = ""

    # passport
    if passport_image:
        passport_filename = secure_filename(passport_image.filename)

        passport_image.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                passport_filename
            )
        )

    # visa
    if visa_image:
        visa_filename = secure_filename(visa_image.filename)

        visa_image.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                visa_filename
            )
        )

    new_guest = Guest(
        name=name,
        visa_expiry=visa_expiry,
        branch=branch,
        passport_image=passport_filename,
        visa_image=visa_filename,
        created_by="admin"
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
def update_guest(id):

    guest = Guest.query.get(id)

    if not guest:
        return jsonify({
            "error": "Guest not found"
        }), 404

    guest.name = request.form.get("name")
    guest.visa_expiry = request.form.get("visa_expiry")
    guest.branch = request.form.get("branch")

    passport_image = request.files.get("passport_image")
    visa_image = request.files.get("visa_image")

    if passport_image:

        filename = secure_filename(
            passport_image.filename
        )

        passport_image.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )
        )

        guest.passport_image = filename

    if visa_image:

        filename = secure_filename(
            visa_image.filename
        )

        visa_image.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )
        )

        guest.visa_image = filename

    db.session.commit()

    return jsonify({
        "message": "Updated successfully"
    })

# =========================
# DELETE GUEST
# =========================
@app.route("/guests/<int:id>", methods=["DELETE"])
def delete_guest(id):

    guest = Guest.query.get(id)

    if not guest:
        return jsonify({
            "error": "Guest not found"
        }), 404

    db.session.delete(guest)
    db.session.commit()

    return jsonify({
        "message": "Deleted successfully"
    })

# =========================
# UPLOADS
# =========================
@app.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)