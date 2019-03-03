from googleapiclient.discovery import build
from oauth2client.client import AccessTokenCredentials


def get_text(access_token, file_ids):
    # text = []

    # try:
    creds = AccessTokenCredentials(access_token, 'my-user-agent/1.0')
    drive_service = build('drive', 'v3', credentials=creds)

    def callback(request_id, response, exception):
        if exception:
            # Handle error
            print(exception)
        else:
            print(response)
            # text.append(response)
            #
            # if len(text) == len(file_ids):
            #     raise Exception('test')

    batch = drive_service.new_batch_http_request(callback=callback)

    for file_id in file_ids:
        batch.add(drive_service.files().export(
            fileId=file_id,
            mimeType="text/plain",
            fields='id',
        ))
    pass

    batch.execute()
# except:
#     return text

# while len(response) != len(file_ids):
#     print(len(response))
#
# return response
