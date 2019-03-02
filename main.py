import Sorting


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
    if request.args and 'test' in request.args:
        return [1, 2, 3]
    else:
        return Sorting.analyze(request_json['message'], request_json['subjects'])
