import Sorting
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
    return make_response(jsonify(labels=Sorting.analyze(request_json['message'], request_json['subjects'])), 200)
