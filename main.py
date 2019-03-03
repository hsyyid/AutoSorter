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
    # Get text from Google Drive
    res = drive.get_text(request_json['access_token'], request_json['file_ids'])
    # Analyze via ML
    labels, data = Sorting.analyze(res, request_json['subjects'])
    return make_response(jsonify(labels=labels, data=data), 200)
