import Sorting
import drive
from flask import make_response, jsonify


def sort(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    request_json = request.get_json()

    if request.args and 'text' in request.args:
        converted = drive.get_text(request_json['access_token'], request_json['file_ids'])
        return make_response(jsonify(text=converted), 200)
    else:
        return make_response(jsonify(labels=Sorting.analyze(request_json['message'], request_json['subjects'])), 200)
