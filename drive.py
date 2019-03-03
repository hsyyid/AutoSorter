from googleapiclient.discovery import build
from oauth2client.client import AccessTokenCredentials


def get_text(access_token, file_ids):
    creds = AccessTokenCredentials(access_token, 'my-user-agent/1.0')
    drive_service = build('drive', 'v3', credentials=creds)
    response = []
    should_return = False

    def callback(request_id, text, exception):
        if exception:
            # Handle error
            print(exception)
        else:
            print(response)
            response.append(text)

    batch = drive_service.new_batch_http_request(callback=callback)

    for file_id in file_ids:
        batch.add(drive_service.files().export(
            fileId=file_id,
            mimeType="text/plain",
            fields='id',
        ))
    pass

    batch.execute()

    while len(response) != len(file_ids):
        continue

    return response
